import { motion } from "framer-motion";

export default function ComingSoon({ icon: Icon, title, description, phase }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center py-24 rounded-lg border border-dashed border-[var(--border)]"
    >
      <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-[var(--border)] flex items-center justify-center mb-5">
        <Icon size={24} strokeWidth={1.5} className="text-[var(--text-muted)]" />
      </div>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-gray-400 text-sm mt-2 max-w-sm">{description}</p>
      {phase && (
        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/[0.03] px-3 py-1 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--warm)]" />
          {phase}
        </span>
      )}
    </motion.div>
  );
}
