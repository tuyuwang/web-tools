from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl, field_validator


class ShortenRequest(BaseModel):
    url: str
    alias: Optional[str] = None
    expire_days: Optional[int] = None

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        # Accept without scheme, we normalize later
        if not v or len(v) < 4:
            raise ValueError("url 无效")
        return v


class ShortenResponse(BaseModel):
    code: str
    short_url: str
    original_url: str


class LinkMeta(BaseModel):
    code: str
    original_url: str
    created_at: datetime
    clicks: int
    last_accessed: Optional[datetime]
    expires_at: Optional[datetime]