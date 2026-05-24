import { useQuery } from "@tanstack/react-query";
import { fetchStep4Options } from "@/api/setup";
import { COUNTRY_LABELS } from "@/data/countries";
import { TIMEZONES } from "@/data/timezones";
import type { CatalogCountry, CatalogTimezone } from "@/types";

const FALLBACK_COUNTRIES: CatalogCountry[] = Object.entries(COUNTRY_LABELS)
  .map(([code, label]) => ({ code, label }))
  .sort((a, b) => a.label.localeCompare(b.label));

const FALLBACK_TIMEZONES: CatalogTimezone[] = TIMEZONES.map((tz) => ({
  value: tz.value,
  label: tz.label,
}));

export function useSetupStep4() {
  const query = useQuery({
    queryKey: ["setup-step4-options"],
    queryFn: fetchStep4Options,
    staleTime: 5 * 60 * 1000,
  });

  const countries = query.data?.countries.length
    ? query.data.countries
        .map((c) => ({
          code: c.code,
          label: COUNTRY_LABELS[c.code] ?? c.label,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : FALLBACK_COUNTRIES;

  const timezones = query.data?.timezones.length
    ? query.data.timezones
    : FALLBACK_TIMEZONES;

  return { ...query, countries, timezones };
}
