import express from 'express';
import { sendMessage, fetchMessages } from '../controllers/chatController.js';

const router = express.Router();

router.get('/', fetchMessages);
router.post('/', sendMessage);

export default router;
