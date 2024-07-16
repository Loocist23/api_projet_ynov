import express from 'express';
import cors from 'cors';
import PocketBase, { ClientResponseError } from 'pocketbase';
import multer from 'multer';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import axios from "axios";

const router = express.Router();

// Configuration CORS pour autoriser toutes les origines
router.use(cors());

// Initialiser PocketBase
const pb = new PocketBase('https://pocketbase.0shura.fr');

// Désactiver l'auto-cancellation
pb.autoCancellation(false);

// Configuration de multer pour la gestion des fichiers
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route pour obtenir une liste paginée avec recherche et tri
router.get('/paginated', async (req, res) => {
  const { page = 1, search = '', sort = '' } = req.query;

  try {
    const queryOptions = {
      page: parseInt(page),
      perPage: 30,
      filter: search ? `username ~ "${search}" || email ~ "${search}"` : '',
      sort
    };

    const response = await pb.collection('users').getList(queryOptions.page, queryOptions.perPage, {
      filter: queryOptions.filter,
      sort: queryOptions.sort,
    });
    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).send('Erreur de connexion avec PocketBase');
  }
});

// Route pour obtenir tous les enregistrements
router.get('/all', async (req, res) => {
  try {
    const response = await pb.collection('users').getList(1, 1000, {
      sort: '-created'
    });
    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).send('Erreur de connexion avec PocketBase');
  }
});

// Route pour supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer l'utilisateur
    await pb.collection('users').delete(id);

    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    if (error instanceof ClientResponseError && error.response.code === 400) {
      // Gestion spécifique de l'erreur 400
      console.error('Impossible de supprimer l\'enregistrement. Assurez-vous que l\'enregistrement ne fait pas partie d\'une référence de relation requise.');
    }
    res.status(500).send('Erreur lors de la suppression de l’utilisateur');
  }
});

// Route pour obtenir un enregistrement unique
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await pb.collection('users').getOne(id, {
      expand: 'favorite_auctions'
    });
    res.json(record);
  } catch (error) {
    if (error instanceof ClientResponseError) {
      console.error(`Erreur lors de la récupération de l'enregistrement: ${error.message}`);
      res.status(500).send(`Erreur de connexion avec PocketBase: ${error.message}`);
    } else {
      console.error('Erreur lors de la récupération de l\'enregistrement:', error);
      res.status(500).send('Erreur de connexion avec PocketBase');
    }
  }
});

// Route pour mettre à jour un enregistrement
router.put('/:id', upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;

    // Préparer les données de mise à jour
    const updateData = {};

    // Ajouter les champs du corps de la requête à updateData
    for (const [key, value] of Object.entries(req.body)) {
      if (key === 'favorite_auctions_add') {
        updateData['favorite_auctions+'] = JSON.parse(value);
      } else if (key === 'favorite_auctions_remove') {
        updateData['favorite_auctions-'] = JSON.parse(value);
      } else {
        updateData[key] = value;
      }
    }

    // Ajouter les fichiers à updateData
    if (req.file) {
      updateData['avatar'] = new Blob([req.file.buffer], { type: req.file.mimetype });
    }

    // Utiliser pb.collection.update pour mettre à jour l'enregistrement
    const updatedRecord = await pb.collection('users').update(id, updateData);
    res.json(updatedRecord);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'enregistrement:', error);
    if (error instanceof ClientResponseError) {
      console.error(`ClientResponseError: ${error.message}`);
      res.status(500).send(`Erreur de connexion avec PocketBase: ${error.message}`);
    } else {
      console.error('Erreur générale:', error);
      res.status(500).send('Erreur de connexion avec PocketBase');
    }
  }
});

// Route pour obtenir l'URL de l'avatar
router.get('/:id/avatar', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await pb.collection('users').getOne(id);
    if (record.avatar) {
      const avatarUrl = pb.files.getUrl(record, record.avatar);
      res.redirect(avatarUrl);
    } else {
      res.status(404).send('Avatar not found');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'avatar:', error);
    res.status(500).send('Erreur de connexion avec PocketBase');
  }
});

// Route pour générer 20 utilisateurs aléatoires
router.post('/generate-random-users', async (req, res) => {
  try {
    const imagePath = 'C:/Users/moi/WebstormProjects/api_projet_ynov/aa.jpg'; // Chemin vers votre image par défaut
    const imageBuffer = fs.readFileSync(imagePath);

    for (let i = 0; i < 20; i++) {
      const formData = new FormData();
      formData.append('username', faker.internet.userName());
      formData.append('email', faker.internet.email());
      formData.append('emailVisibility', true);
      formData.append('password', 'password123');
      formData.append('passwordConfirm', 'password123');
      formData.append('birthdate', faker.date.past({ years: 20, refDate: new Date() }).toISOString().split('T')[0]);
      formData.append('role', 'user');
      formData.append('avatar', new Blob([imageBuffer], { type: 'image/jpeg' }), 'avatar.jpg');

      await pb.collection('users').create(formData);
    }

    res.status(200).send('20 utilisateurs générés avec succès');
  } catch (error) {
    console.error('Erreur lors de la génération des utilisateurs:', error);
    res.status(500).send('Erreur lors de la génération des utilisateurs');
  }
});

// Route pour obtenir les favoris d'un utilisateur
router.get('/:id/favorites', async (req, res) => {
  try {
    const { id } = req.params;
    const resultList = await pb.collection('favorites').getList(1, 50, {
      filter: `User="${id}"`,
      expand: 'Auction'
    });
    res.json(resultList);
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    res.status(500).send('Erreur lors de la récupération des favoris');
  }
});

// Route pour envoyer une notification
router.post('/send-notification', async (req, res) => {
  const { playerId, message } = req.body;

  try {
    const response = await axios.post('https://onesignal.com/api/v1/notifications', {
      app_id: 'd2a1db7e-1047-4cff-8d49-66a201075192',
      include_player_ids: [playerId],
      headings: { en: 'Notification' },
      contents: { en: message },
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic MzI2NjE0MmMtMzM0Ny00YjcwLWI4NzgtZDlkNTk5ZjM2MTE3',
      },
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour créer un nouvel utilisateur
router.post('/create', upload.single('avatar'), async (req, res) => {
  try {
    const { username, email, emailVisibility, password, passwordConfirm, birthdate, role, playerId } = req.body;

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('emailVisibility', emailVisibility);
    formData.append('password', password);
    formData.append('passwordConfirm', passwordConfirm);
    formData.append('birthdate', birthdate);
    formData.append('role', role);
    if (playerId) {
      formData.append('playerId', playerId);
    }
    if (req.file) {
      formData.append('avatar', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
    }

    const record = await pb.collection('users').create(formData);
    await pb.collection('users').requestVerification(email);

    res.status(201).json(record);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).send('Erreur lors de la création de l\'utilisateur');
  }
});

export default router;
