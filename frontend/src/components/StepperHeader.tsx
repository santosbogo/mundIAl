import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepperHeaderProps {
  step: number;
  total: number;
  onBack: () => void;
}

export function StepperHeader({ step, total, onBack }: StepperHeaderProps) {
  const padded = String(step).padStart(2, "0");
  const totalPadded = String(total).padStart(2, "0");

  const stepLabels: Record<number, string> = {
    1: "Equipos",
    2: "Jugadores",
    3: "Horarios",
    4: "Ubicación",
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--line)] bg-white/90 px-5 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="text-[var(--ink-700)]"
        aria-label="Volver"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <span className="font-bold tracking-tight text-[var(--ink-900)]">
        ⚽ mund<span className="text-[var(--brand-red)]">IA</span>l
      </span>

      <span className="font-mono text-xs text-[var(--ink-500)]">
        {padded} / {totalPadded} · {stepLabels[step] ?? ""}
      </span>
    </header>
  );
}
