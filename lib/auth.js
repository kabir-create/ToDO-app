// lib/auth.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Load secret from env — fallback only for dev
const JWT_SECRET = process.env.JWT_SECRET || "dev-fallback-secret";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

export const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// lib/middleware.js
