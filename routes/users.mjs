import express from 'express';
import cors from 'cors';
import PocketBase, { ClientResponseError } from 'pocketbase';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch'; // Assurez-vous que node-fetch est installé

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

// Route pour obtenir une liste paginée
router.get('/paginated', async (req, res) => {
  try {
    const response = await pb.collection('users').getList(1, 30);
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
    await pb.collection('users').delete(id);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).send('Erreur lors de la suppression de l’utilisateur');
  }
});

// Route pour obtenir un enregistrement unique
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await pb.collection('users').getOne(id, {
      expand: 'relField1,relField2.subRelField'
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
      updateData['avatar'] = req.file;
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

export default router;
