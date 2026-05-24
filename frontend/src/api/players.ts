const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface PlayerSuggestionsResponse {
  players: string[];
}

export interface PlayerSearchResponse {
  players: string[];
}

export async function fetchPlayerSuggestions(): Promise<PlayerSuggestionsResponse> {
  const res = await fetch(`${API_URL}/api/v1/players/suggestions`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<PlayerSuggestionsResponse>;
}

export async function searchPlayers(
  q: string,
  limit = 8,
  signal?: AbortSignal,
): Promise<PlayerSearchResponse> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`${API_URL}/api/v1/players/search?${params}`, {
    signal,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<PlayerSearchResponse>;
}
