import { OAuth2Client } from "google-auth-library";

export const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function redirectUri() {
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  return process.env.GOOGLE_REDIRECT_URI || `${clientOrigin}/api/gmail/callback`;
}

export function createOAuthClient() {
  return new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: redirectUri(),
  });
}
