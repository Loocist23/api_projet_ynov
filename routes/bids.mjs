import express from 'express';
import axios from 'axios';

const router = express.Router();
const pbUrl = 'https://pocketbase.0shura.fr';

router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        const response = await axios.get(`${pbUrl}/api/collections/bids/records`, {
            params: {
                filter: `userId = '${userId}'`
            }
        });
        res.json(response.data.items);
    } catch (error) {
        console.error('Erreur lors de la récupération des offres:', error);
        res.status(500).send('Erreur lors de la récupération des offres');
    }
});

export default router;
