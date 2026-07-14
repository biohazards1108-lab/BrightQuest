import pool from '../db.js';

export async function addMessage(userId, message) {
  await pool.query(
    'INSERT INTO chat_messages (user_id, message) VALUES ($1, $2)',
    [userId, message]
  );
}

export async function getMessages() {
  const result = await pool.query(
    'SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 50'
  );
  return result.rows;
}
