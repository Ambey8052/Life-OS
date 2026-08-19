import Opportunity from "../models/Opportunity.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { computePriorityScore, scoreLabel } from "../utils/priorityScore.js";

const ACTIVE_STATUSES = [
  "discovered",
  "saved",
  "applied",
  "screening",
  "assessment",
  "interview",
  "offer",
  "on_hold",
];

export const getToday = asyncHandler(async (req, res) => {
  const opportunities = await Opportunity.find({
    userId: req.userId,
    status: { $in: ACTIVE_STATUSES },
  });

  const scored = opportunities
    .map((doc) => {
      const obj = doc.toObject();
      const score = computePriorityScore(obj);
      return { ...obj, priorityScore: score, priorityLabel: scoreLabel(score) };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const buckets = { critical: [], high: [], medium: [], low: [] };
  for (const item of scored) buckets[item.priorityLabel].push(item);

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const overview = {
    totalOpportunities: opportunities.length,
    upcomingInterviews: opportunities.filter(
      (o) => o.interview?.scheduled && o.interview.date && new Date(o.interview.date) >= now
    ).length,
    upcomingDeadlines: opportunities.filter(
      (o) => o.deadline && new Date(o.deadline) >= now && new Date(o.deadline) <= in7Days
    ).length,
    pendingFollowUps: opportunities.filter((o) => o.followUpDate && new Date(o.followUpDate) <= now)
      .length,
  };

  res.json({ overview, buckets });
});
