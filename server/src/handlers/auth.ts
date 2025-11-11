// src/handlers/auth.ts
import express from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../models/user.js";
import { connectDB } from "../utils/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

if (!JWT_SECRET) throw new Error("JWT_SECRET not defined");

// Utility functions
export const signToken = (payload: object): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as unknown as number };
  return jwt.sign(payload, JWT_SECRET, options);
};

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET not defined");

export const signRefreshToken = (payload: object): string => {
  const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as unknown as number };
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
};

// ---------------------- SIGNUP ----------------------
router.post("/signup", async (req, res) => {
  try {
    await connectDB();
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });

    // Issue tokens
    const token = signToken({ id: user._id.toString(), email: user.email });
    const refreshToken = signRefreshToken({ id: user._id.toString(), email: user.email });

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      token,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ error: "Signup failed", details: err });
  }
});

// ---------------------- LOGIN ----------------------
router.post("/login", async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // Issue tokens
    const token = signToken({ id: user._id.toString(), email: user.email });
    const refreshToken = signRefreshToken({ id: user._id.toString(), email: user.email });

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      token,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err });
  }
});

// ---------------------- REFRESH TOKEN ----------------------
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Missing refresh token" });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
      email: string;
    };

    await connectDB();
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Invalid refresh token" });

    const newToken = signToken({ id: user._id.toString(), email: user.email });
    res.json({ token: newToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// ---------------------- PROTECTED PROFILE ----------------------
router.get("/profile", requireAuth, async (req: any, res) => {
  res.json({ user: req.user });
});

export default router;
