import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";
import { signToken, AUTH_COOKIE, cookieOptions } from "../utils/token.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const { data: existing, error: lookupError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const { data: user, error } = await supabase
    .from("users")
    .insert({ name, email, password_hash: passwordHash })
    .select("id, name, email")
    .single();
  if (error) {
    if (error.code === "23505") return res.status(409).json({ error: "Email already registered" });
    throw error;
  }

  const token = signToken(user.id);
  res.cookie(AUTH_COOKIE, token, cookieOptions());
  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, email, password_hash")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken(user.id);
  res.cookie(AUTH_COOKIE, token, cookieOptions());
  res.json({ id: user.id, name: user.name, email: user.email });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(AUTH_COOKIE, { ...cookieOptions(), maxAge: 0 });
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("name, email, created_at")
    .eq("id", req.userId)
    .maybeSingle();
  if (error) throw error;
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ name: user.name, email: user.email, createdAt: user.created_at });
});
