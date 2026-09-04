import { z } from "zod";

export const setCredentialSchema = z.object({
  password: z.string().min(1).max(500),
});
