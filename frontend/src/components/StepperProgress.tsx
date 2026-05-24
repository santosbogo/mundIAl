interface StepperProgressProps {
  total: number;
  current: number;
}

export function StepperProgress({ total, current }: StepperProgressProps) {
  return (
    <div className="flex gap-1 px-5 py-2">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < current;
        const isActive = step === current;
        return (
          <div
            key={step}
            className="h-1 flex-1 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: isCompleted
                ? "var(--ink-900)"
                : isActive
                  ? "var(--brand-red)"
                  : "var(--surface-3)",
            }}
          />
        );
      })}
    </div>
  );
}
