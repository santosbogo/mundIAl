import { useState } from 'react'
import type { TimeSlot, UserProfile } from '../types'

const TEAMS = [
  'Argentina', 'Brazil', 'France', 'Spain', 'England', 'Germany', 'Portugal',
  'Netherlands', 'Belgium', 'Croatia', 'Morocco', 'Senegal', 'Japan', 'Mexico',
  'USA', 'Uruguay', 'Colombia', 'Ecuador', 'Norway', 'Sweden', 'Austria',
  'South Korea', 'Australia', 'Algeria', 'Egypt', 'Switzerland', 'Turkey',
  'South Africa', 'Ghana', 'Ivory Coast', 'Scotland', 'Czech Republic',
  'Congo DR', 'Tunisia', 'Iran', 'Iraq', 'Saudi Arabia', 'Qatar', 'Jordan',
  'Bosnia-Herzegovina', 'Cape Verde', 'Paraguay', 'Panama', 'Haiti',
  'Curaçao', 'New Zealand', 'Canada', 'Uzbekistan',
]

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const TIMEZONES = [
  'America/Argentina/Buenos_Aires',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Sao_Paulo',
  'America/Montevideo',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Mexico_City',
  'Europe/London',
  'Europe/Paris',
  'Europe/Madrid',
  'Europe/Lisbon',
  'UTC',
]

interface Props {
  onSubmit: (profile: UserProfile) => void
}

export default function ProfilePage({ onSubmit }: Props) {
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([])
  const [favoritePlayers, setFavoritePlayers] = useState('')
  const [slots, setSlots] = useState<TimeSlot[]>([
    { day_of_week: 'saturday', start_hour: 10, end_hour: 23 },
    { day_of_week: 'sunday', start_hour: 10, end_hour: 23 },
  ])
  const [timezone, setTimezone] = useState('America/Argentina/Buenos_Aires')
  const [country, setCountry] = useState('AR')

  const toggleTeam = (team: string) => {
    setFavoriteTeams(prev =>
      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team],
    )
  }

  const addSlot = () => {
    setSlots(prev => [...prev, { day_of_week: 'saturday', start_hour: 14, end_hour: 22 }])
  }

  const removeSlot = (i: number) => {
    setSlots(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateSlot = (i: number, field: keyof TimeSlot, value: string | number) => {
    setSlots(prev => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
  }

  const handleSubmit = () => {
    const profile: UserProfile = {
      favorite_teams: favoriteTeams,
      favorite_players: favoritePlayers
        .split(',')
        .map(p => p.trim())
        .filter(Boolean),
      available_slots: slots,
      timezone,
      country,
    }
    onSubmit(profile)
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem' }}>
      <h1>⚽ Tu tiempo, tu Mundial</h1>
      <p>Configure your profile to get personalized FIFA World Cup 2026 match recommendations.</p>

      <section>
        <h2>Favorite teams</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {TEAMS.map(team => (
            <button
              key={team}
              onClick={() => toggleTeam(team)}
              style={{
                padding: '0.3rem 0.7rem',
                cursor: 'pointer',
                background: favoriteTeams.includes(team) ? '#2563eb' : '#e5e7eb',
                color: favoriteTeams.includes(team) ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              {team}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>Favorite players</h2>
        <input
          type="text"
          placeholder="Lionel Messi, Kylian Mbappé, Erling Haaland..."
          value={favoritePlayers}
          onChange={e => setFavoritePlayers(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
        />
        <small>Comma-separated</small>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>Available time slots</h2>
        {slots.map((slot, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <select value={slot.day_of_week} onChange={e => updateSlot(i, 'day_of_week', e.target.value)}>
              {DAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
            <input
              type="number"
              min={0}
              max={23}
              value={slot.start_hour}
              onChange={e => updateSlot(i, 'start_hour', parseInt(e.target.value))}
              style={{ width: '60px' }}
            />
            <span>–</span>
            <input
              type="number"
              min={1}
              max={24}
              value={slot.end_hour}
              onChange={e => updateSlot(i, 'end_hour', parseInt(e.target.value))}
              style={{ width: '60px' }}
            />
            <button onClick={() => removeSlot(i)} style={{ cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        <button onClick={addSlot}>+ Add slot</button>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>Timezone</h2>
        <select value={timezone} onChange={e => setTimezone(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <label>
          Country (ISO code, e.g. AR, BR, US):{' '}
          <input
            type="text"
            maxLength={2}
            value={country}
            onChange={e => setCountry(e.target.value.toUpperCase())}
            style={{ width: '60px', padding: '0.3rem', textTransform: 'uppercase' }}
          />
        </label>
      </section>

      <button
        onClick={handleSubmit}
        style={{
          marginTop: '2rem',
          width: '100%',
          padding: '0.8rem',
          fontSize: '1.1rem',
          background: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Get my recommendations →
      </button>
    </div>
  )
}
