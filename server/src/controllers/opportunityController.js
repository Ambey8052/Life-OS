import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { opportunityCreateSchema, opportunityUpdateSchema } from "../validators/opportunityValidators.js";
import { setCredentialSchema } from "../validators/credentialValidators.js";
import { computePriorityScore, scoreLabel } from "../utils/priorityScore.js";
import { toOpportunityDTO, fromOpportunityInput } from "../utils/mappers.js";
import { faviconUrlFor } from "../utils/favicon.js";
import { encryptSecret, decryptSecret } from "../utils/crypto.js";

const WITH_CREDENTIAL_FLAG = "*, credentials(id)";

function withScore(row) {
  const dto = toOpportunityDTO(row);
  const score = computePriorityScore(dto);
  return { ...dto, priorityScore: score, priorityLabel: scoreLabel(score) };
}

function withDerivedLogo(row, data) {
  if ("website" in data || "applicationUrl" in data) {
    row.logo_url = faviconUrlFor(data.website || data.applicationUrl);
  }
  return row;
}

export const listOpportunities = asyncHandler(async (req, res) => {
  const { status, category, priority, q } = req.query;

  let query = supabase.from("opportunities").select(WITH_CREDENTIAL_FLAG).eq("user_id", req.userId);
  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (priority) query = query.eq("priority", priority);
  if (q) query = query.ilike("title", `%${q}%`);
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  res.json(data.map(withScore));
});

export const getOpportunity = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("opportunities")
    .select(WITH_CREDENTIAL_FLAG)
    .eq("id", req.params.id)
    .eq("user_id", req.userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: "Opportunity not found" });
  res.json(withScore(data));
});

export const createOpportunity = asyncHandler(async (req, res) => {
  const data = opportunityCreateSchema.parse(req.body);
  const row = withDerivedLogo(fromOpportunityInput(data), data);
  const { data: created, error } = await supabase
    .from("opportunities")
    .insert({ ...row, user_id: req.userId })
    .select(WITH_CREDENTIAL_FLAG)
    .single();
  if (error) throw error;
  res.status(201).json(withScore(created));
});

export const updateOpportunity = asyncHandler(async (req, res) => {
  const data = opportunityUpdateSchema.parse(req.body);
  const row = withDerivedLogo(fromOpportunityInput(data), data);
  const { data: updated, error } = await supabase
    .from("opportunities")
    .update(row)
    .eq("id", req.params.id)
    .eq("user_id", req.userId)
    .select(WITH_CREDENTIAL_FLAG)
    .maybeSingle();
  if (error) throw error;
  if (!updated) return res.status(404).json({ error: "Opportunity not found" });
  res.json(withScore(updated));
});

export const deleteOpportunity = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("opportunities")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.userId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: "Opportunity not found" });
  res.status(204).send();
});

// ── Credential vault (one encrypted password per opportunity) ──────────────

export const setCredential = asyncHandler(async (req, res) => {
  const { password } = setCredentialSchema.parse(req.body);

  const { data: opportunity, error: oppError } = await supabase
    .from("opportunities")
    .select("id")
    .eq("id", req.params.id)
    .eq("user_id", req.userId)
    .maybeSingle();
  if (oppError) throw oppError;
  if (!opportunity) return res.status(404).json({ error: "Opportunity not found" });

  const { encryptedSecret, iv, authTag } = encryptSecret(password);

  const { error } = await supabase.from("credentials").upsert(
    {
      opportunity_id: req.params.id,
      user_id: req.userId,
      encrypted_secret: encryptedSecret,
      iv,
      auth_tag: authTag,
    },
    { onConflict: "opportunity_id" }
  );
  if (error) throw error;

  res.status(204).send();
});

export const revealCredential = asyncHandler(async (req, res) => {
  const { data: credential, error } = await supabase
    .from("credentials")
    .select("encrypted_secret, iv, auth_tag")
    .eq("opportunity_id", req.params.id)
    .eq("user_id", req.userId)
    .maybeSingle();
  if (error) throw error;
  if (!credential) return res.status(404).json({ error: "No password saved for this opportunity" });

  const password = decryptSecret({
    encryptedSecret: credential.encrypted_secret,
    iv: credential.iv,
    authTag: credential.auth_tag,
  });
  res.json({ password });
});

export const deleteCredential = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from("credentials")
    .delete()
    .eq("opportunity_id", req.params.id)
    .eq("user_id", req.userId);
  if (error) throw error;
  res.status(204).send();
});
