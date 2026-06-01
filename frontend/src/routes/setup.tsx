import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Calendar, CheckCircle2, Upload } from "lucide-react";
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
import { fileToBase64, generateBusyIcs } from "@/utils/icsGenerator";
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

  // Step 3: track which input mode the user chose
  const [slotMode, setSlotMode] = useState<"manual" | "upload">(
    profile?.ics_source === "upload" ? "upload" : "manual",
  );
  // Uploaded .ics file (upload mode only)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (step === 3) {
      if (slotMode === "manual") return slots.length > 0;
      return uploadedFile !== null;
    }
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

  async function goNext() {
    if (step < TOTAL_STEPS) {
      void navigate({ to: "/setup", search: { step: step + 1 } });
      return;
    }

    // Last step — save the complete profile
    let ics_content: string;
    let ics_source: "manual" | "upload";

    if (slotMode === "upload" && uploadedFile) {
      // User uploaded their own calendar
      ics_content = await fileToBase64(uploadedFile);
      ics_source = "upload";
    } else {
      // Generate ICS from the manually selected available slots.
      // The ICS encodes the *complement* (busy hours) as weekly OPAQUE events.
      ics_content = generateBusyIcs(slots, timezone);
      ics_source = "manual";
    }

    saveProfile({
      favorite_teams: selectedTeams,
      favorite_players: players,
      available_slots: slotMode === "manual" ? slots : [],
      ics_content,
      ics_source,
      timezone,
      country: country.toUpperCase().slice(0, 2),
    });
    void navigate({ to: "/" });
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
              {/* Mode toggle */}
              <div className="flex gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-1">
                <button
                  type="button"
                  onClick={() => setSlotMode("manual")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    slotMode === "manual"
                      ? "bg-white shadow-sm text-[var(--ink-900)]"
                      : "text-[var(--ink-500)] hover:text-[var(--ink-700)]"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Seleccionar manualmente
                </button>
                <button
                  type="button"
                  onClick={() => setSlotMode("upload")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    slotMode === "upload"
                      ? "bg-white shadow-sm text-[var(--ink-900)]"
                      : "text-[var(--ink-500)] hover:text-[var(--ink-700)]"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  Subir .ics
                </button>
              </div>

              {slotMode === "manual" && (
                <>
                  <WeekHeatmap slots={slots} onChange={setSlots} />
                  <SlotEditor slots={slots} onChange={setSlots} />
                </>
              )}

              {slotMode === "upload" && (
                <IcsUploadZone
                  file={uploadedFile}
                  inputRef={fileInputRef}
                  onFileChange={setUploadedFile}
                />
              )}
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
            onClick={() => void goNext()}
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

// ---------------------------------------------------------------------------
// ICS upload sub-component
// ---------------------------------------------------------------------------

interface IcsUploadZoneProps {
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (file: File | null) => void;
}

function IcsUploadZone({ file, inputRef, onFileChange }: IcsUploadZoneProps) {
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    onFileChange(e.target.files?.[0] ?? null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".ics")) {
      onFileChange(dropped);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--line-strong)] bg-[var(--surface-2)] px-6 py-8 text-center transition-colors hover:border-[var(--ink-500)]"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {file ? (
          <>
            <CheckCircle2 className="h-10 w-10 text-[var(--brand-green)]" />
            <div>
              <p className="font-medium text-[var(--ink-900)]">{file.name}</p>
              <p className="mt-0.5 text-xs text-[var(--ink-500)]">
                {(file.size / 1024).toFixed(1)} KB · Listo para subir
              </p>
            </div>
            <button
              type="button"
              className="text-xs text-[var(--ink-500)] underline"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Cambiar archivo
            </button>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-[var(--ink-400)]" />
            <div>
              <p className="font-medium text-[var(--ink-700)]">
                Subí tu calendario .ics
              </p>
              <p className="mt-1 text-xs text-[var(--ink-500)]">
                Arrastrá el archivo aquí o hacé clic para seleccionarlo.
              </p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".ics,text/calendar"
        className="hidden"
        onChange={handleFileInput}
      />

      <p className="text-[11px] leading-relaxed text-[var(--ink-500)]">
        Exportá tu Google Calendar, Outlook o Apple Calendar como{" "}
        <span className="font-medium">.ics</span>. El backend analiza los
        eventos marcados como ocupados para calcular tu disponibilidad.
      </p>
    </div>
  );
}
