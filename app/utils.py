from __future__ import annotations

import os
import random
import re
import string
from urllib.parse import urlparse

BASE62_ALPHABET = string.digits + string.ascii_letters

RESERVED_ALIASES = {
    "api",
    "docs",
    "openapi.json",
    "redoc",
    "favicon.ico",
    "static",
}


def get_base_url() -> str:
    return os.getenv("BASE_URL", "http://localhost:8000")


def normalize_url(url: str) -> str:
    url = url.strip()
    if not url:
        return url
    parsed = urlparse(url)
    if not parsed.scheme:
        # Default to https if no scheme
        return f"https://{url}"
    return url


def is_alias_valid(alias: str) -> bool:
    if not alias:
        return False
    if alias in RESERVED_ALIASES:
        return False
    # Only allow letters, digits, -, _
    return re.fullmatch(r"[A-Za-z0-9_-]{3,64}", alias) is not None


def generate_code(length: int = None) -> str:
    default_length = int(os.getenv("CODE_LENGTH", "7"))
    code_length = length or default_length
    return "".join(random.choices(BASE62_ALPHABET, k=code_length))