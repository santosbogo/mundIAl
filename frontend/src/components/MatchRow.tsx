import { MapPin } from "lucide-react";
import type { MatchRecommendation } from "@/types";
import { TEAM_META } from "@/data/teams";

interface MatchRowProps {
  match: MatchRecommendation;
}

const CATEGORY_COLOR: Record<string, string> = {
  imperdible: "var(--cat-imperdible)",
  vale_la_pena: "var(--cat-vale)",
  para_el_resumen: "var(--cat-resumen)",
};

function formatLocalDate(dateStr: string | null): {
  date: string;
  time: string;
} {
  if (!dateStr) return { date: "—", time: "—" };
  try {
    const d = new Date(dateStr);
    const date = d
      .toLocaleDateString("es-AR", { month: "short", day: "numeric" })
      .toUpperCase();
    const time = d.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return { date, time };
  } catch {
    return { date: "—", time: "—" };
  }
}

export function MatchRow({ match }: MatchRowProps) {
  const color = CATEGORY_COLOR[match.category] ?? "var(--ink-700)";
  const { date, time } = formatLocalDate(
    match.local_datetime ?? match.utc_datetime,
  );
  const teamAMeta = TEAM_META[match.team_a];
  const teamBMeta = TEAM_META[match.team_b];
  const pct = Math.round(match.score * 100);

  return (
    <div className="relative flex gap-3 px-4 py-3">
      {/* category bar */}
      <div
        className="absolute left-0 top-0 h-full w-0.5 rounded-r"
        style={{ backgroundColor: color }}
      />

      <div className="min-w-0 flex-1">
        {/* header */}
        <div className="mb-2 flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
              color,
            }}
          >
            Grupo {match.group}
          </span>
          <span className="text-[11px] text-[var(--ink-500)]">{date}</span>
          <span className="font-mono text-[11px] font-medium text-[var(--ink-700)]">
            {time}
          </span>
        </div>

        {/* teams */}
        <div className="mb-2 space-y-0.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-900)]">
            <span>{teamAMeta?.flag ?? "🏳️"}</span>
            <span className="truncate">{teamAMeta?.es ?? match.team_a}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-900)]">
            <span>{teamBMeta?.flag ?? "🏳️"}</span>
            <span className="truncate">{teamBMeta?.es ?? match.team_b}</span>
          </div>
        </div>

        {/* venue */}
        <div className="mb-2 flex items-center gap-1 text-[11px] text-[var(--ink-500)]">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {match.city} · {match.venue}
          </span>
        </div>

        {/* explanation */}
        <p className="text-[12px] italic text-[var(--ink-500)]">
          {match.explanation}
        </p>
      </div>

      {/* affinity score */}
      <div className="flex shrink-0 flex-col items-end justify-start pt-0.5">
        <div className="text-right">
          <span className="text-2xl font-bold leading-none" style={{ color }}>
            {pct}
          </span>
          <span className="text-xs opacity-70" style={{ color }}>
            %
          </span>
        </div>
        <span
          className="font-mono text-[9px] uppercase tracking-wider"
          style={{ color }}
        >
          afinidad
        </span>
      </div>
    </div>
  );
}
