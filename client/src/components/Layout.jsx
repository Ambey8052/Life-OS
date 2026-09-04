import { useEffect, useState } from "react";
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
  Menu,
  X,
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

function NavItem({ item, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className="relative flex items-center gap-2.5 pl-3 pr-2 py-2 sm:py-1.5 rounded-md text-sm font-medium"
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
            className={`relative z-10 shrink-0 ${isActive ? "text-[var(--primary)]" : "text-gray-400"}`}
          />
          <span className={`relative z-10 ${isActive ? "text-white" : "text-gray-300 hover:text-white"}`}>
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ user, logout, onNavigate }) {
  return (
    <>
      <div className="px-5 py-5 border-b border-[var(--border)] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-[var(--primary)]/15 border border-[var(--primary)]/25 flex items-center justify-center shrink-0">
          <Compass size={15} strokeWidth={2} className="text-[var(--primary)]" />
        </div>
        <span className="font-semibold text-[15px] tracking-tight text-white">LifeOS</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.to} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] px-3 py-3 space-y-0.5 shrink-0">
        <NavItem item={{ to: "/settings", label: "Settings", icon: Settings }} onNavigate={onNavigate} />
        <div className="flex items-center justify-between pl-3 pr-1 py-1.5 text-sm">
          <span className="text-gray-300 truncate">{user?.name}</span>
          <button
            onClick={logout}
            aria-label="Log out"
            className="p-2 -mr-1 text-gray-400 hover:text-white transition-colors rounded-md"
          >
            <LogOut size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-transparent md:flex">
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[var(--primary)]/15 border border-[var(--primary)]/25 flex items-center justify-center">
            <Compass size={15} strokeWidth={2} className="text-[var(--primary)]" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-white">LifeOS</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-gray-300 hover:text-white transition-colors rounded-md"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-[var(--border)] flex-col sticky top-0 h-screen">
        <SidebarContent user={user} logout={logout} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[var(--surface)] border-r border-[var(--border)] flex flex-col md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
            >
              <div className="flex justify-end px-3 pt-3">
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-md"
                >
                  <X size={18} strokeWidth={1.75} />
                </button>
              </div>
              <SidebarContent user={user} logout={logout} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 md:px-8 md:py-8 max-w-5xl overflow-x-hidden">
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
