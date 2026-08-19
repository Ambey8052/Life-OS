import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function EmptyState({ icon: Icon = Sparkles, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-16 rounded-lg border border-dashed border-[var(--border)]"
    >
      <div className="w-11 h-11 rounded-full bg-white/[0.04] border border-[var(--border)] flex items-center justify-center mb-4">
        <Icon size={20} strokeWidth={1.75} className="text-[var(--text-muted)]" />
      </div>
      <p className="text-white font-medium">{title}</p>
      {description && <p className="text-gray-400 text-sm mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
