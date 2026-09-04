import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const FUNNEL_STAGES = ["applied", "screening", "assessment", "interview", "offer"];

export const getSummary = asyncHandler(async (req, res) => {
  const { data: rows, error } = await supabase
    .from("opportunities")
    .select("status, category, skills")
    .eq("user_id", req.userId);
  if (error) throw error;

  const statusCounts = {};
  const categoryCounts = {};
  for (const o of rows) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    categoryCounts[o.category] = (categoryCounts[o.category] || 0) + 1;
  }

  const total = rows.length;
  const applications = rows.filter((o) => o.status !== "discovered" && o.status !== "saved").length;
  const interviews = statusCounts.interview || 0;
  const offers = statusCounts.offer || 0;
  const accepted = statusCounts.accepted || 0;
  const rejected = statusCounts.rejected || 0;

  const funnel = FUNNEL_STAGES.map((stage) => ({
    stage,
    count: rows.filter((o) => {
      const stageIndex = FUNNEL_STAGES.indexOf(o.status);
      return stageIndex >= FUNNEL_STAGES.indexOf(stage);
    }).length,
  }));

  const skillCounts = {};
  for (const o of rows) {
    for (const skill of o.skills || []) {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    }
  }
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  res.json({
    total,
    applications,
    interviews,
    offers: offers + accepted,
    rejected,
    interviewConversion: applications ? +((interviews / applications) * 100).toFixed(1) : 0,
    offerConversion: applications ? +(((offers + accepted) / applications) * 100).toFixed(1) : 0,
    statusCounts,
    categoryCounts,
    funnel,
    topSkills,
  });
});
