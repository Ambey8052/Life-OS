import mongoose from "mongoose";
import Opportunity from "../models/Opportunity.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const FUNNEL_STAGES = ["applied", "screening", "assessment", "interview", "offer"];

export const getSummary = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.userId);

  const [byStatus, byCategory, opportunities] = await Promise.all([
    Opportunity.aggregate([{ $match: { userId } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Opportunity.aggregate([{ $match: { userId } }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
    Opportunity.find({ userId }, "status skills"),
  ]);

  const statusCounts = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  const categoryCounts = Object.fromEntries(byCategory.map((c) => [c._id, c.count]));

  const total = opportunities.length;
  const applications = opportunities.filter((o) => o.status !== "discovered" && o.status !== "saved").length;
  const interviews = statusCounts.interview || 0;
  const offers = statusCounts.offer || 0;
  const accepted = statusCounts.accepted || 0;
  const rejected = statusCounts.rejected || 0;

  const funnel = FUNNEL_STAGES.map((stage) => ({
    stage,
    count: opportunities.filter((o) => {
      const stageIndex = FUNNEL_STAGES.indexOf(o.status);
      return stageIndex >= FUNNEL_STAGES.indexOf(stage);
    }).length,
  }));

  const skillCounts = {};
  for (const o of opportunities) {
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
