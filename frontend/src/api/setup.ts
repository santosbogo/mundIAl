import type { CatalogTeam, CatalogCountry, CatalogTimezone } from "@/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface Step1OptionsResponse {
  teams: CatalogTeam[];
}

export interface Step4OptionsResponse {
  countries: CatalogCountry[];
  timezones: CatalogTimezone[];
}

async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { signal });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export function fetchStep1Options(): Promise<Step1OptionsResponse> {
  return apiFetch("/api/v1/setup/step-1-options");
}

export function fetchStep4Options(): Promise<Step4OptionsResponse> {
  return apiFetch("/api/v1/setup/step-4-options");
}
