import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "devsecret";

export type AuthRequest = Request & { user?: { id: string; email: string } };

export function generateToken(payload: { id: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    if (
      typeof decoded === "object" &&
      decoded &&
      typeof decoded.id === "string" &&
      typeof decoded.email === "string"
    ) {
      req.user = { id: decoded.id, email: decoded.email };
      return next();
    }
    return res.status(401).json({ error: "Invalid token" });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
