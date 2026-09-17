import { STATUS_LABELS } from "../constants";

export function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function label(value) {
  return value ? value.replace(/_/g, " ") : "";
}

export function statusLabel(value) {
  return STATUS_LABELS[value] || label(value);
}

export function faviconUrlFor(rawUrl) {
  if (!rawUrl) return null;
  try {
    const url = rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`;
    return `https://www.google.com/s2/favicons?sz=128&domain=${new URL(url).hostname}`;
  } catch {
    return null;
  }
}
