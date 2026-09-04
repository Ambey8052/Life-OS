// Resolves a real, fetched favicon for a site — not an AI-generated stand-in —
// so the icon actually matches the site the user applied on. Google's favicon
// service is free, keyless, and handles the fetching/caching itself.
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
