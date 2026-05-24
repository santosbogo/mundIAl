from pydantic import BaseModel


class PlayerSuggestionsResponse(BaseModel):
    players: list[str]


class PlayerSearchResponse(BaseModel):
    players: list[str]
