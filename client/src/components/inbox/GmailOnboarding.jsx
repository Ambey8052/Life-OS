import { motion } from "framer-motion";
import { AlarmClock, LoaderCircle, Mail, ShieldCheck, Sparkles, StickyNote } from "lucide-react";
import Button from "../ui/Button";

const BENEFITS = [
  {
    icon: Sparkles,
    title: "One-line summaries",
    text: "Every important email boiled down to what it is and what it wants from you.",
  },
  {
    icon: StickyNote,
    title: "A sticky-note wall",
    text: "Exam forms, fee payments and interview confirmations pinned by how soon they're due.",
  },
  {
    icon: AlarmClock,
    title: "Dates you won't miss",
    text: "Deadlines and interview times pulled out of the email text — even “reply by tonight”.",
  },
];

export function ConnectGmailCard({ onConnect, connecting }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8"
    >
      <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/25 grid place-items-center">
        <Mail size={22} strokeWidth={1.75} className="text-[var(--primary)]" />
      </div>
      <h2 className="mt-4 text-xl sm:text-2xl font-semibold text-white">
        Stop reading every email. Read what matters.
      </h2>
      <p className="mt-2 text-gray-300 max-w-xl">
        Connect Gmail and LifeOS reads your recent mail, summarizes it with AI, and turns anything with a
        deadline into a note on your wall.
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-lg border border-[var(--border)] bg-white/[0.02] p-4">
            <Icon size={18} strokeWidth={1.75} className="text-[var(--warm)]" />
            <p className="mt-2 font-medium text-white">{title}</p>
            <p className="mt-1 text-sm text-gray-400 leading-relaxed">{text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center gap-4">
        <Button onClick={onConnect} disabled={connecting} className="w-full sm:w-auto px-5">
          {connecting ? <LoaderCircle size={16} className="animate-spin" /> : <Mail size={16} />}
          {connecting ? "Opening Google…" : "Connect Gmail"}
        </Button>
        <p className="flex items-start gap-2 text-xs text-gray-400 max-w-md">
          <ShieldCheck size={15} className="shrink-0 text-[var(--primary)] mt-px" />
          Read-only access. LifeOS stores short AI summaries — never your full emails — and can't send,
          delete or change anything. Disconnect any time to erase it all.
        </p>
      </div>
    </motion.section>
  );
}

const SETUP_STEPS = [
  <>
    In <span className="text-white">Google Cloud Console</span>, create a project and enable the{" "}
    <span className="text-white">Gmail API</span>.
  </>,
  <>
    Configure the <span className="text-white">OAuth consent screen</span> (External, Testing) and add your
    Gmail address as a <span className="text-white">test user</span>.
  </>,
  <>
    Create an <span className="text-white">OAuth client ID</span> of type Web application with redirect URI{" "}
    <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[12px] text-[var(--primary)] break-all">
      http://localhost:5173/api/gmail/callback
    </code>
  </>,
  <>
    Put the client ID and secret in <code className="text-[var(--primary)]">server/.env</code> as{" "}
    <code className="text-[var(--primary)]">GOOGLE_CLIENT_ID</code> and{" "}
    <code className="text-[var(--primary)]">GOOGLE_CLIENT_SECRET</code>, then restart the server.
  </>,
];

export function SetupGmailCard() {
  return (
    <section className="rounded-xl border border-dashed border-[var(--border-strong)] p-5 sm:p-8">
      <h2 className="text-lg font-semibold text-white">Gmail isn't connected to this server yet</h2>
      <p className="mt-1 text-sm text-gray-400">A one-time setup, about five minutes:</p>
      <ol className="mt-5 space-y-3">
        {SETUP_STEPS.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
            <span className="grid place-items-center w-6 h-6 shrink-0 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-semibold">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
