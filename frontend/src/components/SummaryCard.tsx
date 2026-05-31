import type { ReactNode } from "react";

interface SummaryCardProps {
  icon: ReactNode;
  iconBg?: string;
  title: string;
  count: string | number;
  onEdit?: () => void;
  children: ReactNode;
}

export function SummaryCard({
  icon,
  iconBg = "var(--ink-900)",
  title,
  count,
  onEdit,
  children,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--ink-500)]">
              {title}
            </p>
            <p className="text-xl font-bold leading-tight text-[var(--ink-900)]">
              {count}
            </p>
          </div>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer border-b border-dotted border-[var(--ink-500)] text-xs text-[var(--ink-500)] hover:border-[var(--ink-900)] hover:text-[var(--ink-900)]"
          >
            Editar
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
