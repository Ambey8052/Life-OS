import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { useGmailStatus, useInsights } from "../../hooks/useInbox";
import { buildWall, categoryMeta, describeDate, keyDateOf } from "../../utils/inbox";

const NO_INSIGHTS = [];

const TONE = {
  overdue: "text-red-700",
  urgent: "text-red-700",
  soon: "text-amber-800",
  later: "text-stone-700",
};

export default function InboxWidget() {
  const status = useGmailStatus();
  const connected = Boolean(status.data?.connected);
  const { data: insights = NO_INSIGHTS } = useInsights({ status: "all", enabled: connected });

  const top = useMemo(() => {
    const wall = buildWall(insights);
    return [...wall.now, ...wall.week].slice(0, 3);
  }, [insights]);

  if (!status.data?.configured) return null;

  if (!connected) {
    return (
      <Link
        to="/inbox"
        className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--border-strong)] px-4 py-3 text-sm text-gray-300 hover:text-white hover:border-[var(--primary)]/50 transition-colors"
      >
        <Mail size={18} className="shrink-0 text-[var(--primary)]" />
        <span className="flex-1">Connect Gmail to see exam, fee and interview deadlines from your email here.</span>
        <ArrowRight size={16} className="shrink-0" />
      </Link>
    );
  }

  if (top.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-300">
          <Mail size={14} className="text-[var(--primary)]" />
          From your inbox
        </h2>
        <Link to="/inbox" className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1 transition-colors">
          Open wall <ArrowRight size={12} />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {top.map((insight, i) => {
          const date = describeDate(keyDateOf(insight));
          const Icon = categoryMeta(insight.category).icon;
          return (
            <motion.div
              key={insight._id}
              initial={{ opacity: 0, y: 8, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: i % 2 ? 0.8 : -0.8 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to="/inbox" className="sticky-paper block rounded-sm px-3.5 py-3 hover:-translate-y-0.5 transition-transform">
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-stone-700">
                  <Icon size={11} strokeWidth={2.25} />
                  {categoryMeta(insight.category).label}
                </span>
                <span className="font-hand block text-xl leading-tight mt-1 text-stone-900 line-clamp-2">
                  {insight.action || insight.subject}
                </span>
                {date && <span className={`block mt-1 text-[11px] font-semibold ${TONE[date.tone]}`}>{date.label}</span>}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
