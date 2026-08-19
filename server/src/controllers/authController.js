import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";
import { signToken, AUTH_COOKIE, cookieOptions } from "../utils/token.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken(user._id.toString());
  res.cookie(AUTH_COOKIE, token, cookieOptions());
  res.status(201).json({ id: user._id, name: user.name, email: user.email });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken(user._id.toString());
  res.cookie(AUTH_COOKIE, token, cookieOptions());
  res.json({ id: user._id, name: user.name, email: user.email });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(AUTH_COOKIE, { ...cookieOptions(), maxAge: 0 });
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("name email createdAt");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});
