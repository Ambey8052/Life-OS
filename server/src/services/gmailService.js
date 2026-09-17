import { gmail as gmailApi } from "@googleapis/gmail";
import { supabase } from "../config/supabase.js";
import { createOAuthClient } from "../config/google.js";
import { encryptSecret, decryptSecret } from "../utils/crypto.js";

const BODY_CHAR_LIMIT = 1500;

// Promotions and social mail are almost never actionable for a student and would
// burn free-tier AI quota, so they're filtered at the Gmail query level.
const DEFAULT_QUERY = "-category:promotions -category:social -in:chats";

export class GmailAuthError extends Error {
  constructor(message = "Gmail access has expired or was revoked — please reconnect.") {
    super(message);
    this.status = 401;
    this.code = "GMAIL_REAUTH_REQUIRED";
  }
}

export async function getGmailAccount(userId) {
  const { data, error } = await supabase
    .from("gmail_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveGmailAccount(userId, email, refreshToken) {
  const { encryptedSecret, iv, authTag } = encryptSecret(refreshToken);
  const { error } = await supabase.from("gmail_accounts").upsert(
    {
      user_id: userId,
      email,
      encrypted_refresh_token: encryptedSecret,
      iv,
      auth_tag: authTag,
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}

export async function deleteGmailAccount(userId) {
  const account = await getGmailAccount(userId);
  if (!account) return;

  try {
    await createOAuthClient().revokeToken(refreshTokenOf(account));
  } catch {
    // Already revoked on Google's side — still remove our copy below.
  }

  const { error } = await supabase.from("gmail_accounts").delete().eq("user_id", userId);
  if (error) throw error;
}

function refreshTokenOf(account) {
  return decryptSecret({
    encryptedSecret: account.encrypted_refresh_token,
    iv: account.iv,
    authTag: account.auth_tag,
  });
}

export function gmailClientFor(account) {
  const auth = createOAuthClient();
  auth.setCredentials({ refresh_token: refreshTokenOf(account) });
  return gmailApi({ version: "v1", auth });
}

function isAuthFailure(err) {
  const reason = err?.response?.data?.error || err?.message || "";
  return reason === "invalid_grant" || /invalid_grant|unauthorized_client/i.test(String(reason));
}

export async function listRecentMessageIds(gmail, { days, max }) {
  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      q: `newer_than:${days}d ${DEFAULT_QUERY}`,
      maxResults: max,
    });
    return (res.data.messages || []).map((m) => m.id);
  } catch (err) {
    if (isAuthFailure(err)) throw new GmailAuthError();
    throw err;
  }
}

export async function fetchMessages(gmail, ids) {
  const results = [];
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    const settled = await Promise.allSettled(
      chunk.map((id) => gmail.users.messages.get({ userId: "me", id, format: "full" }))
    );
    for (const s of settled) {
      if (s.status === "fulfilled") results.push(parseMessage(s.value.data));
      else if (isAuthFailure(s.reason)) throw new GmailAuthError();
    }
  }
  return results;
}

function parseMessage(msg) {
  const headers = Object.fromEntries(
    (msg.payload?.headers || []).map((h) => [h.name.toLowerCase(), h.value])
  );
  const { name, email } = parseFrom(headers.from || "");
  const body = extractBody(msg.payload) || msg.snippet || "";

  return {
    id: msg.id,
    threadId: msg.threadId,
    fromName: name,
    fromEmail: email,
    subject: headers.subject || "(no subject)",
    receivedAt: msg.internalDate ? new Date(Number(msg.internalDate)).toISOString() : null,
    body: body.slice(0, BODY_CHAR_LIMIT),
  };
}

function parseFrom(value) {
  const match = value.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (match) return { name: match[1].trim() || match[2], email: match[2].trim() };
  return { name: value.trim(), email: value.trim() };
}

function decodeBase64Url(data) {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function findPart(part, mimeType) {
  if (!part) return null;
  if (part.mimeType === mimeType && part.body?.data) return part;
  for (const child of part.parts || []) {
    const found = findPart(child, mimeType);
    if (found) return found;
  }
  return null;
}

function extractBody(payload) {
  const plain = findPart(payload, "text/plain");
  if (plain) return collapse(decodeBase64Url(plain.body.data));

  const html = findPart(payload, "text/html");
  if (html) return collapse(stripHtml(decodeBase64Url(html.body.data)));

  return "";
}

function stripHtml(html) {
  return html
    .replace(/<(style|script|head)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function collapse(text) {
  return text
    .replace(/https?:\/\/\S{60,}/g, "[link]")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}
