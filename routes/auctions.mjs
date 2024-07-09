import express from 'express';
import axios from 'axios';

const router = express.Router();
const pbUrl = 'https://pocketbase.0shura.fr';

// Route pour obtenir toutes les enchères
router.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${pbUrl}/api/collections/auctions/records`);
        res.json(response.data.items);
    } catch (error) {
        console.error('Erreur lors de la récupération des enchères:', error);
        res.status(500).send('Erreur lors de la récupération des enchères');
    }
});

export default router;
