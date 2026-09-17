import jwt from "jsonwebtoken";
import { gmail as gmailApi } from "@googleapis/gmail";
import { supabase } from "../config/supabase.js";
import { GMAIL_SCOPES, createOAuthClient, isGoogleConfigured } from "../config/google.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { syncSchema } from "../validators/inboxValidators.js";
import {
  GmailAuthError,
  deleteGmailAccount,
  fetchMessages,
  getGmailAccount,
  gmailClientFor,
  listRecentMessageIds,
  saveGmailAccount,
} from "../services/gmailService.js";
import { isAiConfigured, summarizeEmails } from "../services/emailAiService.js";

const STATE_PURPOSE = "gmail-connect";
const FIRST_SYNC_DAYS = 14;
const MAX_LOOKBACK_DAYS = 30;
const MAX_NEW_PER_SYNC = 40;
const DAY_MS = 24 * 60 * 60 * 1000;

function clientUrl(path) {
  return `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}${path}`;
}

export const getStatus = asyncHandler(async (req, res) => {
  const account = isGoogleConfigured() ? await getGmailAccount(req.userId) : null;
  res.json({
    configured: isGoogleConfigured(),
    aiConfigured: isAiConfigured(),
    connected: Boolean(account),
    email: account?.email ?? null,
    lastSyncedAt: account?.last_synced_at ?? null,
  });
});

export const getConnectUrl = asyncHandler(async (req, res) => {
  if (!isGoogleConfigured()) {
    return res.status(503).json({ error: "Gmail integration isn't configured on the server yet." });
  }

  // The OAuth state carries the user's identity through Google's redirect and
  // doubles as CSRF protection: only this server can mint a valid one.
  const state = jwt.sign({ sub: req.userId, purpose: STATE_PURPOSE }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

  const url = createOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
    state,
  });
  res.json({ url });
});

export const handleCallback = async (req, res) => {
  const { code, state, error } = req.query;
  if (error) return res.redirect(clientUrl("/inbox?gmail=denied"));

  let userId;
  try {
    const payload = jwt.verify(String(state || ""), process.env.JWT_SECRET);
    if (payload.purpose !== STATE_PURPOSE) throw new Error("Wrong state purpose");
    userId = payload.sub;
  } catch {
    return res.redirect(clientUrl("/inbox?gmail=expired"));
  }

  try {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(String(code || ""));

    // Google's consent screen lets people untick individual permissions.
    const granted = (tokens.scope || "").split(" ");
    if (!GMAIL_SCOPES.every((s) => granted.includes(s))) {
      return res.redirect(clientUrl("/inbox?gmail=missing_scope"));
    }
    if (!tokens.refresh_token) {
      return res.redirect(clientUrl("/inbox?gmail=no_refresh_token"));
    }

    client.setCredentials(tokens);
    const profile = await gmailApi({ version: "v1", auth: client }).users.getProfile({ userId: "me" });

    await saveGmailAccount(userId, profile.data.emailAddress, tokens.refresh_token);
    res.redirect(clientUrl("/inbox?gmail=connected"));
  } catch (err) {
    console.error("Gmail OAuth callback failed:", err.message);
    res.redirect(clientUrl("/inbox?gmail=error"));
  }
};

function lookbackDays(lastSyncedAt) {
  if (!lastSyncedAt) return FIRST_SYNC_DAYS;
  const elapsed = Math.ceil((Date.now() - new Date(lastSyncedAt).getTime()) / DAY_MS) + 1;
  return Math.min(Math.max(elapsed, 2), MAX_LOOKBACK_DAYS);
}

export const syncInbox = asyncHandler(async (req, res) => {
  const { timeZone } = syncSchema.parse(req.body || {});

  if (!isAiConfigured()) {
    return res.status(503).json({ error: "AI summarization isn't configured on the server yet." });
  }

  const account = await getGmailAccount(req.userId);
  if (!account) return res.status(400).json({ error: "Connect your Gmail account first." });

  try {
    const gmail = gmailClientFor(account);
    const ids = await listRecentMessageIds(gmail, {
      days: lookbackDays(account.last_synced_at),
      max: MAX_NEW_PER_SYNC * 2,
    });

    const { data: existing, error } = ids.length
      ? await supabase
          .from("email_insights")
          .select("gmail_message_id")
          .eq("user_id", req.userId)
          .in("gmail_message_id", ids)
      : { data: [], error: null };
    if (error) throw error;

    const known = new Set(existing.map((r) => r.gmail_message_id));
    const unseen = ids.filter((id) => !known.has(id));
    const toProcess = unseen.slice(0, MAX_NEW_PER_SYNC);

    const messages = await fetchMessages(gmail, toProcess);
    const insights = messages.length ? await summarizeEmails(messages, { timeZone }) : new Map();

    const rows = messages
      .filter((m) => insights.has(m.id))
      .map((m) => {
        const i = insights.get(m.id);
        return {
          user_id: req.userId,
          gmail_message_id: m.id,
          thread_id: m.threadId,
          from_name: m.fromName,
          from_email: m.fromEmail,
          subject: m.subject,
          received_at: m.receivedAt,
          summary: i.summary,
          category: i.category,
          importance: i.importance,
          action_required: i.actionRequired,
          action: i.action,
          due_date: i.dueDate,
          event_date: i.eventDate,
          key_details: i.keyDetails,
          // Nothing to do and nothing to remember: keep it out of the way by default.
          status: !i.actionRequired && i.importance === "low" ? "dismissed" : "open",
        };
      });

    if (rows.length) {
      const { error: insertError } = await supabase
        .from("email_insights")
        .upsert(rows, { onConflict: "user_id,gmail_message_id", ignoreDuplicates: true });
      if (insertError) throw insertError;
    }

    const remaining = unseen.length - rows.length;
    // Only move the sync window forward once everything in it has been summarized,
    // so emails skipped by a rate limit are retried next time.
    if (remaining === 0) {
      await supabase
        .from("gmail_accounts")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("user_id", req.userId);
    }

    res.json({ processed: rows.length, remaining });
  } catch (err) {
    if (err instanceof GmailAuthError) {
      await supabase.from("gmail_accounts").delete().eq("user_id", req.userId);
    }
    throw err;
  }
});

export const disconnectGmail = asyncHandler(async (req, res) => {
  await deleteGmailAccount(req.userId);
  const { error } = await supabase.from("email_insights").delete().eq("user_id", req.userId);
  if (error) throw error;
  res.status(204).send();
});
