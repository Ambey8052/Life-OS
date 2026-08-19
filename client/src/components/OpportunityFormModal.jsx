import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { CATEGORIES, STATUSES, PRIORITIES, label } from "../constants";
import { useCreateOpportunity, useUpdateOpportunity } from "../hooks/useOpportunities";
import Button from "./ui/Button";

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function emptyForm() {
  return {
    title: "",
    organization: "",
    category: "other",
    website: "",
    applicationUrl: "",
    status: "saved",
    priority: "medium",
    deadline: "",
    location: "",
    salary: "",
    notes: "",
  };
}

export default function OpportunityFormModal({ opportunity, onClose }) {
  const isEdit = Boolean(opportunity);
  const [form, setForm] = useState(
    isEdit
      ? {
          title: opportunity.title || "",
          organization: opportunity.organization || "",
          category: opportunity.category || "other",
          website: opportunity.website || "",
          applicationUrl: opportunity.applicationUrl || "",
          status: opportunity.status || "saved",
          priority: opportunity.priority || "medium",
          deadline: toDateInput(opportunity.deadline),
          location: opportunity.location || "",
          salary: opportunity.salary || "",
          notes: opportunity.notes || "",
        }
      : emptyForm()
  );
  const [error, setError] = useState("");

  const createMutation = useCreateOpportunity();
  const updateMutation = useUpdateOpportunity();
  const submitting = createMutation.isPending || updateMutation.isPending;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: opportunity._id, data: payload });
        toast.success("Opportunity updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Opportunity added");
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
        className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-6 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">{isEdit ? "Edit Opportunity" : "Add Opportunity"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Title">
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Organization">
            <input
              value={form.organization}
              onChange={(e) => update("organization", e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {label(c)}
                  </option>
                ))}
              </select>
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className={inputClass}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Deadline">
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Application URL">
            <input
              value={form.applicationUrl}
              onChange={(e) => update("applicationUrl", e.target.value)}
              className={inputClass}
              placeholder="https://…"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Salary / Stipend">
              <input
                value={form.salary}
                onChange={(e) => update("salary", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Add opportunity"}
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
