import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Clock, MapPin, Star, Users } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { SummaryCard } from "@/components/SummaryCard";
import { WeekHeatmap } from "@/components/WeekHeatmap";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchRecommendations } from "@/api/recommendations";
import { COUNTRY_LABELS } from "@/data/countries";
import { TEAM_META } from "@/data/teams";
import { TIMEZONES } from "@/data/timezones";
import { useProfile } from "@/hooks/useProfile";
import { useSetupStep4 } from "@/hooks/useSetupStep4";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { countries, timezones } = useSetupStep4();

  const { mutate, isPending, isError, error, reset } = useMutation({
    mutationFn: fetchRecommendations,
    onSuccess: (data) => {
      // Store data in sessionStorage for retrieval
      sessionStorage.setItem("recommendationData", JSON.stringify(data));
      void navigate({ to: "/results" });
    },
  });

  function handleRecommend() {
    if (profile) mutate(profile);
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-5 text-center">
        <div className="text-6xl">⚽</div>
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-[var(--ink-900)]">
            Tu Mundial, a tu tiempo
          </h1>
          <p className="mx-auto max-w-sm text-[var(--ink-500)]">
            Descubrí cuáles de los 72 partidos del Mundial 2026 valen la pena
            según tus equipos favoritos y tu disponibilidad horaria.
          </p>
        </div>
        <Button
          onClick={() => void navigate({ to: "/setup", search: { step: 1 } })}
          className="h-12 gap-2 bg-[var(--brand-red)] px-8 text-white shadow-lg hover:bg-[#c8152a]"
          size="lg"
        >
          Configurar mi perfil
          <ChevronRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-[var(--ink-500)]">
          Gratis · Sin registro · 2 minutos
        </p>
      </div>
    );
  }

  const totalHours = profile.available_slots.reduce(
    (sum, s) => sum + (s.end_hour - s.start_hour),
    0,
  );
  const tzLabel =
    timezones.find((t) => t.value === profile.timezone)?.label ??
    TIMEZONES.find((t) => t.value === profile.timezone)?.label ??
    profile.timezone;
  const countryLabel =
    countries.find((c) => c.code === profile.country)?.label ??
    COUNTRY_LABELS[profile.country] ??
    profile.country;

  return (
    <div className="min-h-screen bg-[var(--surface-2)]">
      <NavBar
        rightSlot={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void navigate({ to: "/setup", search: { step: 1 } })}
            className="text-sm text-[var(--ink-700)]"
          >
            Editar perfil
          </Button>
        }
      />

      <div className="mx-auto max-w-lg px-5 py-6">
        {/* Stat strip */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            {
              label: "Equipos",
              value: profile.favorite_teams.length,
              color: "var(--brand-red)",
            },
            {
              label: "Jugadores",
              value: profile.favorite_players.length,
              color: "var(--brand-blue)",
            },
            {
              label: "Horas/sem",
              value: totalHours,
              color: "var(--brand-green)",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-[var(--line)] bg-white p-3 text-center"
            >
              <p className="text-xl font-bold" style={{ color }}>
                {value}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--ink-500)]">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Summary cards */}
        <div className="mb-5 space-y-3">
          <SummaryCard
            icon={<Users className="h-4 w-4" />}
            iconBg="var(--brand-red)"
            title="Equipos favoritos"
            count={profile.favorite_teams.length}
            onEdit={() => void navigate({ to: "/setup", search: { step: 1 } })}
          >
            <div className="flex flex-wrap gap-1.5">
              {profile.favorite_teams.map((t) => {
                const meta = TEAM_META[t];
                return (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-0.5 text-[12px]"
                  >
                    {meta?.flag} {meta?.es ?? t}
                  </span>
                );
              })}
            </div>
          </SummaryCard>

          <SummaryCard
            icon={<Star className="h-4 w-4" />}
            iconBg="var(--brand-blue)"
            title="Jugadores favoritos"
            count={profile.favorite_players.length || "—"}
            onEdit={() => void navigate({ to: "/setup", search: { step: 2 } })}
          >
            {profile.favorite_players.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.favorite_players.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-0.5 text-[12px]"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: "var(--brand-blue)" }}
                    />
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--ink-500)]">
                Sin jugadores seleccionados
              </p>
            )}
          </SummaryCard>

          <SummaryCard
            icon={<Clock className="h-4 w-4" />}
            iconBg="var(--brand-green)"
            title="Disponibilidad"
            count={`${totalHours}h`}
            onEdit={() => void navigate({ to: "/setup", search: { step: 3 } })}
          >
            <WeekHeatmap slots={profile.available_slots} />
          </SummaryCard>

          <SummaryCard
            icon={<MapPin className="h-4 w-4" />}
            iconBg="var(--fwc26-gold-500)"
            title="Ubicación"
            count={countryLabel}
            onEdit={() => void navigate({ to: "/setup", search: { step: 4 } })}
          >
            <p className="text-[13px] text-[var(--ink-500)]">{tzLabel}</p>
          </SummaryCard>
        </div>

        {/* Error state */}
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>No pudimos generar recomendaciones</AlertTitle>
            <AlertDescription className="mt-1">
              {error instanceof Error ? error.message : "Error desconocido"}
              <button type="button" onClick={reset} className="ml-2 underline">
                Reintentar
              </button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Sticky CTA footer */}
      <div className="sticky bottom-0 border-t border-[var(--line)] bg-white/95 px-5 py-3 backdrop-blur-sm">
        <div className="mx-auto max-w-lg">
          {isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : (
            <Button
              onClick={handleRecommend}
              className="h-12 w-full gap-2 bg-[var(--brand-red)] text-white shadow-md hover:bg-[#c8152a]"
              size="lg"
            >
              ⚽ Ver mis recomendaciones
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
