import pool from '../db.js';

export async function getGamesByGroup(groupId) {
  const result = await pool.query(
    'SELECT * FROM games WHERE age_group_id = $1',
    [groupId]
  );
  return result.rows;
}
