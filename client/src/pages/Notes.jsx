import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, StickyNote } from "lucide-react";
import { useNotes, useDeleteNote } from "../hooks/useNotes";
import { formatDate } from "../constants";
import NoteFormModal from "../components/NoteFormModal";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";

const gridVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

export default function Notes() {
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const { data: notes, isLoading, error } = useNotes(q ? { q } : {});
  const deleteMutation = useDeleteNote();

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(note) {
    setEditing(note);
    setModalOpen(true);
  }

  async function confirmDelete() {
    try {
      await deleteMutation.mutateAsync(pendingDelete._id);
      toast.success("Note deleted");
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
          <h1 className="text-2xl font-semibold">Notes</h1>
          <p className="text-gray-400 text-sm mt-1">Ideas, research and things worth remembering.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} strokeWidth={2} />
          Add Note
        </Button>
      </div>

      <input
        placeholder="Search notes…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-md bg-white/[0.04] border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/30 transition"
      />

      {isLoading && (
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}
      {error && <p className="text-red-400">{error.message}</p>}

      {!isLoading && notes?.length === 0 && (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Capture interview prep, research or ideas connected to your opportunities."
          action={
            <Button onClick={openCreate}>
              <Plus size={16} strokeWidth={2} />
              Add Note
            </Button>
          }
        />
      )}

      <motion.div variants={gridVariants} initial="hidden" animate="show" className="grid sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {notes?.map((note) => (
            <motion.div
              key={note._id}
              variants={cardVariants}
              exit="exit"
              layout
              whileHover={{ y: -2 }}
              className="rounded-lg border border-[var(--border)] bg-white/[0.03] p-4 flex flex-col transition-colors hover:border-[var(--border-strong)]"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-white">{note.title}</h3>
                <div className="flex gap-2 text-xs shrink-0">
                  <button onClick={() => openEdit(note)} className="text-gray-300 hover:text-white transition">
                    Edit
                  </button>
                  <button
                    onClick={() => setPendingDelete(note)}
                    className="text-gray-300 hover:text-red-400 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {note.content && (
                <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap line-clamp-4">{note.content}</p>
              )}
              <p className="text-xs text-gray-500 mt-3">{formatDate(note.createdAt)}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {modalOpen && <NoteFormModal note={editing} onClose={() => setModalOpen(false)} />}
      </AnimatePresence>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this note?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : ""}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
