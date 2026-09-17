import { useState } from "react";
import toast from "react-hot-toast";
import { useCreateNote, useUpdateNote } from "../../hooks/useNotes";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { inputClass } from "../ui/Field";

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
    <Modal onClose={onClose}>
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
    </Modal>
  );
}
