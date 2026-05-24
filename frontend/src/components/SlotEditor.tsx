import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimeSlot } from "@/types";

const DAYS: { value: string; label: string }[] = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

interface SlotEditorProps {
  slots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
}

export function SlotEditor({ slots, onChange }: SlotEditorProps) {
  function addSlot() {
    onChange([
      ...slots,
      { day_of_week: "saturday", start_hour: 14, end_hour: 22 },
    ]);
  }

  function removeSlot(index: number) {
    onChange(slots.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, patch: Partial<TimeSlot>) {
    onChange(slots.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function clampHour(v: number): number {
    return Math.max(0, Math.min(24, v));
  }

  return (
    <div className="space-y-3">
      {slots.map((slot, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2"
        >
          <select
            value={slot.day_of_week}
            onChange={(e) => updateSlot(i, { day_of_week: e.target.value })}
            className="min-w-0 flex-1 rounded-lg border border-[var(--line-strong)] bg-white px-2 py-1.5 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
          >
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={0}
            max={23}
            value={slot.start_hour}
            onChange={(e) =>
              updateSlot(i, { start_hour: clampHour(Number(e.target.value)) })
            }
            className="w-14 rounded-lg border border-[var(--line-strong)] bg-white p-1.5 text-center font-mono text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
          />

          <span className="text-[var(--ink-500)]">→</span>

          <input
            type="number"
            min={1}
            max={24}
            value={slot.end_hour}
            onChange={(e) =>
              updateSlot(i, { end_hour: clampHour(Number(e.target.value)) })
            }
            className="w-14 rounded-lg border border-[var(--line-strong)] bg-white p-1.5 text-center font-mono text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeSlot(i)}
            className="h-8 w-8 shrink-0 text-[var(--ink-500)] hover:bg-red-50 hover:text-red-600"
            aria-label="Eliminar horario"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addSlot}
        className="w-full border-dashed text-[var(--ink-700)]"
      >
        <Plus className="mr-1 h-4 w-4" />
        Agregar horario
      </Button>
    </div>
  );
}
