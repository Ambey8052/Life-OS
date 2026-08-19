import { motion } from "framer-motion";

const VARIANTS = {
  primary: "bg-[var(--primary)] text-[var(--primary-on)] hover:bg-[var(--primary-strong)]",
  secondary:
    "bg-white/[0.04] border border-[var(--border)] text-gray-200 hover:text-white hover:border-[var(--border-strong)] hover:bg-white/[0.07]",
  ghost: "text-gray-400 hover:text-white hover:bg-white/5",
  danger: "bg-red-500/10 border border-red-500/25 text-red-300 hover:bg-red-500/20 hover:text-red-200",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
