import { z } from "zod";
import { TASK_STATUSES, TASK_PRIORITIES } from "../models/Task.js";

export const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  linkedOpportunityId: z.string().length(24).optional().nullable(),
  tags: z.array(z.string().max(50)).optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial();
