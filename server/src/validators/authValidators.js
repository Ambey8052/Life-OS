import { z } from "zod";

// Emails are stored and compared lowercase so "Karan@Gmail.com" and "karan@gmail.com" are one account.
const email = z.string().trim().toLowerCase().email();

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email,
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1),
});
