import pool from '../db.js';

export async function getAgeGroup(age) {
  const result = await pool.query(
    'SELECT id FROM age_groups WHERE $1 BETWEEN min_age AND max_age',
    [age]
  );
  return result.rows[0];
}
