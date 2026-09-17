import { Compass } from "lucide-react";

export default function AuthLogo() {
  return (
    <div className="flex items-center justify-center gap-2.5 mb-1">
      <div className="w-8 h-8 rounded-md bg-[var(--primary)]/15 border border-[var(--primary)]/25 flex items-center justify-center">
        <Compass size={17} strokeWidth={2} className="text-[var(--primary)]" />
      </div>
      <span className="font-semibold text-xl tracking-tight text-white">LifeOS</span>
    </div>
  );
}
