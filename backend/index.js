import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

/*
    Railway automatically injects DATABASE_URL
    when you add a PostgreSQL service.

    Example:
    postgres://user:password@host:port/database
*/

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false
});

app.use(cors());
app.use(express.json());

// ---------------------------------------------
// Health Check Route
// ---------------------------------------------
app.get("/api/status", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS now");
        res.json({
            ok: true,
            message: "BrightQuest backend is running",
            time: result.rows[0].now
        });
    } catch (err) {
        console.error("Status check error:", err);
        res.status(500).json({
            ok: false,
            error: "Database connection failed"
        });
    }
});

// ---------------------------------------------
// Record Age Group Visit
// ---------------------------------------------
app.post("/api/visit", async (req, res) => {
    const { ageGroup } = req.body;

    if (!ageGroup) {
        return res.status(400).json({
            ok: false,
            error: "Missing ageGroup field"
        });
    }

    try {
        await pool.query(
            "INSERT INTO visits (age_group) VALUES ($1)",
            [ageGroup]
        );

        res.json({ ok: true });
    } catch (err) {
        console.error("Insert visit error:", err);
        res.status(500).json({
            ok: false,
            error: "Failed to record visit"
        });
    }
});

// ---------------------------------------------
// Get Visit Stats
// ---------------------------------------------
app.get("/api/visits", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT age_group, COUNT(*) AS count FROM visits GROUP BY age_group"
        );

        res.json({
            ok: true,
            data: result.rows
        });
    } catch (err) {
        console.error("Get visits error:", err);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch visit stats"
        });
    }
});

// ---------------------------------------------
// Start Server
// ---------------------------------------------
app.listen(PORT, () => {
    console.log(`BrightQuest backend running on port ${PORT}`);
});
