import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, CheckSquare } from "lucide-react";
import { useTasks, useDeleteTask, useUpdateTask } from "../hooks/useTasks";
import { PRIORITY_STYLES, TASK_STATUSES, formatDate, label } from "../constants";
import TaskFormModal from "../components/TaskFormModal";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonRows } from "../components/ui/Skeleton";

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -12, transition: { duration: 0.15 } },
};

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const filters = {};
  if (statusFilter) filters.status = statusFilter;

  const { data: tasks, isLoading, error } = useTasks(filters);
  const deleteMutation = useDeleteTask();
  const updateMutation = useUpdateTask();

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditing(task);
    setModalOpen(true);
  }

  async function confirmDelete() {
    try {
      await deleteMutation.mutateAsync(pendingDelete._id);
      toast.success("Task deleted");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPendingDelete(null);
    }
  }

  async function toggleDone(task) {
    await updateMutation.mutateAsync({
      id: task._id,
      data: { status: task.status === "done" ? "todo" : "done" },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-gray-400 text-sm mt-1">Small actionable to-dos, separate from opportunities.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} strokeWidth={2} />
          Add Task
        </Button>
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-md bg-white/[0.04] border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]/50 transition"
      >
        <option value="">All statuses</option>
        {TASK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {label(s)}
          </option>
        ))}
      </select>

      {isLoading && <SkeletonRows count={4} />}
      {error && <p className="text-red-400">{error.message}</p>}

      {!isLoading && tasks?.length === 0 && (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Break opportunities down into small, trackable to-dos."
          action={
            <Button onClick={openCreate}>
              <Plus size={16} strokeWidth={2} />
              Add Task
            </Button>
          }
        />
      )}

      <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-2">
        <AnimatePresence>
          {tasks?.map((task) => (
            <motion.div
              key={task._id}
              variants={rowVariants}
              exit="exit"
              layout
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${PRIORITY_STYLES[task.priority]}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.status === "done"}
                  onChange={() => toggleDone(task)}
                  className="w-4 h-4 accent-[var(--primary)]"
                />
                <div>
                  <p className={`font-medium text-white ${task.status === "done" ? "line-through opacity-60" : ""}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {label(task.status)}
                    {task.dueDate && ` • Due ${formatDate(task.dueDate)}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <button onClick={() => openEdit(task)} className="text-gray-300 hover:text-white transition">
                  Edit
                </button>
                <button
                  onClick={() => setPendingDelete(task)}
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
        {modalOpen && <TaskFormModal task={editing} onClose={() => setModalOpen(false)} />}
      </AnimatePresence>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this task?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : ""}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
