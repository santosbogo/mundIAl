import type { ReactNode } from "react";

interface NavBarProps {
  rightSlot?: ReactNode;
}

export function NavBar({ rightSlot }: NavBarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--line)] bg-white px-5">
      <span className="font-bold tracking-tight text-[var(--ink-900)]">
        ⚽ mund<span className="text-[var(--brand-red)]">IA</span>l
      </span>
      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
    </header>
  );
}
