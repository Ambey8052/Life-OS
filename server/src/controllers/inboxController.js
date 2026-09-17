import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { insightListSchema, insightUpdateSchema } from "../validators/inboxValidators.js";
import { toInsightDTO } from "../utils/mappers.js";
import { faviconUrlFor } from "../utils/favicon.js";
import { getGmailAccount } from "../services/gmailService.js";

const OPPORTUNITY_CATEGORY = {
  job: "job",
  internship: "internship",
  interview: "job",
  scholarship: "scholarship",
  exam: "exam",
  event: "event",
};

// Mail from these providers says nothing about the organization, so no logo.
const PERSONAL_MAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "rediffmail.com",
  "proton.me",
  "protonmail.com",
]);

async function findInsight(id, userId) {
  const { data, error } = await supabase
    .from("email_insights")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function accountEmail(userId) {
  return (await getGmailAccount(userId))?.email;
}

export const listInsights = asyncHandler(async (req, res) => {
  const { status = "open", category } = insightListSchema.parse(req.query);

  let query = supabase.from("email_insights").select("*").eq("user_id", req.userId);
  if (status !== "all") query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  query = query.order("received_at", { ascending: false }).limit(300);

  const [{ data, error }, email] = await Promise.all([query, accountEmail(req.userId)]);
  if (error) throw error;
  res.json(data.map((row) => toInsightDTO(row, email)));
});

export const updateInsight = asyncHandler(async (req, res) => {
  const data = insightUpdateSchema.parse(req.body);
  const { data: row, error } = await supabase
    .from("email_insights")
    .update(data)
    .eq("id", req.params.id)
    .eq("user_id", req.userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) return res.status(404).json({ error: "Email not found" });
  res.json(toInsightDTO(row, await accountEmail(req.userId)));
});

export const convertToTask = asyncHandler(async (req, res) => {
  const insight = await findInsight(req.params.id, req.userId);
  if (!insight) return res.status(404).json({ error: "Email not found" });
  if (insight.task_id) return res.status(409).json({ error: "Already added to Tasks" });

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      user_id: req.userId,
      title: (insight.action || insight.subject || "Follow up on email").slice(0, 200),
      description: [
        insight.summary,
        ...insight.key_details.map((d) => `• ${d}`),
        `From: ${insight.from_name || insight.from_email}`,
      ].join("\n"),
      due_date: insight.due_date || insight.event_date,
      priority: insight.importance,
      status: "todo",
      tags: ["email", insight.category],
    })
    .select("id")
    .single();
  if (error) throw error;

  const { data: row, error: updateError } = await supabase
    .from("email_insights")
    .update({ task_id: task.id, status: "done" })
    .eq("id", insight.id)
    .select()
    .single();
  if (updateError) throw updateError;

  res.status(201).json(toInsightDTO(row, await accountEmail(req.userId)));
});

// Second-level labels under country TLDs, e.g. iitd.ac.in, nta.nic.in, abc.co.uk.
const COUNTRY_SLDS = new Set(["ac", "co", "com", "edu", "gov", "nic", "org", "net", "res", "gen"]);

function organizationWebsite(fromEmail) {
  const domain = (fromEmail || "").split("@")[1]?.toLowerCase();
  if (!domain || PERSONAL_MAIL_DOMAINS.has(domain)) return null;

  // careers.infosys.com -> infosys.com, noreply.iitd.ac.in -> iitd.ac.in
  const labels = domain.split(".");
  const tld = labels.at(-1);
  const sld = labels.at(-2);
  const keep = tld.length === 2 && COUNTRY_SLDS.has(sld) ? 3 : 2;
  return labels.slice(-keep).join(".");
}

export const convertToOpportunity = asyncHandler(async (req, res) => {
  const insight = await findInsight(req.params.id, req.userId);
  if (!insight) return res.status(404).json({ error: "Email not found" });
  if (insight.opportunity_id) return res.status(409).json({ error: "Already tracked as an opportunity" });

  const category = OPPORTUNITY_CATEGORY[insight.category];
  if (!category) {
    return res.status(400).json({ error: "Only job, internship, interview, scholarship, exam or event emails can be tracked" });
  }

  const isInterview = insight.category === "interview";
  const website = organizationWebsite(insight.from_email);

  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .insert({
      user_id: req.userId,
      title: (insight.subject || insight.action || "Opportunity from email").slice(0, 200),
      organization: insight.from_name,
      category,
      website,
      logo_url: faviconUrlFor(website),
      status: isInterview ? "interview" : "saved",
      priority: insight.importance,
      deadline: insight.due_date,
      interview: isInterview
        ? { scheduled: Boolean(insight.event_date), date: insight.event_date }
        : { scheduled: false },
      notes: [insight.summary, ...insight.key_details.map((d) => `• ${d}`)].join("\n"),
    })
    .select("id")
    .single();
  if (error) throw error;

  const { data: row, error: updateError } = await supabase
    .from("email_insights")
    .update({ opportunity_id: opportunity.id })
    .eq("id", insight.id)
    .select()
    .single();
  if (updateError) throw updateError;

  res.status(201).json(toInsightDTO(row, await accountEmail(req.userId)));
});
