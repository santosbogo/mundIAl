import type { RecommendationResponse, UserProfile } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function fetchRecommendations(
  profile: UserProfile,
): Promise<RecommendationResponse> {
  // Send only the fields the backend expects; available_slots and ics_source
  // are frontend-only and must not be forwarded.
  const body = {
    favorite_teams: profile.favorite_teams,
    favorite_players: profile.favorite_players,
    ics_content: profile.ics_content,
    timezone: profile.timezone,
    country: profile.country,
  };

  const response = await fetch(`${API_URL}/api/v1/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<RecommendationResponse>;
}
