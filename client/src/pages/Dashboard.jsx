import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useDashboardToday } from "../hooks/useOpportunities";
import { PRIORITY_STYLES, PRIORITY_ICON, PRIORITY_TEXT, formatDate, label } from "../constants";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonCards, SkeletonRows } from "../components/ui/Skeleton";

const BUCKET_ORDER = [
  { key: "critical", title: "Critical" },
  { key: "high", title: "Important" },
  { key: "medium", title: "Worth Watching" },
  { key: "low", title: "Optional" },
];

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Dashboard() {
  const { data, isLoading, error } = useDashboardToday();

  if (isLoading)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Today's Focus</h1>
          <p className="text-gray-400 text-sm mt-1">What matters right now, ranked automatically.</p>
        </div>
        <SkeletonCards count={4} />
        <SkeletonRows count={3} />
      </div>
    );
  if (error) return <p className="text-red-400">{error.message}</p>;

  const { overview, buckets } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Today's Focus</h1>
        <p className="text-gray-400 text-sm mt-1">What matters right now, ranked automatically.</p>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <StatCard label="Active Opportunities" value={overview.totalOpportunities} />
        <StatCard label="Upcoming Interviews" value={overview.upcomingInterviews} />
        <StatCard label="Deadlines (7 days)" value={overview.upcomingDeadlines} />
        <StatCard label="Follow-ups Due" value={overview.pendingFollowUps} />
      </motion.div>

      {BUCKET_ORDER.map(({ key, title }) => {
        const Icon = PRIORITY_ICON[key];
        return (
          buckets[key]?.length > 0 && (
            <section key={key}>
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 mb-3">
                <Icon size={14} strokeWidth={2} className={PRIORITY_TEXT[key]} />
                {title}
              </h2>
              <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-2">
                {buckets[key].map((item) => (
                  <OpportunityRow key={item._id} item={item} />
                ))}
              </motion.div>
            </section>
          )
        );
      })}

      {overview.totalOpportunities === 0 && (
        <EmptyState
          icon={Flame}
          title="No active opportunities yet"
          description="Add your first opportunity and LifeOS will rank it for you automatically."
          action={
            <Link to="/opportunities">
              <Button>Add your first opportunity</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <motion.div
      variants={rowVariants}
      className="rounded-lg border border-[var(--border)] bg-white/[0.03] p-4 transition-colors hover:border-[var(--border-strong)]"
    >
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </motion.div>
  );
}

function OpportunityRow({ item }) {
  return (
    <motion.div variants={rowVariants}>
      <Link
        to="/opportunities"
        className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:border-[var(--border-strong)] ${PRIORITY_STYLES[item.priorityLabel]}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {item.logoUrl && (
            <img src={item.logoUrl} alt="" className="w-7 h-7 rounded-md border border-[var(--border)] shrink-0 bg-white/5" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{item.title}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {item.organization && `${item.organization} • `}
              {label(item.status)}
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-300">
          {item.deadline && <p>Deadline {formatDate(item.deadline)}</p>}
          {item.interview?.scheduled && item.interview.date && (
            <p>Interview {formatDate(item.interview.date)}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
