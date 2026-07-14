import { addMessage, getMessages } from '../models/chatModel.js';

export async function sendMessage(req, res) {
  const { userId, message } = req.body;
  await addMessage(userId, message);
  res.json({ success: true });
}

export async function fetchMessages(req, res) {
  const messages = await getMessages();
  res.json(messages);
}
