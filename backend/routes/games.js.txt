import express from 'express';
import { fetchGames } from '../controllers/gamesController.js';

const router = express.Router();

router.get('/:age', fetchGames);

export default router;
