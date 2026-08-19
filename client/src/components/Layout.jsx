import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Flame,
  Target,
  Inbox,
  CheckSquare,
  StickyNote,
  Bell,
  Calendar,
  BarChart3,
  Compass,
  Bot,
  Lock,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Today's Focus", icon: Flame, end: true }],
  },
  {
    label: "Opportunities",
    items: [
      { to: "/opportunities", label: "Opportunities", icon: Target },
      { to: "/applications", label: "Applications", icon: Inbox },
    ],
  },
  {
    label: "Planning",
    items: [
      { to: "/tasks", label: "Tasks", icon: CheckSquare },
      { to: "/notes", label: "Notes", icon: StickyNote },
      { to: "/reminders", label: "Reminders", icon: Bell },
      { to: "/calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    label: "Insights",
    items: [
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/career-intelligence", label: "Career Intelligence", icon: Compass },
      { to: "/ai-assistant", label: "AI Assistant", icon: Bot },
    ],
  },
  {
    label: "Vault",
    items: [
      { to: "/accounts", label: "Accounts Vault", icon: Lock },
      { to: "/documents", label: "Documents", icon: FileText },
    ],
  },
];

function NavItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className="relative flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-md text-sm font-medium"
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="active-nav-indicator"
              className="absolute inset-0 rounded-md bg-white/[0.05]"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              <span className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-full bg-[var(--primary)]" />
            </motion.span>
          )}
          <Icon
            size={16}
            strokeWidth={1.75}
            className={`relative z-10 shrink-0 ${isActive ? "text-[var(--primary)]" : "text-gray-500"}`}
          />
          <span className={`relative z-10 ${isActive ? "text-white" : "text-gray-400 hover:text-white"}`}>
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-transparent flex">
      <aside className="w-60 shrink-0 border-r border-[var(--border)] flex flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-[var(--border)] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[var(--primary)]/15 border border-[var(--primary)]/25 flex items-center justify-center">
            <Compass size={15} strokeWidth={2} className="text-[var(--primary)]" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-white">LifeOS</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[11px] font-medium uppercase tracking-wider text-gray-600 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.to} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] px-3 py-3 space-y-0.5">
          <NavItem item={{ to: "/settings", label: "Settings", icon: Settings }} />
          <div className="flex items-center justify-between pl-3 pr-2 py-1.5 text-sm">
            <span className="text-gray-400 truncate">{user?.name}</span>
            <button
              onClick={logout}
              aria-label="Log out"
              className="text-gray-500 hover:text-white transition-colors"
            >
              <LogOut size={14} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-8 py-8 max-w-5xl overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
