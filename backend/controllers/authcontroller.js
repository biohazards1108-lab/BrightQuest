import { addUser, findUser } from "../models/authModel.js";

export async function createUser(req, res) {
  const { username, age } = req.body;

  try {
    const user = await addUser(username, age);
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: "Username already exists" });
  }
}

export async function getUser(req, res) {
  const { username } = req.body;

  try {
    const user = await findUser(username);
    if (!user) return res.status(404).json({ success: false });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false });
  }
}
