import type { RecommendationResponse, UserProfile } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export async function fetchRecommendations(profile: UserProfile): Promise<RecommendationResponse> {
  const response = await fetch(`${API_URL}/api/v1/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API error ${response.status}: ${text}`)
  }

  return response.json() as Promise<RecommendationResponse>
}
