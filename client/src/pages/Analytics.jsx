import { motion } from "framer-motion";
import { useAnalytics } from "../hooks/useAnalytics";
import { statusLabel } from "../constants";
import { SkeletonCards, SkeletonRows } from "../components/ui/Skeleton";

export default function Analytics() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">How your opportunities are actually moving.</p>
        </div>
        <SkeletonCards count={5} />
        <SkeletonRows count={5} className="h-6" />
      </div>
    );
  if (error) return <p className="text-red-400">{error.message}</p>;

  const maxFunnel = Math.max(1, ...data.funnel.map((f) => f.count));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">How your opportunities are actually moving.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Total" value={data.total} />
        <StatCard label="Applications" value={data.applications} />
        <StatCard label="Interviews" value={data.interviews} />
        <StatCard label="Offers" value={data.offers} />
        <StatCard label="Rejected" value={data.rejected} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard label="Interview Conversion" value={`${data.interviewConversion}%`} />
        <StatCard label="Offer Conversion" value={`${data.offerConversion}%`} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Application Funnel</h2>
        <div className="space-y-2">
          {data.funnel.map((f) => (
            <div key={f.stage} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-sm text-gray-300">{statusLabel(f.stage)}</span>
              <div className="flex-1 h-4 rounded-md bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--primary)] rounded-md"
                  initial={{ width: 0 }}
                  animate={{ width: `${(f.count / maxFunnel) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="w-8 text-right text-sm text-gray-400">{f.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Status Breakdown</h2>
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(data.statusCounts).map(([status, count]) => (
            <div key={status} className="rounded-lg border border-[var(--border)] bg-white/[0.03] p-4">
              <p className="text-xl font-semibold">{count}</p>
              <p className="text-xs text-gray-400 mt-1">{statusLabel(status)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white/[0.03] p-4 transition-colors hover:border-[var(--border-strong)]">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}
