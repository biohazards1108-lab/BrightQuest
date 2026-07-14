import express from "express";
import { createUser, getUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", createUser);
router.post("/login", getUser);

export default router;
