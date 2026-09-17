import { z } from "zod";
import { EMAIL_CATEGORIES, EMAIL_STATUSES } from "../constants.js";

function isValidTimeZone(tz) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const syncSchema = z.object({
  timeZone: z
    .string()
    .max(64)
    .optional()
    .transform((tz) => (tz && isValidTimeZone(tz) ? tz : "UTC")),
});

export const insightListSchema = z.object({
  status: z.enum([...EMAIL_STATUSES, "all"]).optional(),
  category: z.enum(EMAIL_CATEGORIES).optional(),
});

export const insightUpdateSchema = z
  .object({
    status: z.enum(EMAIL_STATUSES).optional(),
    pinned: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "Nothing to update" });
