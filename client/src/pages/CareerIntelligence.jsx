import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { useAnalytics } from "../hooks/useAnalytics";
import { label } from "../constants";
import { SkeletonCards, SkeletonRows } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";

export default function CareerIntelligence() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Career Intelligence</h1>
          <p className="text-gray-400 text-sm mt-1">
            What your own applications reveal about the skills employers keep asking for.
          </p>
        </div>
        <SkeletonRows count={5} className="h-5" />
        <SkeletonCards count={3} />
      </div>
    );
  if (error) return <p className="text-red-400">{error.message}</p>;

  const maxCount = Math.max(1, ...data.topSkills.map((s) => s.count));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Career Intelligence</h1>
        <p className="text-gray-400 text-sm mt-1">
          What your own applications reveal about the skills employers keep asking for.
        </p>
      </div>

      {data.topSkills.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No skill trends yet"
          description="Add a skills list to your opportunities to see which ones recur most."
        />
      ) : (
        <div className="space-y-3">
          {data.topSkills.map(({ skill, count }) => (
            <div key={skill} className="flex items-center gap-3">
              <span className="w-24 sm:w-32 shrink-0 text-xs sm:text-sm text-gray-300 truncate">{skill}</span>
              <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--primary)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="w-6 text-right text-sm text-gray-400">{count}</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Opportunities by Category</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(data.categoryCounts).map(([category, count]) => (
            <div
              key={category}
              className="rounded-lg border border-[var(--border)] bg-white/[0.03] p-4 transition-colors hover:border-[var(--border-strong)]"
            >
              <p className="text-xl font-semibold">{count}</p>
              <p className="text-xs text-gray-400 mt-1">{label(category)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
