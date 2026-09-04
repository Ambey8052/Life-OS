import { Inbox } from "lucide-react";
import { useOpportunities } from "../hooks/useOpportunities";
import { formatDate, statusLabel } from "../constants";
import { SkeletonRows } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";

const STAGES = ["applied", "screening", "assessment", "interview", "offer", "accepted", "rejected"];

export default function Applications() {
  const { data: opportunities, isLoading, error } = useOpportunities();

  if (isLoading)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-gray-400 text-sm mt-1">Everything you've actually applied to, by stage.</p>
        </div>
        <SkeletonRows count={5} />
      </div>
    );
  if (error) return <p className="text-red-400">{error.message}</p>;

  const applications = (opportunities || []).filter((o) => STAGES.includes(o.status));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Applications</h1>
        <p className="text-gray-400 text-sm mt-1">Everything you've actually applied to, by stage.</p>
      </div>

      {STAGES.map((stage) => {
        const items = applications.filter((a) => a.status === stage);
        if (items.length === 0) return null;
        return (
          <section key={stage}>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">
              {statusLabel(stage)} <span className="text-gray-500">({items.length})</span>
            </h2>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.organization}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    {item.appliedAt && <p>Applied {formatDate(item.appliedAt)}</p>}
                    {item.followUpDate && <p>Follow up {formatDate(item.followUpDate)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {applications.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="No applications yet"
          description={'Mark an opportunity\'s status as "Applied" to see it here.'}
        />
      )}
    </div>
  );
}
