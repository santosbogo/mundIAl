import { useQuery } from "@tanstack/react-query";
import { fetchPlayerSuggestions } from "@/api/players";
import { PLAYER_SUGGESTIONS } from "@/data/players";

export function usePlayerSuggestions() {
  const query = useQuery({
    queryKey: ["player-suggestions"],
    queryFn: fetchPlayerSuggestions,
    staleTime: 10 * 60 * 1000,
  });

  const players = query.data?.players.length
    ? query.data.players
    : PLAYER_SUGGESTIONS;
  return { ...query, players };
}
