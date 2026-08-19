import { z } from "zod";
import { CATEGORIES, STATUSES, PRIORITIES } from "../models/Opportunity.js";

const interviewSchema = z
  .object({
    scheduled: z.boolean().optional(),
    date: z.coerce.date().optional().nullable(),
    meetingUrl: z.string().url().optional().or(z.literal("")),
  })
  .partial();

export const opportunityCreateSchema = z.object({
  title: z.string().min(1).max(200),
  organization: z.string().max(200).optional(),
  category: z.enum(CATEGORIES).optional(),
  website: z.string().max(500).optional(),
  applicationUrl: z.string().max(500).optional(),
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  deadline: z.coerce.date().optional().nullable(),
  appliedAt: z.coerce.date().optional().nullable(),
  interview: interviewSchema.optional(),
  salary: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  skills: z.array(z.string().max(50)).optional(),
  notes: z.string().max(5000).optional(),
  followUpDate: z.coerce.date().optional().nullable(),
});

export const opportunityUpdateSchema = opportunityCreateSchema.partial();
