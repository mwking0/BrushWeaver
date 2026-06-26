# app/config.py
"""Application configuration and settings"""
import os
import sys
from dotenv import load_dotenv
from typing import Set

load_dotenv()


class Settings:
    """Application settings"""

    # Google Gemini Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-image")

    # Server Configuration
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    RELOAD: bool = True

    # CORS Configuration
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://your-frontend.com"
    ]

    # Image Processing Limits
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_CONTENT_TYPES: Set[str] = {
        "image/jpeg",
        "image/png",
        "image/webp"
    }
    MAX_IMAGE_DIMENSION: int = 8000

    # Default Image Processing
    DEFAULT_QUALITY: int = 90
    DEFAULT_WATERMARK_OPACITY: int = 160
    DEFAULT_WATERMARK_MARGIN: int = 12


settings = Settings()

if not settings.GEMINI_API_KEY:
    print("❌ GEMINI_API_KEY is not set. Add it to Backend/app/.env", file=sys.stderr)
    sys.exit(1)
