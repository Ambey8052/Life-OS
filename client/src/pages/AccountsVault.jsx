import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useOpportunities, useRevealCredential } from "../hooks/useOpportunities";
import { statusLabel } from "../constants";
import OpportunityFormModal from "../components/OpportunityFormModal";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonRows } from "../components/ui/Skeleton";

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const rowVariants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function AccountsVault() {
  const { data: opportunities, isLoading, error } = useOpportunities();
  const [editing, setEditing] = useState(null);

  const accounts = (opportunities || []).filter((o) => o.hasCredential);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Accounts Vault</h1>
        <p className="text-gray-400 text-sm mt-1">
          Every login you've saved against an opportunity, encrypted with AES-256-GCM. Passwords are
          decrypted only when you click Reveal.
        </p>
      </div>

      {isLoading && <SkeletonRows count={4} />}
      {error && <p className="text-red-400">{error.message}</p>}

      {!isLoading && accounts.length === 0 && (
        <EmptyState
          icon={Lock}
          title="No saved logins yet"
          description={'Add a "Login used" and password when logging an application, and it\'ll show up here.'}
        />
      )}

      <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-2">
        {accounts.map((item) => (
          <AccountRow key={item._id} item={item} onEdit={() => setEditing(item)} />
        ))}
      </motion.div>

      <AnimatePresence>
        {editing && <OpportunityFormModal opportunity={editing} onClose={() => setEditing(null)} />}
      </AnimatePresence>
    </div>
  );
}

function AccountRow({ item, onEdit }) {
  const [revealed, setRevealed] = useState("");
  const revealMutation = useRevealCredential();

  async function toggleReveal() {
    if (revealed) return setRevealed("");
    try {
      const password = await revealMutation.mutateAsync(item._id);
      setRevealed(password);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <motion.div
      variants={rowVariants}
      className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-white/[0.03] px-4 py-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        {item.logoUrl ? (
          <img src={item.logoUrl} alt="" className="w-8 h-8 rounded-md border border-[var(--border)] shrink-0 bg-white/5" />
        ) : (
          <div className="w-8 h-8 rounded-md border border-[var(--border)] shrink-0 flex items-center justify-center">
            <Lock size={14} strokeWidth={1.75} className="text-[var(--text-muted)]" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-white truncate">
            {item.organization || item.title}
            {item.organization && <span className="text-gray-500"> · {item.title}</span>}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {item.loginIdentifier || "no login saved"} • {statusLabel(item.status)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs shrink-0">
        {revealed && <span className="font-mono text-white">{revealed}</span>}
        <button onClick={toggleReveal} className="flex items-center gap-1 text-gray-300 hover:text-white transition">
          {revealed ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
          {revealed ? "Hide" : "Reveal"}
        </button>
        <button onClick={onEdit} className="text-gray-300 hover:text-white transition">
          Edit
        </button>
      </div>
    </motion.div>
  );
}
