from pydantic import BaseModel


class CatalogTeam(BaseModel):
    name: str
    confederation: str


class CatalogCountry(BaseModel):
    code: str
    label: str


class CatalogTimezone(BaseModel):
    value: str
    label: str
