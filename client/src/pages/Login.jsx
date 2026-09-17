import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import AuthLogo from "../components/AuthLogo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const isDbError = error.toLowerCase().includes("database") || error.toLowerCase().includes("supabase");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <AuthLogo />
        <p className="text-center text-gray-400 mb-8 text-sm">Sign in to your command center</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md bg-white/[0.04] border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/30 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md bg-white/[0.04] border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/30 transition"
          />
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-300 leading-relaxed space-y-2"
            >
              <div className="flex items-center gap-2 text-red-400 font-medium text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{isDbError ? "Database Unreachable" : "Authentication Error"}</span>
              </div>
              <p>{error}</p>
              {isDbError && (
                <div className="pt-2 border-t border-red-500/20 text-gray-300 text-[11px] space-y-1">
                  <p className="font-semibold text-gray-200">Steps to resolve:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-gray-300">
                    <li>Log in to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline text-red-300 hover:text-red-200 font-medium">Supabase Dashboard</a></li>
                    <li>If paused, click <strong>"Restore project"</strong></li>
                    <li>Verify <code className="bg-white/10 px-1 py-0.5 rounded text-[10px]">SUPABASE_URL</code> in <code className="bg-white/10 px-1 py-0.5 rounded text-[10px]">server/.env</code></li>
                  </ol>
                </div>
              )}
            </motion.div>
          )}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">
          No account?{" "}
          <Link to="/register" className="text-white underline underline-offset-2">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

