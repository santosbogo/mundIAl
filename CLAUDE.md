# mundIAl — CLAUDE.md

## Project Overview

Competition entry for **"Tu tiempo, tu Mundial"** (Universidad Austral, Facultad de Ingeniería).

**Goal:** Recommend which FIFA World Cup 2026 first-round matches a user should watch, given their profile (favorite teams, players, available time slots). Each of the 72 group-stage matches is classified into one of three categories:

- **Imperdible** — must-watch: high affinity + good slot
- **Vale la pena** — worth watching: interesting but not crucial, or awkward time
- **Para ver el resumen** — watch highlights: low affinity or impossible schedule

**Deadline:** June 4, 2026. Demo must be publicly accessible.

---

## Stack

| Layer | Tech | Deploy |
|---|---|---|
| Frontend | Vite + React + TypeScript | Vercel |
| Backend | FastAPI + Python 3.12 (uv) | Render |
| Database | PostgreSQL 16 | Render |
| Monorepo | `/mundIAl/` | — |

---

## Monorepo Layout

```
mundIAl/
├── frontend/                            # Vite + React
│   └── src/
│       ├── api/recommendations.ts       # typed fetch wrapper → POST /api/v1/recommend
│       ├── pages/ProfilePage.tsx        # user profile form
│       ├── pages/ResultsPage.tsx        # grouped recommendations
│       └── types/index.ts              # shared TS types
├── backend/
│   ├── app/
│   │   ├── main.py                      # FastAPI app factory + lifespan
│   │   ├── core/config.py              # pydantic-settings (DATABASE_URL, CORS_ORIGINS)
│   │   ├── db/
│   │   │   ├── base.py                 # DeclarativeBase + TimestampMixin
│   │   │   ├── session.py              # async engine + get_db dependency
│   │   │   └── models/                 # Team, Match ORM models
│   │   ├── seed/
│   │   │   ├── teams.json              # 48 teams: FIFA ranking, confederation, rivals, key players, star_power
│   │   │   ├── matches.json            # 72 group-stage matches: UTC datetimes, narrative_score, rivalry_index
│   │   │   └── seed.py                 # CLI: uv run python -m app.seed.seed
│   │   ├── ml/
│   │   │   ├── feature_engineering.py  # (UserProfile, MatchData) → 11-dim feature vector
│   │   │   ├── classifier.py           # sklearn RF inference; rule-based fallback if no pkl
│   │   │   └── explainer.py            # template-based explanation from top-scoring feature
│   │   └── modules/recommendations/
│   │       ├── recommendations_routes.py    # POST /api/v1/recommend
│   │       ├── recommendations_service.py   # RORO orchestrator
│   │       ├── recommendations_repository.py # DB queries (AsyncSession)
│   │       └── recommendations_schemas.py   # Pydantic DTOs: UserProfile, MatchData, MatchRecommendation
│   ├── alembic/                         # async migrations
│   ├── notebooks/
│   │   ├── 01_feature_exploration.ipynb
│   │   └── 02_model_training.ipynb      # trains → app/models/classifier.pkl
│   └── pyproject.toml                   # uv deps
├── docker-compose.yml                   # local: postgres + backend
└── .gitignore
```

---

## API Contract

```
POST /api/v1/recommend
{
  "favorite_teams": ["Argentina", "Brazil"],
  "favorite_players": ["Lionel Messi", "Vinicius Jr"],
  "available_slots": [
    { "day_of_week": "saturday", "start_hour": 14, "end_hour": 23 }
  ],
  "timezone": "America/Argentina/Buenos_Aires",
  "country": "AR"
}

→ { "imperdible": [...], "vale_la_pena": [...], "para_el_resumen": [...] }

Each MatchRecommendation includes:
  match_id, group, team_a, team_b, utc_datetime, local_datetime,
  venue, city, score, category, explanation, score_breakdown
```

---

## Recommendation Engine

### Feature Engineering (`app/ml/feature_engineering.py`)

For each of the 72 matches, a feature vector is computed given the user profile:

| # | Feature | Description | Range |
|---|---|---|---|
| 0 | `team_affinity` | User's favorite team is playing | 0/1 |
| 1 | `rival_affinity` | Rival of user's favorite team is playing | 0–0.6 |
| 2 | `star_player_playing` | User's listed player is in a squad | 0/1 |
| 3 | `availability_score` | Fraction of 2-hr match window in user's free slots | 0–1 |
| 4 | `timezone_penalty` | Inconvenience of local kickoff hour (late night = 1) | 0–1 |
| 5 | `rivalry_index` | H2H historical rivalry intensity (pre-annotated per match) | 0–1 |
| 6 | `star_power` | Combined star-player quality of both squads | 0–1 |
| 7 | `group_stakes` | Group qualification importance by round (R1=0.55, R2=0.75, R3=0.95) | 0–1 |
| 8 | `expected_competitiveness` | Closeness of FIFA rankings (equal = 1) | 0–1 |
| 9 | `narrative_score` | Pre-annotated match significance (opener, classic rematch, etc.) | 0–1 |
| 10 | `regional_affinity` | User's country shares confederation with a team | 0/1 |

### ML Classifier (`app/ml/classifier.py`)

- **Model:** Random Forest (scikit-learn), trained in `notebooks/02_model_training.ipynb`
- **Input:** 11-dim feature vector per (user, match) pair
- **Output:** `imperdible` / `vale_la_pena` / `para_el_resumen`
- **Training data:** ~20 diverse user personas × 72 matches ≈ 1,440 labeled rows, annotated by the team
- **Validation:** Stratified k-fold CV across personas; feature importance plot expected to show `team_affinity` and `rivalry_index` as top predictors
- **Fallback:** If `app/models/classifier.pkl` does not exist, a rule-based weighted-sum heuristic is used automatically (same 11 features, hardcoded weights). This keeps the API functional before the notebook is run.

### Explanation (`app/ml/explainer.py`)

Template-based: identifies the top-scoring positive feature and the main obstacle (timezone/availability) to generate a one-sentence explanation per match. Post-MVP upgrade path: Claude API for natural language explanations.

---

## Data

All data is static and committed to the repo. No external API calls at inference time.

- **`teams.json`**: 48 WC 2026 teams with FIFA April 2026 ranking, confederation, rival team names, top 5 key players, star_power (0–10), narrative_flags (defending_champion, host_nation, etc.)
- **`matches.json`**: 72 group-stage matches (Groups A–L) with real UTC datetimes, venue, city, pre-annotated `narrative_score` (0–10) and `rivalry_index` (0–10)
- Data is seeded into PostgreSQL via `uv run python -m app.seed.seed` (idempotent)

---

## Backend Conventions

Follows the project's backend skill (SOLID / RORO):

- **Routes** (`_routes.py`): HTTP contract only — delegates immediately to service
- **Service** (`_service.py`): RORO orchestration — receives typed input DTO, returns typed output DTO; no HTTP objects
- **Repository** (`_repository.py`): DB queries via `AsyncSession` — no business logic
- **ML modules** (`ml/`): Pure functions — no FastAPI or DB dependencies
- **Dependency injection** via `Annotated[AsyncSession, Depends(get_db)]`
- **Package manager:** `uv` — always use `uv run` prefix
- **Startup:** `lifespan` context manager loads `classifier.pkl` into memory once

## Quality Gates (run after every backend change)

```bash
cd backend
uv run ruff check app/
uv run ruff format --check app/
uv run mypy app/
uv run pytest tests/
```

---

## Local Development

```bash
# Start services
docker compose up

# First-time setup (separate terminal)
cd backend
uv run alembic upgrade head
uv run python -m app.seed.seed

# Frontend
cd frontend && npm run dev   # → http://localhost:5173
# Backend docs               → http://localhost:8000/docs
```

Environment variables (copy from `.env.example`):

| Var | Example |
|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://mundial:mundial@localhost:5432/mundial` |
| `CORS_ORIGINS` | `http://localhost:5173` |
| `ENV` | `development` |

---

## Evaluation Criteria (jury)

1. **Analytical creativity** — non-obvious features beyond FIFA ranking (rivalry index, narrative score, regional affinity, timezone penalty)
2. **Methodological rigor** — justified feature design, validated ML model with per-class metrics and feature importances
3. **Interactive demo** — end-to-end: profile config → classification → results with explanations
