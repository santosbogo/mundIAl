from pydantic import BaseModel

from app.modules.catalog.catalog_schemas import CatalogCountry, CatalogTeam, CatalogTimezone


class Step1OptionsResponse(BaseModel):
    teams: list[CatalogTeam]


class Step4OptionsResponse(BaseModel):
    countries: list[CatalogCountry]
    timezones: list[CatalogTimezone]
