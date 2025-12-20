import express from "express";
import bcrypt from "bcrypt";
import prisma from "../db";
import { generateToken } from "../middleware/auth";

const router = express.Router();

// Simple login — prefer DB-backed user verification, fall back to DUMMY_USER for compatibility
const DUMMY_USER = { id: "user-1", email: "test@local", password: "password" };

router.post("/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (
    !email ||
    !password ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 8)
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "User already exists" });

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const hash = await bcrypt.hash(password, saltRounds);
  const user = await prisma.user.create({
    data: { email, passwordHash: hash },
  });

  const token = generateToken({ id: user.id, email: user.email });
  return res
    .status(201)
    .json({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  // Try DB first
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = generateToken({ id: user.id, email: user.email });
    return res.json({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  }

  // Fallback to dummy user for tests/dev
  if (email !== DUMMY_USER.email || password !== DUMMY_USER.password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = generateToken({ id: DUMMY_USER.id, email: DUMMY_USER.email });
  return res.json({
    token,
    user: { id: DUMMY_USER.id, email: DUMMY_USER.email },
  });
});

export default router;
