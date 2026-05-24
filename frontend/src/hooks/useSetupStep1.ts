import { useQuery } from "@tanstack/react-query";
import { fetchStep1Options } from "@/api/setup";
import { TEAM_META, type Confederation } from "@/data/teams";
import type { CatalogTeam } from "@/types";

const CONFEDERATION_ORDER: Confederation[] = [
  "CONMEBOL",
  "UEFA",
  "CAF",
  "CONCACAF",
  "AFC",
  "OFC",
];

const FALLBACK_TEAMS: CatalogTeam[] = Object.entries(TEAM_META).map(
  ([name, meta]) => ({
    name,
    confederation: meta.confederation,
  }),
);

function sortTeams(teams: CatalogTeam[]): CatalogTeam[] {
  const order = new Map(CONFEDERATION_ORDER.map((c, i) => [c, i]));
  return [...teams].sort((a, b) => {
    const confDiff =
      (order.get(a.confederation as Confederation) ?? 99) -
      (order.get(b.confederation as Confederation) ?? 99);
    return confDiff !== 0 ? confDiff : a.name.localeCompare(b.name);
  });
}

export function useSetupStep1() {
  const query = useQuery({
    queryKey: ["setup-step1-options"],
    queryFn: fetchStep1Options,
    staleTime: 5 * 60 * 1000,
  });

  const teams = query.data ? sortTeams(query.data.teams) : FALLBACK_TEAMS;
  return { ...query, teams };
}
