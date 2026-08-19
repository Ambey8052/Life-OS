import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PRIORITIES, TASK_STATUSES, label } from "../constants";
import { useCreateTask, useUpdateTask } from "../hooks/useTasks";
import Button from "./ui/Button";

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function TaskFormModal({ task, onClose }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    dueDate: toDateInput(task?.dueDate),
    priority: task?.priority || "medium",
    status: task?.status || "todo",
  });
  const [error, setError] = useState("");

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const submitting = createMutation.isPending || updateMutation.isPending;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = { ...form, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: task._id, data: payload });
        toast.success("Task updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Task added");
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-6"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">{isEdit ? "Edit Task" : "Add Task"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Title">
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Due Date">
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => update("dueDate", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
                className={inputClass}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {label(p)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className={inputClass}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Add task"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

const inputClass =
  "w-full rounded-md bg-white/[0.04] border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/30 transition";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-400 mb-1">{label}</span>
      {children}
    </label>
  );
}
