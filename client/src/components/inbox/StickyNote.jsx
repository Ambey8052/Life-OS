import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Check, ExternalLink, ListPlus, Pin, PinOff, Target } from "lucide-react";
import { TRACKABLE_CATEGORIES, categoryMeta, describeDate, keyDateOf, tiltFor } from "../../utils/inbox";

const DATE_TONE = {
  overdue: "bg-red-700 text-white",
  urgent: "bg-red-100 text-red-800 ring-1 ring-red-300",
  soon: "bg-amber-100 text-amber-900 ring-1 ring-amber-300",
  later: "bg-stone-900/10 text-stone-800",
};

function NoteButton({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid place-items-center w-9 h-9 rounded-md text-stone-700 hover:text-stone-950 hover:bg-stone-900/10 disabled:opacity-40 disabled:pointer-events-none transition-colors"
    >
      {children}
    </button>
  );
}

const StickyNote = forwardRef(function StickyNote(
  { insight, onDone, onPin, onTask, onTrack, busy },
  ref
) {
  const meta = categoryMeta(insight.category);
  const Icon = meta.icon;
  const date = describeDate(keyDateOf(insight));
  const tilt = tiltFor(insight._id);
  const isCritical = insight.importance === "critical";
  const canTrack = TRACKABLE_CATEGORIES.has(insight.category) && !insight.opportunityId;

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 14, rotate: tilt - 3 }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      exit={{ opacity: 0, y: -24, rotate: tilt + 8, scale: 0.9, transition: { duration: 0.22 } }}
      whileHover={{ rotate: 0, y: -3, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="sticky-paper relative rounded-sm px-4 pt-5 pb-2 flex flex-col"
    >
      {isCritical || insight.pinned ? (
        <span
          aria-hidden
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-red-600 shadow-[0_2px_3px_rgba(0,0,0,0.45),inset_-1px_-1px_2px_rgba(0,0,0,0.3)]"
        />
      ) : (
        <span aria-hidden className="sticky-tape absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 rotate-[-3deg]" />
      )}

      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-stone-700">
        <span className="inline-flex items-center gap-1 min-w-0">
          <Icon size={12} strokeWidth={2.25} className="shrink-0" />
          <span className="truncate">{meta.label}</span>
        </span>
        {isCritical && <span className="text-red-700 shrink-0">Urgent</span>}
      </div>

      <h3 className="font-hand text-[1.6rem] leading-[1.1] mt-1.5 text-stone-900 break-words">
        {insight.action || insight.subject}
      </h3>

      {date && (
        <span className={`self-start mt-2 rounded px-1.5 py-0.5 text-[11px] font-semibold ${DATE_TONE[date.tone]}`}>
          {date.label}
        </span>
      )}

      <p className="mt-2 text-[13px] leading-snug text-stone-700 line-clamp-3">{insight.summary}</p>

      <p className="mt-2 text-[11px] text-stone-600 truncate">From {insight.fromName || insight.fromEmail}</p>

      <div className="mt-2 -mx-2 pt-1 border-t border-stone-900/10 flex items-center justify-between">
        <div className="flex items-center">
          <NoteButton label="Mark done" onClick={onDone} disabled={busy}>
            <Check size={17} strokeWidth={2.25} />
          </NoteButton>
          <NoteButton label={insight.pinned ? "Unpin" : "Pin to top"} onClick={onPin} disabled={busy}>
            {insight.pinned ? <PinOff size={15} strokeWidth={2} /> : <Pin size={15} strokeWidth={2} />}
          </NoteButton>
          <NoteButton label="Move to Tasks" onClick={onTask} disabled={busy}>
            <ListPlus size={16} strokeWidth={2} />
          </NoteButton>
          {canTrack && (
            <NoteButton label="Track as opportunity" onClick={onTrack} disabled={busy}>
              <Target size={15} strokeWidth={2} />
            </NoteButton>
          )}
        </div>
        {insight.gmailUrl && (
          <a
            href={insight.gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in Gmail"
            title="Open in Gmail"
            className="grid place-items-center w-9 h-9 rounded-md text-stone-700 hover:text-stone-950 hover:bg-stone-900/10 transition-colors"
          >
            <ExternalLink size={15} strokeWidth={2} />
          </a>
        )}
      </div>
    </motion.article>
  );
});

export default StickyNote;
