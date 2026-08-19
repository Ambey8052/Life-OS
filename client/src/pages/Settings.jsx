import { useAuth } from "../context/AuthContext";
import { formatDate } from "../constants";
import Button from "../components/ui/Button";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Your account details.</p>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white/[0.03] p-5 space-y-4">
        <Row label="Name" value={user?.name} />
        <Row label="Email" value={user?.email} />
        <Row label="Member since" value={formatDate(user?.createdAt)} />
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white/[0.03] p-5">
        <p className="text-sm text-gray-400 mb-3">
          Profile editing, notification preferences and the encrypted credential vault are on the roadmap.
        </p>
        <Button variant="secondary" onClick={logout}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value || "—"}</span>
    </div>
  );
}
