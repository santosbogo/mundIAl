import { useCallback, useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { searchPlayers } from "@/api/players";
import { PlayerInput } from "@/components/PlayerInput";
import { SlotEditor } from "@/components/SlotEditor";
import { StepperHeader } from "@/components/StepperHeader";
import { StepperProgress } from "@/components/StepperProgress";
import { TeamPicker } from "@/components/TeamPicker";
import { WeekHeatmap } from "@/components/WeekHeatmap";
import { Button } from "@/components/ui/button";
import { usePlayerSuggestions } from "@/hooks/usePlayerSuggestions";
import { useProfile } from "@/hooks/useProfile";
import { useSetupStep1 } from "@/hooks/useSetupStep1";
import { useSetupStep4 } from "@/hooks/useSetupStep4";
import type { TimeSlot } from "@/types";

const TOTAL_STEPS = 4;

export const Route = createFileRoute("/setup")({
  validateSearch: z.object({
    step: z.number().min(1).max(TOTAL_STEPS).default(1),
  }),
  component: SetupPage,
});

function SetupPage() {
  const { step } = Route.useSearch();
  const navigate = useNavigate({ from: "/setup" });
  const { profile, saveProfile } = useProfile();

  const { teams } = useSetupStep1();
  const { countries, timezones } = useSetupStep4();
  const { players: playerSuggestions } = usePlayerSuggestions();

  const [selectedTeams, setSelectedTeams] = useState<string[]>(
    profile?.favorite_teams ?? [],
  );
  const [players, setPlayers] = useState<string[]>(
    profile?.favorite_players ?? [],
  );
  const [slots, setSlots] = useState<TimeSlot[]>(
    profile?.available_slots ?? [
      { day_of_week: "saturday", start_hour: 14, end_hour: 22 },
    ],
  );
  const [timezone, setTimezone] = useState(
    profile?.timezone ?? "America/Argentina/Buenos_Aires",
  );
  const [country, setCountry] = useState(profile?.country ?? "AR");

  useEffect(() => {
    if (profile) {
      setSelectedTeams(profile.favorite_teams);
      setPlayers(profile.favorite_players);
      setSlots(profile.available_slots);
      setTimezone(profile.timezone);
      setCountry(profile.country);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlayerSearch = useCallback(
    async (q: string, signal: AbortSignal): Promise<string[]> => {
      const result = await searchPlayers(q, 8, signal);
      return result.players;
    },
    [],
  );

  function isStepValid() {
    if (step === 1) return selectedTeams.length > 0;
    if (step === 3) return slots.length > 0;
    if (step === 4) return timezone.length > 0 && country.trim().length >= 2;
    return true;
  }

  function goBack() {
    if (step === 1) {
      void navigate({ to: "/" });
    } else {
      void navigate({ to: "/setup", search: { step: step - 1 } });
    }
  }

  function goNext() {
    if (step < TOTAL_STEPS) {
      void navigate({ to: "/setup", search: { step: step + 1 } });
    } else {
      saveProfile({
        favorite_teams: selectedTeams,
        favorite_players: players,
        available_slots: slots,
        timezone,
        country: country.toUpperCase().slice(0, 2),
      });
      void navigate({ to: "/" });
    }
  }

  const stepTitles: Record<number, { title: string; subtitle: string }> = {
    1: {
      title: "Tus equipos",
      subtitle: "Elegí los equipos que más seguís. Podés seleccionar varios.",
    },
    2: {
      title: "Tus jugadores",
      subtitle: "Agregá los jugadores que no te querés perder.",
    },
    3: {
      title: "Tus horarios",
      subtitle: "Indicá cuándo podés mirar partidos durante la semana.",
    },
    4: {
      title: "Tu ubicación",
      subtitle: "Para mostrarte los horarios en tu zona horaria.",
    },
  };

  const { title, subtitle } = stepTitles[step] ?? { title: "", subtitle: "" };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StepperHeader step={step} total={TOTAL_STEPS} onBack={goBack} />
      <StepperProgress total={TOTAL_STEPS} current={step} />

      <div className="flex-1 overflow-y-auto px-5 pb-32 pt-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-6">
            <p className="mb-1 font-mono text-xs uppercase tracking-widest text-[var(--ink-500)]">
              {String(step).padStart(2, "0")} · de{" "}
              {String(TOTAL_STEPS).padStart(2, "0")}
            </p>
            <h1 className="text-2xl font-bold text-[var(--ink-900)]">
              {title}
            </h1>
            <p className="mt-1 text-sm text-[var(--ink-500)]">{subtitle}</p>
          </div>

          {step === 1 && (
            <TeamPicker
              selected={selectedTeams}
              onChange={setSelectedTeams}
              teams={teams}
            />
          )}

          {step === 2 && (
            <PlayerInput
              selected={players}
              onChange={setPlayers}
              suggestions={playerSuggestions}
              onSearch={handlePlayerSearch}
            />
          )}

          {step === 3 && (
            <div className="space-y-5">
              <WeekHeatmap slots={slots} />
              <SlotEditor slots={slots} onChange={setSlots} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--ink-700)]">
                  Zona horaria
                  <span className="ml-2 text-[11px] font-normal text-[var(--ink-500)]">
                    Para calcular los horarios locales
                  </span>
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--line-strong)] bg-white px-3 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)] focus:ring-2 focus:ring-black/5"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--ink-700)]">
                  País
                  <span className="ml-2 text-[11px] font-normal text-[var(--ink-500)]">
                    Código ISO de 2 letras (ej: AR, BR, MX)
                  </span>
                </label>
                <select
                  value={country}
                  onChange={(e) =>
                    setCountry(e.target.value.toUpperCase().slice(0, 2))
                  }
                  className="h-11 w-full rounded-xl border border-[var(--line-strong)] bg-white px-3 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)] focus:ring-2 focus:ring-black/5"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-[var(--surface-2)] p-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-500)]">
                  Sedes 2026
                </p>
                <div className="flex gap-4">
                  {[
                    { label: "Canadá", color: "var(--brand-red)" },
                    { label: "México", color: "var(--brand-green)" },
                    { label: "USA", color: "var(--brand-blue)" },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-[var(--ink-700)]">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-[var(--ink-500)]">
                  Los partidos se juegan en tres países. Los horarios se ajustan
                  automáticamente según tu zona.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 border-t border-[var(--line)] bg-white px-5 py-3"
        style={{ boxShadow: "0 -8px 24px rgba(0,0,0,.06)" }}
      >
        <div className="mx-auto flex max-w-lg gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={goBack}
              className="h-12 px-5 text-[var(--ink-700)]"
            >
              Atrás
            </Button>
          )}
          <Button
            onClick={goNext}
            disabled={!isStepValid()}
            className="h-12 flex-1 bg-[var(--brand-red)] text-white hover:bg-[#c8152a] disabled:opacity-40"
          >
            {step === TOTAL_STEPS ? "Crear mi perfil" : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
