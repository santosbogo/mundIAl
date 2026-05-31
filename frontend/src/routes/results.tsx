import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { MatchRow } from "@/components/MatchRow";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { MatchRecommendation, RecommendationResponse } from "@/types";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
});

interface Category {
  key: keyof RecommendationResponse;
  label: string;
  emoji: string;
  color: string;
  soft: string;
  sub: string;
}

const CATEGORIES: Category[] = [
  {
    key: "imperdible",
    label: "Imperdible",
    emoji: "🔥",
    color: "var(--cat-imperdible)",
    soft: "rgba(232,25,44,.08)",
    sub: "Hay que mirarlos sí o sí",
  },
  {
    key: "vale_la_pena",
    label: "Vale la pena",
    emoji: "👍",
    color: "var(--cat-vale)",
    soft: "rgba(60,172,59,.08)",
    sub: "Si tenés un rato, prendelo",
  },
  {
    key: "para_el_resumen",
    label: "Para el resumen",
    emoji: "📺",
    color: "var(--cat-resumen)",
    soft: "var(--surface-2)",
    sub: "Mejor mirá los highlights",
  },
];

function SectionHeader({
  category,
  count,
  open,
}: {
  category: Category;
  count: number;
  open: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
        style={{ backgroundColor: category.soft }}
      >
        {category.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-[var(--ink-900)]">
            {category.label}
          </h2>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: category.soft, color: category.color }}
          >
            {count}
          </span>
        </div>
        <p className="text-[11px] text-[var(--ink-500)]">{category.sub}</p>
      </div>
      <ChevronDown
        className="h-5 w-5 shrink-0 text-[var(--ink-500)] transition-transform duration-200"
        style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      />
    </div>
  );
}

function ResultsPage() {
  const navigate = useNavigate();

  const data = useMemo(() => {
    try {
      const dataStr = sessionStorage.getItem("recommendationData");
      return dataStr ? (JSON.parse(dataStr) as RecommendationResponse) : null;
    } catch {
      return null;
    }
  }, []);

  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["imperdible", "vale_la_pena"]),
  );

  useEffect(() => {
    if (!data) {
      void navigate({ to: "/" });
    }
  }, [data, navigate]);

  if (!data) return null;

  const total =
    data.imperdible.length +
    data.vale_la_pena.length +
    data.para_el_resumen.length;

  const topTeams = [
    ...new Set(
      [...data.imperdible, ...data.vale_la_pena]
        .flatMap((m: MatchRecommendation) => [m.team_a, m.team_b])
        .slice(0, 4),
    ),
  ].join(", ");

  function toggleSection(key: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[var(--surface-2)]">
      <NavBar
        rightSlot={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void navigate({ to: "/" })}
            className="gap-1.5 text-sm text-[var(--ink-700)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        }
      />

      <div className="mx-auto max-w-lg px-5 py-6 pb-24">
        {/* Summary */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-[var(--ink-900)]">
            Clasificamos {total} partidos
          </h1>
          {topTeams && (
            <p className="mt-0.5 text-sm text-[var(--ink-500)]">
              para {topTeams} y más
            </p>
          )}
        </div>

        {/* Distribution bar */}
        <div className="mb-6 flex h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
          {CATEGORIES.map((cat) => {
            const count = data[cat.key].length;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div
                key={cat.key}
                style={{
                  width: `${pct}%`,
                  backgroundColor: cat.color,
                  transition: "width .3s",
                }}
              />
            );
          })}
        </div>

        {/* Category sections */}
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const matches = data[cat.key];
            const isOpen = openSections.has(cat.key);
            return (
              <div
                key={cat.key}
                className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white"
              >
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleSection(cat.key)}
                >
                  <CollapsibleTrigger className="w-full cursor-pointer text-left">
                    <SectionHeader
                      category={cat}
                      count={matches.length}
                      open={isOpen}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t border-[var(--line)]">
                      {matches.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-[var(--ink-500)]">
                          No hay partidos en esta categoría.
                        </p>
                      ) : (
                        <div className="divide-y divide-[var(--line)]">
                          {matches.map((match: MatchRecommendation) => (
                            <MatchRow key={match.match_id} match={match} />
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--line)] bg-white px-5 py-3">
        <div className="mx-auto max-w-lg">
          <Button
            variant="outline"
            className="h-11 w-full text-[var(--ink-700)]"
            onClick={() => void navigate({ to: "/setup", search: { step: 1 } })}
          >
            Ajustar perfil y recalcular
          </Button>
        </div>
      </div>
    </div>
  );
}
