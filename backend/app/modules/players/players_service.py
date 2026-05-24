from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.catalog import catalog_repository
from app.modules.catalog.catalog_shared import load_seed_players, players_from_teams
from app.modules.players.players_schemas import PlayerSearchResponse, PlayerSuggestionsResponse

# Curated marquee names shown immediately on step 2 — no DB needed.
_POPULAR_PLAYERS: list[str] = [
    "Lionel Messi",
    "Kylian Mbappé",
    "Erling Haaland",
    "Vinicius Jr",
    "Cristiano Ronaldo",
    "Lamine Yamal",
    "Jude Bellingham",
    "Pedri",
    "Mohamed Salah",
    "Harry Kane",
    "Kevin De Bruyne",
    "Son Heung-min",
    "Lautaro Martínez",
    "Julián Álvarez",
    "Rodri",
    "Federico Valverde",
    "Jamal Musiala",
    "Florian Wirtz",
    "Phil Foden",
    "Bukayo Saka",
    "Marcus Thuram",
    "Antoine Griezmann",
    "Dani Olmo",
    "Bruno Fernandes",
    "Raphinha",
    "Rodrygo",
    "Endrick",
    "Darwin Núñez",
    "Luis Díaz",
    "Alexis Mac Allister",
    "Rodrigo De Paul",
    "Romelu Lukaku",
]


def _search(all_players: list[str], q: str, limit: int) -> list[str]:
    q_lower = q.lower()
    prefix = sorted(p for p in all_players if p.lower().startswith(q_lower))
    contains = sorted(
        p for p in all_players if q_lower in p.lower() and not p.lower().startswith(q_lower)
    )
    return (prefix + contains)[:limit]


def get_suggestions() -> PlayerSuggestionsResponse:
    return PlayerSuggestionsResponse(players=_POPULAR_PLAYERS)


async def search_players(q: str, limit: int, db: AsyncSession) -> PlayerSearchResponse:
    db_teams = await catalog_repository.get_all_teams(db)
    all_players = players_from_teams(db_teams) if db_teams else load_seed_players()
    return PlayerSearchResponse(players=_search(all_players, q, limit))
