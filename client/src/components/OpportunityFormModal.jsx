import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Trash2 } from "lucide-react";
import { CATEGORIES, STATUSES, PRIORITIES, label, statusLabel, faviconUrlFor } from "../constants";
import {
  useCreateOpportunity,
  useUpdateOpportunity,
  useSetCredential,
  useRevealCredential,
  useDeleteCredential,
} from "../hooks/useOpportunities";
import Button from "./ui/Button";

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function OpportunityFormModal({ opportunity, initialValues, onClose }) {
  const isEdit = Boolean(opportunity);
  const seed = opportunity || initialValues || {};

  const [form, setForm] = useState({
    title: seed.title || "",
    organization: seed.organization || "",
    category: seed.category || "other",
    website: seed.website || "",
    applicationUrl: seed.applicationUrl || "",
    loginIdentifier: seed.loginIdentifier || "",
    status: seed.status || "saved",
    priority: seed.priority || "medium",
    deadline: toDateInput(seed.deadline),
    appliedAt: toDateInput(seed.appliedAt),
    followUpDate: toDateInput(seed.followUpDate),
    location: seed.location || "",
    salary: seed.salary || "",
    notes: seed.notes || "",
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  const createMutation = useCreateOpportunity();
  const updateMutation = useUpdateOpportunity();
  const setCredentialMutation = useSetCredential();
  const submitting = createMutation.isPending || updateMutation.isPending || setCredentialMutation.isPending;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      appliedAt: form.appliedAt ? new Date(form.appliedAt).toISOString() : null,
      followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : null,
    };
    try {
      let id = opportunity?._id;
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: payload });
      } else {
        const created = await createMutation.mutateAsync(payload);
        id = created._id;
      }
      if (passwordInput) {
        await setCredentialMutation.mutateAsync({ id, password: passwordInput });
      }
      toast.success(isEdit ? "Opportunity updated" : "Opportunity added");
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  const logoUrl = faviconUrlFor(form.website || form.applicationUrl);
  const isApplied = form.status !== "discovered" && form.status !== "saved";

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
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </Field>
            {isApplied ? (
              <Field label="Follow up on">
                <input
                  type="date"
                  value={form.followUpDate}
                  onChange={(e) => update("followUpDate", e.target.value)}
                  className={inputClass}
                />
              </Field>
            ) : (
              <Field label="Deadline">
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => update("deadline", e.target.value)}
                  className={inputClass}
                />
              </Field>
            )}
          </div>

          <Field label="Website">
            <div className="flex items-center gap-2">
              {logoUrl && (
                <img src={logoUrl} alt="" className="w-8 h-8 rounded-md border border-[var(--border)] shrink-0" />
              )}
              <input
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                className={inputClass}
                placeholder="https://…"
              />
            </div>
          </Field>
          <Field label="Application URL">
            <input
              value={form.applicationUrl}
              onChange={(e) => update("applicationUrl", e.target.value)}
              className={inputClass}
              placeholder="https://…"
            />
          </Field>

          <Field label="Login used">
            <input
              value={form.loginIdentifier}
              onChange={(e) => update("loginIdentifier", e.target.value)}
              className={inputClass}
              placeholder="email or username used to apply"
            />
          </Field>
          <CredentialField
            opportunity={opportunity}
            value={passwordInput}
            onChange={setPasswordInput}
          />

          {isApplied && (
            <Field label="Applied on">
              <input
                type="date"
                value={form.appliedAt}
                onChange={(e) => update("appliedAt", e.target.value)}
                className={inputClass}
              />
            </Field>
          )}

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

function CredentialField({ opportunity, value, onChange }) {
  const [mode, setMode] = useState(opportunity?.hasCredential ? "locked" : "input");
  const [showPassword, setShowPassword] = useState(false);
  const [revealed, setRevealed] = useState("");

  const revealMutation = useRevealCredential();
  const deleteMutation = useDeleteCredential();

  if (mode === "locked") {
    return (
      <Field label="Password">
        <div className="flex items-center gap-2 rounded-md bg-white/[0.04] border border-[var(--border)] px-3 py-2 text-sm">
          <Lock size={14} strokeWidth={1.75} className="text-[var(--text-muted)] shrink-0" />
          {revealed ? (
            <span className="flex-1 font-mono text-white truncate">{revealed}</span>
          ) : (
            <span className="flex-1 text-gray-400">Password saved</span>
          )}
          <button
            type="button"
            onClick={async () => {
              if (revealed) return setRevealed("");
              try {
                const password = await revealMutation.mutateAsync(opportunity._id);
                setRevealed(password);
              } catch (err) {
                toast.error(err.message);
              }
            }}
            className="text-xs text-gray-300 hover:text-white transition shrink-0"
          >
            {revealed ? "Hide" : "Reveal"}
          </button>
          <button
            type="button"
            onClick={() => setMode("input")}
            className="text-xs text-gray-300 hover:text-white transition shrink-0"
          >
            Change
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await deleteMutation.mutateAsync(opportunity._id);
                setMode("input");
                toast.success("Password removed");
              } catch (err) {
                toast.error(err.message);
              }
            }}
            className="text-gray-400 hover:text-red-400 transition shrink-0"
            aria-label="Remove password"
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>
      </Field>
    );
  }

  return (
    <Field label="Password">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="stored encrypted — never stored as plain text"
          className={`${inputClass} pr-9`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={15} strokeWidth={1.75} /> : <Eye size={15} strokeWidth={1.75} />}
        </button>
      </div>
    </Field>
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
