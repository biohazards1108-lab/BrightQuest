import pool from "../db.js";

export async function addUser(username, age) {
  const result = await pool.query(
    "INSERT INTO users (username, age) VALUES ($1, $2) RETURNING *",
    [username, age]
  );
  return result.rows[0];
}

export async function findUser(username) {
  const result = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  return result.rows[0];
}
