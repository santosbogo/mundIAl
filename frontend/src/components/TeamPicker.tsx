import {
  CONFEDERATION_LABELS,
  TEAMS_BY_CONFEDERATION,
  type TeamMeta,
  TEAM_META,
  type Confederation,
} from "@/data/teams";
import type { CatalogTeam } from "@/types";

interface TeamPickerProps {
  selected: string[];
  onChange: (teams: string[]) => void;
  teams?: CatalogTeam[];
}

const HOST_COLORS: Record<string, string> = {
  USA: "#1848e8",
  Mexico: "#3cac3b",
  Canada: "#e8192c",
};

function buildTeamsByConfederation(
  teams: CatalogTeam[] | undefined,
): Record<string, string[]> {
  if (!teams || teams.length === 0) {
    return TEAMS_BY_CONFEDERATION as Record<string, string[]>;
  }

  const grouped: Record<string, string[]> = {};
  for (const team of teams) {
    if (!grouped[team.confederation]) grouped[team.confederation] = [];
    grouped[team.confederation].push(team.name);
  }

  Object.keys(grouped).forEach((conf) =>
    grouped[conf].sort((a, b) => a.localeCompare(b)),
  );
  return grouped;
}

export function TeamPicker({ selected, onChange, teams }: TeamPickerProps) {
  function toggle(team: string) {
    onChange(
      selected.includes(team)
        ? selected.filter((t) => t !== team)
        : [...selected, team],
    );
  }

  const selectedSet = new Set(selected);

  const teamsByConfederation = buildTeamsByConfederation(teams);
  const defaultOrder: Confederation[] = [
    "CONMEBOL",
    "UEFA",
    "CAF",
    "CONCACAF",
    "AFC",
    "OFC",
  ];
  const confederations = [
    ...defaultOrder.filter((conf) => teamsByConfederation[conf]?.length),
    ...Object.keys(teamsByConfederation).filter(
      (conf) => !defaultOrder.includes(conf as Confederation),
    ),
  ];

  return (
    <div className="space-y-6">
      {confederations.map((conf) => {
        const confTeams = teamsByConfederation[conf] ?? [];
        const selectedCount = confTeams.filter((t) =>
          selectedSet.has(t),
        ).length;
        return (
          <div key={conf}>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-500)]">
                {CONFEDERATION_LABELS[conf as Confederation] ?? conf}
              </span>
              <div className="h-px flex-1 bg-[var(--line)]" />
              {selectedCount > 0 && (
                <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 font-mono text-[11px] text-[var(--ink-700)]">
                  {selectedCount}/{confTeams.length}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {confTeams.map((teamKey) => {
                const meta: TeamMeta | undefined = TEAM_META[teamKey];
                const isSelected = selectedSet.has(teamKey);
                const hostColor = HOST_COLORS[teamKey];
                return (
                  <button
                    key={teamKey}
                    type="button"
                    onClick={() => toggle(teamKey)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150 select-none"
                    style={
                      isSelected
                        ? {
                            backgroundColor: hostColor ?? "var(--brand-red)",
                            color: "#fff",
                            borderColor: "transparent",
                            boxShadow: "0 1px 4px rgba(0,0,0,.15)",
                          }
                        : {
                            backgroundColor: "var(--surface-1)",
                            color: "var(--ink-900)",
                            borderColor: "var(--line-strong)",
                          }
                    }
                  >
                    <span>{meta?.flag}</span>
                    <span>{meta?.es ?? teamKey}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
