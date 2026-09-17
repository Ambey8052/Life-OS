import { forwardRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, EyeOff, ExternalLink, ListPlus, Target, Undo2, Check } from "lucide-react";
import { PRIORITY_TEXT } from "../../constants";
import { TRACKABLE_CATEGORIES, categoryMeta, describeDate, keyDateOf, relativeTime } from "../../utils/inbox";

const IMPORTANCE_TILE = {
  critical: "bg-red-500/10 border-red-500/25",
  high: "bg-amber-500/10 border-amber-500/25",
  medium: "bg-yellow-500/10 border-yellow-500/20",
  low: "bg-white/[0.04] border-[var(--border)]",
};

const DATE_TONE = {
  overdue: "text-red-300 bg-red-500/15",
  urgent: "text-red-300 bg-red-500/10",
  soon: "text-amber-300 bg-amber-500/10",
  later: "text-gray-300 bg-white/[0.06]",
};

function RowAction({ icon: Icon, children, ...props }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-300 border border-[var(--border)] hover:text-white hover:border-[var(--border-strong)] hover:bg-white/[0.05] disabled:opacity-50 transition-colors"
      {...props}
    >
      <Icon size={13} strokeWidth={2} />
      {children}
    </button>
  );
}

const EmailRow = forwardRef(function EmailRow({ insight, onStatus, onTask, onTrack, busy }, ref) {
  const [open, setOpen] = useState(false);
  const meta = categoryMeta(insight.category);
  const Icon = meta.icon;
  const date = describeDate(keyDateOf(insight));
  const importanceText = PRIORITY_TEXT[insight.importance] || "text-gray-400";
  const canTrack = TRACKABLE_CATEGORIES.has(insight.category) && !insight.opportunityId;

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
      className="rounded-lg border border-[var(--border)] bg-white/[0.02] hover:border-[var(--border-strong)] transition-colors"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left flex items-start gap-3 px-3 sm:px-4 py-3"
      >
        <span
          className={`mt-0.5 grid place-items-center w-9 h-9 shrink-0 rounded-md border ${IMPORTANCE_TILE[insight.importance] || IMPORTANCE_TILE.low}`}
        >
          <Icon size={16} strokeWidth={1.9} className={importanceText} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-xs text-gray-400">
            <span className="font-semibold text-gray-200 truncate">{insight.fromName || insight.fromEmail}</span>
            <span aria-hidden>·</span>
            <span className="shrink-0">{meta.label}</span>
            <span className="ml-auto shrink-0">{relativeTime(insight.receivedAt)}</span>
          </span>
          <span className="block mt-1 text-sm text-gray-100 leading-snug">{insight.summary}</span>
          {(date || insight.action) && (
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              {date && <span className={`rounded px-1.5 py-0.5 font-medium ${DATE_TONE[date.tone]}`}>{date.label}</span>}
              {insight.action && <span className="text-[var(--primary)] font-medium">→ {insight.action}</span>}
            </span>
          )}
        </span>

        <ChevronDown
          size={16}
          className={`mt-1 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-4 pb-3 sm:pl-16 space-y-3">
              <p className="text-xs text-gray-400">
                <span className="text-gray-300">Subject:</span> {insight.subject}
              </p>

              {insight.keyDetails.length > 0 && (
                <ul className="space-y-1 text-sm text-gray-300">
                  {insight.keyDetails.map((detail) => (
                    <li key={detail} className="flex gap-2">
                      <span aria-hidden className="text-[var(--primary)]">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2">
                {insight.status === "open" ? (
                  <>
                    <RowAction icon={Check} onClick={() => onStatus("done")} disabled={busy}>
                      Done
                    </RowAction>
                    <RowAction icon={EyeOff} onClick={() => onStatus("dismissed")} disabled={busy}>
                      Hide
                    </RowAction>
                  </>
                ) : (
                  <RowAction icon={Undo2} onClick={() => onStatus("open")} disabled={busy}>
                    Move back to open
                  </RowAction>
                )}
                {!insight.taskId && (
                  <RowAction icon={ListPlus} onClick={onTask} disabled={busy}>
                    Add to Tasks
                  </RowAction>
                )}
                {canTrack && (
                  <RowAction icon={Target} onClick={onTrack} disabled={busy}>
                    Track opportunity
                  </RowAction>
                )}
                {insight.gmailUrl && (
                  <a
                    href={insight.gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-300 border border-[var(--border)] hover:text-white hover:border-[var(--border-strong)] hover:bg-white/[0.05] transition-colors"
                  >
                    <ExternalLink size={13} strokeWidth={2} />
                    Open in Gmail
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
});

export default EmailRow;
