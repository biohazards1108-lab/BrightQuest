import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

// Railway will inject DATABASE_URL automatically if you add PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(express.json());

// Simple health route for your index.html checkBackend()
app.get("/api/status", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({
      ok: true,
      message: "BrightQuest backend is alive",
      time: result.rows[0].now
    });
  } catch (err) {
    console.error("Status check error:", err);
    res.status(500).json({ ok: false, error: "Database not reachable" });
  }
});

// Example: store a user visit (you can expand this later)
app.post("/api/visit", async (req, res) => {
  const { ageGroup } = req.body;

  try {
    await pool.query(
      "INSERT INTO visits (age_group) VALUES ($1)",
      [ageGroup]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("Insert visit error:", err);
    res.status(500).json({ ok: false, error: "Failed to record visit" });
  }
});

// Example: get visit stats
app.get("/api/visits", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT age_group, COUNT(*) AS count FROM visits GROUP BY age_group"
    );
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error("Get visits error:", err);
    res.status(500).json({ ok: false, error: "Failed to fetch visits" });
  }
});

app.listen(PORT, () => {
  console.log(`BrightQuest backend running on port ${PORT}`);
});
