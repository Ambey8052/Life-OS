import { z } from "zod";

export const noteCreateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(20000).optional(),
  tags: z.array(z.string().max(50)).optional(),
  linkedOpportunityId: z.string().uuid().optional().nullable(),
});

export const noteUpdateSchema = noteCreateSchema.partial();
