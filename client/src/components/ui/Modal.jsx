import { useEffect } from "react";
import { motion } from "framer-motion";

const WIDTHS = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

// Render inside <AnimatePresence> so the exit animation plays.
export default function Modal({ onClose, size = "lg", children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        className={`w-full ${WIDTHS[size]} rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-5 sm:p-6 max-h-[90vh] overflow-y-auto`}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
