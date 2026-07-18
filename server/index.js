import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const users = new Map(); // replace with DB

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  // TODO: validate password
  if (!users.has(username)) {
    users.set(username, {
      username,
      tokens: 50,
      titles: ["Novice Defender"],
      banners: []
    });
  }
  res.json({ success: true, ...users.get(username) });
});

app.post("/api/logout", (req, res) => {
  res.json({ success: true });
});

app.post("/api/profile/save", (req, res) => {
  const { username, profile } = req.body;
  if (username) {
    users.set(username, { ...(users.get(username) || {}), ...profile });
  }
  res.json({ success: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Tower Tactics backend running on", port));
