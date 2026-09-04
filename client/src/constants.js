import { Flame, TriangleAlert, CircleDot, CircleCheck } from "lucide-react";

export const CATEGORIES = [
  "job",
  "internship",
  "freelance",
  "hackathon",
  "scholarship",
  "govt_job",
  "govt_scheme",
  "competition",
  "exam",
  "college_application",
  "certification",
  "research",
  "event",
  "other",
];

export const STATUSES = [
  "discovered",
  "saved",
  "applied",
  "screening",
  "assessment",
  "interview",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
  "expired",
  "on_hold",
];

export const PRIORITIES = ["low", "medium", "high", "critical"];

export const TASK_STATUSES = ["todo", "in_progress", "done"];

export const PRIORITY_STYLES = {
  critical: "bg-red-500/10 text-red-400 border-red-500/25",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export const PRIORITY_ICON = {
  critical: Flame,
  high: TriangleAlert,
  medium: CircleDot,
  low: CircleCheck,
};

export const PRIORITY_TEXT = {
  critical: "text-red-400",
  high: "text-amber-400",
  medium: "text-yellow-400",
  low: "text-emerald-400",
};

export function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function label(value) {
  return value ? value.replace(/_/g, " ") : "";
}

export function faviconUrlFor(rawUrl) {
  if (!rawUrl) return null;
  try {
    const url = rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`;
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;
  } catch {
    return null;
  }
}
