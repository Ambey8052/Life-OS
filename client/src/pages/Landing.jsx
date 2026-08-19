import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Target, Flame, Bell, Lock, Bot, BarChart3, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

const MODULES = [
  {
    icon: Target,
    title: "Opportunity Tracker",
    desc: "Jobs, internships, scholarships, govt exams, hackathons — one lifecycle for all of them.",
    featured: true,
  },
  {
    icon: Flame,
    title: "Smart Priority",
    desc: "Deadline urgency, interview proximity and follow-ups combine into a single score.",
  },
  {
    icon: Bell,
    title: "Reminder Engine",
    desc: "Never miss a deadline, interview or follow-up again.",
  },
  {
    icon: Lock,
    title: "Account Vault",
    desc: "Encrypted credentials, never stored in plaintext.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    desc: "Ask what to focus on today, or how you match a job description.",
  },
  {
    icon: BarChart3,
    title: "Career Intelligence",
    desc: "See which skills keep showing up across your applications.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[var(--primary)]/15 border border-[var(--primary)]/25 flex items-center justify-center">
            <Compass size={15} strokeWidth={2} className="text-[var(--primary)]" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-white">LifeOS</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-400 hover:text-white transition px-2">
                Sign in
              </Link>
              <Link to="/register">
                <Button>Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-3xl mx-auto px-6 pt-16 pb-16 text-center"
      >
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-[var(--primary)] mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
          Opportunity command center
        </motion.div>
        <motion.h1
          variants={item}
          className="font-serif-display text-[2.75rem] sm:text-5xl leading-[1.1] text-white"
        >
          Your applications, deadlines and accounts <span className="text-primary">stop living in seven tabs</span>.
        </motion.h1>
        <motion.p variants={item} className="mt-6 text-gray-400 text-lg max-w-xl mx-auto">
          One place to track opportunities, deadlines, interviews and accounts — so you never
          have to hold it all in your head.
        </motion.p>
        <motion.div variants={item} className="mt-8 flex items-center justify-center gap-3">
          <Link to={user ? "/dashboard" : "/register"}>
            <Button className="px-6 py-3">
              {user ? "Go to Dashboard" : "Start tracking"}
              <ArrowRight size={16} strokeWidth={2} />
            </Button>
          </Link>
          <a href="#modules">
            <Button variant="secondary" className="px-6 py-3">
              See what it does
            </Button>
          </a>
        </motion.div>
      </motion.section>

      <motion.section
        id="modules"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-5xl mx-auto px-6 pb-24"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULES.map((m) => (
            <motion.div
              key={m.title}
              variants={item}
              className={`rounded-lg border border-[var(--border)] bg-white/[0.03] p-5 transition-colors hover:border-[var(--border-strong)] ${
                m.featured ? "sm:col-span-2 lg:col-span-1 lg:row-span-1" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-md bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center mb-4">
                <m.icon size={17} strokeWidth={1.75} className="text-[var(--primary)]" />
              </div>
              <h3 className="font-medium text-white mb-1">{m.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <footer className="max-w-5xl mx-auto px-6 pb-10 text-center text-xs text-gray-600">
        Capture once. Remember automatically. Act intelligently.
      </footer>
    </div>
  );
}
