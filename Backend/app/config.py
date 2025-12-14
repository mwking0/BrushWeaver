# app/config.py
"""Application configuration and settings"""
import os
from dotenv import load_dotenv
from typing import Set

load_dotenv()


class Settings:
    """Application settings"""
    
    # Local AI Model Configuration
    LOCAL_MODEL_NAME: str = os.getenv("LOCAL_MODEL_NAME", "qwen-image-edit")  # Image editing model
    MODEL_DIR: str = os.getenv("MODEL_DIR", "Backend/models")  # Directory containing models
    
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
