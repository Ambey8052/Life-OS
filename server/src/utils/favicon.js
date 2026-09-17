// Google's favicon service is free, needs no key, and caches icons itself.
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
