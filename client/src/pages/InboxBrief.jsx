import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { AlarmClock, CircleAlert, Clock, Inbox, ListTodo, PartyPopper, RefreshCw, Sparkles, Unplug } from "lucide-react";
import {
  useConnectGmail,
  useDisconnectGmail,
  useGmailStatus,
  useInsightToOpportunity,
  useInsightToTask,
  useInsights,
  useSyncInbox,
  useUpdateInsight,
} from "../hooks/useInbox";
import { EMAIL_CATEGORY_META, buildWall, keyDateOf, relativeTime, sortInsightsByUrgency } from "../utils/inbox";
import StickyNote from "../components/inbox/StickyNote";
import EmailRow from "../components/inbox/EmailRow";
import { ConnectGmailCard, SetupGmailCard } from "../components/inbox/GmailOnboarding";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton, SkeletonCards } from "../components/ui/Skeleton";

const OAUTH_MESSAGES = {
  denied: "Gmail access wasn't granted.",
  expired: "That sign-in link expired — please try connecting again.",
  missing_scope: "Please tick the “Read your email” permission on Google's screen and try again.",
  no_refresh_token: "Google didn't grant lasting access. Remove LifeOS from your Google account's third-party apps, then reconnect.",
  error: "Something went wrong connecting Gmail. Please try again.",
};

const WALL_COLUMNS = [
  { key: "now", title: "Do now", hint: "Due within 48 hours or pinned", dot: "bg-red-500" },
  { key: "week", title: "This week", hint: "Due in the next 7 days", dot: "bg-amber-400" },
  { key: "later", title: "Coming up", hint: "Later, or no date given", dot: "bg-emerald-400" },
];

const TABS = [
  { key: "open", label: "Open" },
  { key: "done", label: "Done" },
  { key: "dismissed", label: "Hidden" },
];

const DAY = 24 * 60 * 60 * 1000;
const NO_INSIGHTS = [];

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white/[0.03] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Icon size={14} className={tone} />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function InboxBrief() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("open");
  const [category, setCategory] = useState("all");
  const [pendingId, setPendingId] = useState(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const handledOAuth = useRef(false);

  const status = useGmailStatus();
  const connected = Boolean(status.data?.connected);
  const insightsQuery = useInsights({ status: "all", enabled: connected });
  const insights = insightsQuery.data ?? NO_INSIGHTS;

  const connect = useConnectGmail();
  const sync = useSyncInbox();
  const disconnect = useDisconnectGmail();
  const updateInsight = useUpdateInsight();
  const toTask = useInsightToTask();
  const toOpportunity = useInsightToOpportunity();

  async function runSync() {
    try {
      const { processed, remaining } = await sync.mutateAsync();
      if (processed) toast.success(`Summarized ${processed} new email${processed === 1 ? "" : "s"}`);
      else if (!remaining) toast.success("You're all caught up");
      if (remaining) toast(`${remaining} more waiting — sync again in a minute.`, { icon: <Clock size={16} className="text-amber-400" /> });
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Handle the redirect back from Google's consent screen exactly once
  // (StrictMode runs effects twice in development).
  useEffect(() => {
    const result = searchParams.get("gmail");
    if (!result || handledOAuth.current) return;
    handledOAuth.current = true;

    if (result === "connected") {
      toast.success("Gmail connected — reading your recent mail…");
      runSync();
    } else {
      toast.error(OAUTH_MESSAGES[result] || OAUTH_MESSAGES.error);
    }
    searchParams.delete("gmail");
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(id, fn, successMessage) {
    setPendingId(id);
    try {
      await fn();
      if (successMessage) toast.success(successMessage);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPendingId(null);
    }
  }

  const setStatus = (insight, next) =>
    act(insight._id, () => updateInsight.mutateAsync({ id: insight._id, data: { status: next } }), {
      done: "Nice — marked done",
      dismissed: "Hidden",
      open: "Moved back to open",
    }[next]);

  const togglePin = (insight) =>
    act(insight._id, () => updateInsight.mutateAsync({ id: insight._id, data: { pinned: !insight.pinned } }));

  const moveToTask = (insight) => act(insight._id, () => toTask.mutateAsync(insight._id), "Moved to Tasks");

  const track = (insight) =>
    act(insight._id, () => toOpportunity.mutateAsync(insight._id), "Now tracked in Opportunities");

  async function confirmDisconnectGmail() {
    try {
      await disconnect.mutateAsync();
      toast.success("Gmail disconnected and summaries erased");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirmDisconnect(false);
    }
  }

  const wall = useMemo(() => buildWall(insights), [insights]);

  const stats = useMemo(() => {
    const now = Date.now();
    const open = insights.filter((i) => i.status === "open");
    return {
      dueSoon: open.filter((i) => {
        const d = keyDateOf(i);
        return d && new Date(d) - now <= 2 * DAY;
      }).length,
      needsAction: open.filter((i) => i.actionRequired).length,
      upcoming: open.filter(
        (i) => ["exam", "interview"].includes(i.category) && i.eventDate && new Date(i.eventDate) > now
      ).length,
      total: insights.length,
    };
  }, [insights]);

  const tabCounts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.key, insights.filter((i) => i.status === t.key).length])),
    [insights]
  );

  const inTab = useMemo(() => insights.filter((i) => i.status === tab), [insights, tab]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const i of inTab) counts[i.category] = (counts[i.category] || 0) + 1;
    return counts;
  }, [inTab]);

  const listed = useMemo(() => {
    const filtered = category === "all" ? inTab : inTab.filter((i) => i.category === category);
    return tab === "open" ? sortInsightsByUrgency(filtered) : filtered;
  }, [inTab, category, tab]);

  useEffect(() => {
    if (category !== "all" && !categoryCounts[category]) setCategory("all");
  }, [category, categoryCounts]);

  const wallCount = wall.now.length + wall.week.length + wall.later.length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Inbox Brief</h1>
          <p className="text-gray-400 text-sm mt-1">Your email, boiled down to what you actually need to do.</p>
        </div>

        {connected && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="min-w-0 flex-1 sm:flex-none text-right">
              <p className="text-xs text-gray-300 truncate">{status.data.email}</p>
              <p className="text-[11px] text-gray-400">
                {status.data.lastSyncedAt ? `Synced ${relativeTime(status.data.lastSyncedAt)}` : "Not synced yet"}
              </p>
            </div>
            <Button onClick={runSync} disabled={sync.isPending} className="shrink-0">
              <RefreshCw size={15} className={sync.isPending ? "animate-spin" : ""} />
              {sync.isPending ? "Reading mail…" : "Sync"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setConfirmDisconnect(true)}
              aria-label="Disconnect Gmail"
              title="Disconnect Gmail"
              className="shrink-0 px-2.5"
            >
              <Unplug size={16} />
            </Button>
          </div>
        )}
      </header>

      {status.isLoading && (
        <div className="space-y-4">
          <SkeletonCards count={4} />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {status.error && <p className="text-red-400">{status.error.message}</p>}

      {status.data && !status.data.configured && <SetupGmailCard />}

      {status.data?.configured && !connected && (
        <ConnectGmailCard onConnect={() => connect.mutate(undefined, { onError: (e) => toast.error(e.message) })} connecting={connect.isPending} />
      )}

      {connected && !status.data.aiConfigured && (
        <p className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <CircleAlert size={16} className="shrink-0" />
          AI summaries are off — add <code>GEMINI_API_KEY</code> to <code>server/.env</code> and restart the server.
        </p>
      )}

      {connected && (
        <>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { icon: AlarmClock, label: "Due in 48 hours", value: stats.dueSoon, tone: "text-red-400" },
              { icon: ListTodo, label: "Need action", value: stats.needsAction, tone: "text-amber-400" },
              { icon: Sparkles, label: "Exams & interviews ahead", value: stats.upcoming, tone: "text-[var(--primary)]" },
              { icon: Inbox, label: "Emails summarized", value: stats.total, tone: "text-gray-400" },
            ].map((s) => (
              <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                <Stat {...s} />
              </motion.div>
            ))}
          </motion.div>

          <section aria-labelledby="wall-heading" className="cork-board rounded-xl border border-[var(--border)] p-4 sm:p-6">
            <div className="flex items-baseline justify-between gap-3 mb-5">
              <h2 id="wall-heading" className="text-lg font-semibold text-white">
                Action wall
              </h2>
              <span className="text-xs text-gray-400">{wallCount} note{wallCount === 1 ? "" : "s"}</span>
            </div>

            {insightsQuery.isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : wallCount === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <PartyPopper size={28} strokeWidth={1.5} className="text-[var(--warm)]" />
                <p className="mt-3 font-medium text-white">Nothing needs you right now</p>
                <p className="mt-1 text-sm text-gray-400 max-w-sm">
                  {stats.total
                    ? "Every deadline is handled. Sync again later to catch new mail."
                    : "Hit Sync to read your recent mail."}
                </p>
              </div>
            ) : (
              <div className="grid gap-8 lg:gap-6 lg:grid-cols-3">
                {WALL_COLUMNS.map((col) => (
                  <div key={col.key} className="min-w-0">
                    <div className="mb-4 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                      <h3 className="text-sm font-semibold text-gray-200">{col.title}</h3>
                      <span className="text-xs text-gray-400">{wall[col.key].length}</span>
                    </div>
                    <p className="sr-only">{col.hint}</p>

                    {wall[col.key].length === 0 ? (
                      <p className="rounded-md border border-dashed border-[var(--border)] py-6 text-center text-xs text-gray-400">
                        Clear
                      </p>
                    ) : (
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                        <AnimatePresence mode="popLayout">
                          {wall[col.key].map((insight) => (
                            <StickyNote
                              key={insight._id}
                              insight={insight}
                              busy={pendingId === insight._id}
                              onDone={() => setStatus(insight, "done")}
                              onPin={() => togglePin(insight)}
                              onTask={() => moveToTask(insight)}
                              onTrack={() => track(insight)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="all-heading" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 id="all-heading" className="text-lg font-semibold text-white">
                All summaries
              </h2>
              <div role="tablist" className="inline-flex rounded-lg border border-[var(--border)] p-1 self-start">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      tab === t.key ? "text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab === t.key && (
                      <motion.span
                        layoutId="inbox-tab"
                        className="absolute inset-0 rounded-md bg-white/[0.08]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">
                      {t.label} <span className="text-gray-400">{tabCounts[t.key]}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {Object.keys(categoryCounts).length > 1 && (
              <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto pb-1">
                {["all", ...Object.keys(EMAIL_CATEGORY_META).filter((c) => categoryCounts[c])].map((c) => {
                  const active = category === c;
                  const meta = EMAIL_CATEGORY_META[c];
                  const Icon = meta?.icon;
                  return (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      aria-pressed={active}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-[var(--primary)]/50 bg-[var(--primary)]/15 text-white"
                          : "border-[var(--border)] text-gray-300 hover:text-white hover:border-[var(--border-strong)]"
                      }`}
                    >
                      {Icon && <Icon size={13} />}
                      {c === "all" ? "All" : meta.label}
                      <span className="text-gray-400">{c === "all" ? inTab.length : categoryCounts[c]}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {insightsQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : listed.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title={tab === "open" ? "No open emails" : tab === "done" ? "Nothing marked done yet" : "Nothing hidden"}
                description={
                  tab === "dismissed"
                    ? "Newsletters and FYI mail with nothing to do land here automatically."
                    : undefined
                }
              />
            ) : (
              <ul className="space-y-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {listed.map((insight) => (
                    <EmailRow
                      key={insight._id}
                      insight={insight}
                      busy={pendingId === insight._id}
                      onStatus={(next) => setStatus(insight, next)}
                      onTask={() => moveToTask(insight)}
                      onTrack={() => track(insight)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={confirmDisconnect}
        title="Disconnect Gmail?"
        description="LifeOS will lose access to your mail and permanently erase every summary it has stored. Tasks and opportunities you created from emails are kept."
        confirmLabel="Disconnect & erase"
        onConfirm={confirmDisconnectGmail}
        onCancel={() => setConfirmDisconnect(false)}
      />
    </div>
  );
}
