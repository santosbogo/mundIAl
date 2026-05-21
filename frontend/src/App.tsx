import { useState } from 'react'
import type { RecommendationResponse, UserProfile } from './types'
import { fetchRecommendations } from './api/recommendations'
import ProfilePage from './pages/ProfilePage'
import ResultsPage from './pages/ResultsPage'

type AppState =
  | { step: 'profile' }
  | { step: 'loading' }
  | { step: 'results'; profile: UserProfile; data: RecommendationResponse }
  | { step: 'error'; message: string }

export default function App() {
  const [state, setState] = useState<AppState>({ step: 'profile' })

  const handleSubmit = async (profile: UserProfile) => {
    setState({ step: 'loading' })
    try {
      const data = await fetchRecommendations(profile)
      setState({ step: 'results', profile, data })
    } catch (err) {
      setState({ step: 'error', message: String(err) })
    }
  }

  const handleReset = () => setState({ step: 'profile' })

  if (state.step === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Generating your recommendations...</p>
      </div>
    )
  }

  if (state.step === 'error') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{state.message}</p>
        <button onClick={handleReset}>Try again</button>
      </div>
    )
  }

  if (state.step === 'results') {
    return <ResultsPage data={state.data} onReset={handleReset} />
  }

  return <ProfilePage onSubmit={handleSubmit} />
}
