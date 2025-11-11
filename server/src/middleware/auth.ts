// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/user.js";

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing auth token" });
    }
    const token = auth.split(" ")[1];
    const payload = verifyToken(token);
    // Optional: fetch user from DB to attach full object
    const user = await User.findById(payload.id).select("-password").lean();
    if (!user) return res.status(401).json({ message: "Invalid token (user not found)" });
    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ message: "Invalid or expired token", details: err.message });
  }
};
