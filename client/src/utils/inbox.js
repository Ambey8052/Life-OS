import {
  Award,
  BookOpen,
  Briefcase,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Landmark,
  Mail,
  Newspaper,
  NotebookPen,
  User,
  Video,
  Wallet,
} from "lucide-react";

export const EMAIL_CATEGORY_META = {
  exam: { label: "Exam", icon: GraduationCap },
  assignment: { label: "Assignment", icon: NotebookPen },
  academic: { label: "Academic", icon: BookOpen },
  interview: { label: "Interview", icon: Video },
  job: { label: "Job", icon: Briefcase },
  internship: { label: "Internship", icon: BriefcaseBusiness },
  scholarship: { label: "Scholarship", icon: Award },
  event: { label: "Event", icon: CalendarDays },
  payment: { label: "Payment", icon: Wallet },
  official: { label: "Official", icon: Landmark },
  personal: { label: "Personal", icon: User },
  newsletter: { label: "Newsletter", icon: Newspaper },
  other: { label: "Other", icon: Mail },
};

export const TRACKABLE_CATEGORIES = new Set(["job", "internship", "interview", "scholarship", "exam", "event"]);

const IMPORTANCE_RANK = { critical: 0, high: 1, medium: 2, low: 3 };
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function categoryMeta(category) {
  return EMAIL_CATEGORY_META[category] || EMAIL_CATEGORY_META.other;
}

// The date a student has to act by; an interview/exam day counts if there's no separate deadline.
export function keyDateOf(insight) {
  return insight.dueDate || insight.eventDate || null;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function timeOf(date) {
  const d = new Date(date);
  // Midnight-ish deadlines ("by 19 Sept") read better without a clock time.
  if ((d.getHours() === 23 && d.getMinutes() >= 59) || (d.getHours() === 0 && d.getMinutes() === 0)) {
    return "";
  }
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// → { label, tone } where tone is "overdue" | "urgent" | "soon" | "later"
export function describeDate(date, now = new Date()) {
  if (!date) return null;
  const target = new Date(date);
  const dayDiff = Math.round((startOfDay(target) - startOfDay(now)) / DAY);
  const time = timeOf(target);
  const at = time ? ` · ${time}` : "";

  if (target < now) {
    const days = Math.max(1, Math.floor((now - target) / DAY));
    return dayDiff === 0
      ? { label: `Was due today${at}`, tone: "overdue" }
      : { label: `Overdue by ${days} day${days > 1 ? "s" : ""}`, tone: "overdue" };
  }
  if (dayDiff === 0) return { label: `Today${at}`, tone: "urgent" };
  if (dayDiff === 1) return { label: `Tomorrow${at}`, tone: "urgent" };
  if (dayDiff <= 6) {
    const weekday = target.toLocaleDateString(undefined, { weekday: "long" });
    return { label: `${weekday}${at} · in ${dayDiff} days`, tone: "soon" };
  }
  return {
    label: target.toLocaleDateString(undefined, { day: "numeric", month: "short" }) + at,
    tone: "later",
  };
}

export function relativeTime(date, now = new Date()) {
  if (!date) return "";
  const diff = now - new Date(date);
  if (diff < HOUR) return `${Math.max(1, Math.round(diff / 60000))}m ago`;
  if (diff < DAY) return `${Math.round(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.round(diff / DAY)}d ago`;
  return new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function sortByUrgency(a, b) {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  const da = keyDateOf(a);
  const db = keyDateOf(b);
  if (da && db && da !== db) return new Date(da) - new Date(db);
  if (Boolean(da) !== Boolean(db)) return da ? -1 : 1;
  return (IMPORTANCE_RANK[a.importance] ?? 9) - (IMPORTANCE_RANK[b.importance] ?? 9);
}

// A note earns a spot on the wall if there's something to do, or a date worth remembering.
export function belongsOnWall(insight) {
  if (insight.status !== "open") return false;
  if (insight.actionRequired) return true;
  return Boolean(keyDateOf(insight)) && insight.importance !== "low";
}

export function buildWall(insights, now = new Date()) {
  const columns = { now: [], week: [], later: [] };
  for (const insight of insights.filter(belongsOnWall)) {
    const date = keyDateOf(insight);
    const msLeft = date ? new Date(date) - now : Infinity;

    if (insight.pinned || msLeft <= 2 * DAY || (!date && insight.importance === "critical")) {
      columns.now.push(insight);
    } else if (msLeft <= 7 * DAY) {
      columns.week.push(insight);
    } else {
      columns.later.push(insight);
    }
  }
  for (const key of Object.keys(columns)) columns[key].sort(sortByUrgency);
  return columns;
}

export function sortInsightsByUrgency(insights) {
  return [...insights].sort(sortByUrgency);
}

// Stable per-note tilt so the wall looks hand-pinned but doesn't reshuffle on every render.
export function tiltFor(id) {
  let hash = 0;
  for (const ch of String(id)) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return ((Math.abs(hash) % 5) - 2) * 0.8;
}
