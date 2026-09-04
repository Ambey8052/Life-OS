import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCreateNote, useUpdateNote } from "../hooks/useNotes";
import Button from "./ui/Button";

export default function NoteFormModal({ note, onClose }) {
  const isEdit = Boolean(note);
  const [form, setForm] = useState({
    title: note?.title || "",
    content: note?.content || "",
  });
  const [error, setError] = useState("");

  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const submitting = createMutation.isPending || updateMutation.isPending;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: note._id, data: form });
        toast.success("Note updated");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Note added");
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
        className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">{isEdit ? "Edit Note" : "Add Note"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className={inputClass}
          />
          <textarea
            placeholder="Write your note…"
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            rows={6}
            className={inputClass}
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Add note"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

const inputClass =
  "w-full rounded-md bg-white/[0.04] border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/30 transition";
