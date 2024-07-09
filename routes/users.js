var express = require('express');
var cors = require('cors');
var axios = require('axios');
var router = express.Router();

// Configuration CORS pour autoriser toutes les origines
// Pour un environnement de production, remplacez '*' par l'origine spécifique de votre front-end
router.use(cors());

// Route pour obtenir une liste paginée
router.get('/paginated', async (req, res) => {
  try {
    const response = await axios.get('https://pocketbase.0shura.fr/api/collections/users/records', {
      params: {
        page: 1,
        perPage: 30
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).send('Erreur de connexion avec PocketBase');
  }
});

// Route pour obtenir tous les enregistrements
router.get('/all', async (req, res) => {
  try {
    const response = await axios.get('https://pocketbase.0shura.fr/api/collections/users/records', {
      params: {
        perPage: 1000,  // Supposons qu'on souhaite retourner beaucoup d'enregistrements
        sort: '-created'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).send('Erreur de connexion avec PocketBase');
  }
});

// Route pour supprimer un utilisateur
router.delete('/users/g:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.delete(`https://pocketbase.0shura.fr/api/collections/users/records/${id}`);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).send('Erreur lors de la suppression de l’utilisateur');
  }
});


module.exports = router;

//test