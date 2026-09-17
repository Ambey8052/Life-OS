import { AnimatePresence } from "framer-motion";
import Button from "./Button";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  danger = true,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <Modal onClose={onCancel} size="sm">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {description && <p className="text-sm text-gray-400 mt-2">{description}</p>}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
