import type { MatchRecommendation, RecommendationResponse } from '../types'

interface Props {
  data: RecommendationResponse
  onReset: () => void
}

const CATEGORY_CONFIG = {
  imperdible: { label: '🔥 Imperdible', color: '#dc2626' },
  vale_la_pena: { label: '👍 Vale la pena', color: '#d97706' },
  para_el_resumen: { label: '📺 Para ver el resumen', color: '#6b7280' },
} as const

function MatchCard({ rec }: { rec: MatchRecommendation }) {
  const localTime = rec.local_datetime
    ? new Date(rec.local_datetime).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date(rec.utc_datetime).toUTCString()

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <strong style={{ fontSize: '1.05rem' }}>
            {rec.team_a} vs {rec.team_b}
          </strong>
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '2px' }}>
            Group {rec.group} · {localTime} · {rec.city}
          </div>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            background: '#f3f4f6',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          {(rec.score * 100).toFixed(0)}%
        </span>
      </div>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#374151' }}>{rec.explanation}</p>
    </div>
  )
}

function Section({
  category,
  matches,
}: {
  category: keyof typeof CATEGORY_CONFIG
  matches: MatchRecommendation[]
}) {
  const { label, color } = CATEGORY_CONFIG[category]
  if (matches.length === 0) return null

  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ color, borderBottom: `2px solid ${color}`, paddingBottom: '0.3rem' }}>
        {label} ({matches.length})
      </h2>
      {matches.map(rec => (
        <MatchCard key={rec.match_id} rec={rec} />
      ))}
    </section>
  )
}

export default function ResultsPage({ data, onReset }: Props) {
  const total =
    data.imperdible.length + data.vale_la_pena.length + data.para_el_resumen.length

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>⚽ Your World Cup 2026 Guide</h1>
        <button onClick={onReset} style={{ cursor: 'pointer', padding: '0.4rem 0.8rem' }}>
          ← Edit profile
        </button>
      </div>

      <p style={{ color: '#6b7280' }}>{total} matches classified for your profile.</p>

      <Section category="imperdible" matches={data.imperdible} />
      <Section category="vale_la_pena" matches={data.vale_la_pena} />
      <Section category="para_el_resumen" matches={data.para_el_resumen} />
    </div>
  )
}
