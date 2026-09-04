import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Target, Send } from "lucide-react";
import { useOpportunities, useDeleteOpportunity } from "../hooks/useOpportunities";
import { PRIORITY_STYLES, STATUSES, formatDate, label, statusLabel } from "../constants";
import OpportunityFormModal from "../components/OpportunityFormModal";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonRows } from "../components/ui/Skeleton";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -12, transition: { duration: 0.15 } },
};

export default function Opportunities() {
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [logApplication, setLogApplication] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const filters = {};
  if (statusFilter) filters.status = statusFilter;
  if (q) filters.q = q;

  const { data: opportunities, isLoading, error } = useOpportunities(filters);
  const deleteMutation = useDeleteOpportunity();

  function openCreate() {
    setEditing(null);
    setLogApplication(false);
    setModalOpen(true);
  }

  function openLogApplication() {
    setEditing(null);
    setLogApplication(true);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setLogApplication(false);
    setModalOpen(true);
  }

  async function confirmDelete() {
    try {
      await deleteMutation.mutateAsync(pendingDelete._id);
      toast.success("Opportunity deleted");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Opportunities</h1>
          <p className="text-gray-400 text-sm mt-1">Everything you're tracking, in one lifecycle.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={openLogApplication}>
            <Send size={16} strokeWidth={2} />
            Log Application
          </Button>
          <Button onClick={openCreate}>
            <Plus size={16} strokeWidth={2} />
            Add Opportunity
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="rounded-md bg-white/[0.04] border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/30 transition flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md bg-white/[0.04] border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]/50 transition"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <SkeletonRows count={5} />}
      {error && <p className="text-red-400">{error.message}</p>}

      {!isLoading && opportunities?.length === 0 && (
        <EmptyState
          icon={Target}
          title="No opportunities match your filters"
          description="Add your first job, internship or opportunity to start tracking it here."
          action={
            <Button onClick={openCreate}>
              <Plus size={16} strokeWidth={2} />
              Add Opportunity
            </Button>
          }
        />
      )}

      <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-2">
        <AnimatePresence>
          {opportunities?.map((item) => (
            <motion.div
              key={item._id}
              variants={rowVariants}
              exit="exit"
              layout
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${PRIORITY_STYLES[item.priorityLabel]}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.logoUrl && (
                  <img
                    src={item.logoUrl}
                    alt=""
                    className="w-8 h-8 rounded-md border border-[var(--border)] shrink-0 bg-white/5"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {item.organization && `${item.organization} • `}
                    {label(item.category)} • {statusLabel(item.status)}
                    {item.status === "discovered" || item.status === "saved"
                      ? item.deadline && ` • Deadline ${formatDate(item.deadline)}`
                      : item.followUpDate && ` • Follow up ${formatDate(item.followUpDate)}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 text-xs shrink-0">
                <button onClick={() => openEdit(item)} className="text-gray-300 hover:text-white transition">
                  Edit
                </button>
                <button
                  onClick={() => setPendingDelete(item)}
                  className="text-gray-300 hover:text-red-400 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {modalOpen && (
          <OpportunityFormModal
            opportunity={editing}
            initialValues={logApplication ? { status: "applied", appliedAt: new Date().toISOString() } : undefined}
            onClose={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this opportunity?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : ""}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
