const PRIORITY_WEIGHT = { critical: 25, high: 20, medium: 10, low: 5 };
const STATUS_WEIGHT = {
  interview: 15,
  offer: 15,
  assessment: 10,
  screening: 8,
  applied: 5,
  saved: 2,
  discovered: 1,
  on_hold: 3,
};

function daysUntil(date) {
  if (!date) return null;
  const diffMs = new Date(date).getTime() - Date.now();
  return diffMs / (1000 * 60 * 60 * 24);
}

function deadlineUrgency(deadline) {
  const days = daysUntil(deadline);
  if (days === null) return 0;
  if (days < 0) return 0;
  if (days <= 1) return 40;
  if (days <= 3) return 30;
  if (days <= 7) return 20;
  if (days <= 14) return 10;
  return 5;
}

function interviewProximity(interview) {
  if (!interview?.scheduled || !interview.date) return 0;
  const days = daysUntil(interview.date);
  if (days === null || days < 0) return 0;
  if (days <= 2) return 20;
  if (days <= 7) return 10;
  return 0;
}

function followUpDue(followUpDate) {
  const days = daysUntil(followUpDate);
  if (days === null) return 0;
  return days <= 0 ? 15 : 0;
}

export function computePriorityScore(opportunity) {
  const score =
    deadlineUrgency(opportunity.deadline) +
    (PRIORITY_WEIGHT[opportunity.priority] || 0) +
    interviewProximity(opportunity.interview) +
    followUpDue(opportunity.followUpDate) +
    (STATUS_WEIGHT[opportunity.status] || 0);

  return Math.min(100, score);
}

export function scoreLabel(score) {
  if (score >= 70) return "critical";
  if (score >= 45) return "high";
  if (score >= 25) return "medium";
  return "low";
}
