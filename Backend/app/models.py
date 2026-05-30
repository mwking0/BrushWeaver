# app/models.py
"""Pydantic models for request/response validation"""
from pydantic import BaseModel, Field
from typing import Optional


class ImageEditRequest(BaseModel):
    """Request model for image editing"""
    prompt: str = Field(..., description="AI editing prompt")
    format: str = Field("same", description="Output format: jpeg|png|webp|same")
    width: Optional[int] = Field(None, ge=1, le=8000)
    height: Optional[int] = Field(None, ge=1, le=8000)
    grayscale: bool = Field(False)
    rotate: int = Field(0, ge=0, le=359)
    blur: float = Field(0.0, ge=0.0, le=50.0)
    watermark: str = Field("")
    quality: int = Field(90, ge=1, le=100)
    use_ai: bool = Field(True, description="Use AI for editing")


class HealthResponse(BaseModel):
    """Health check response"""
    ok: bool
    service: str
    ai_provider: str


class GeminiTestResponse(BaseModel):
    """Gemini API test response"""
    status: str
    message: str
    model: Optional[str] = None
    response: Optional[str] = None
    available_models: Optional[list[str]] = None


class ModelInfo(BaseModel):
    """Model information"""
    name: str
    display_name: str
    description: str


class ModelsListResponse(BaseModel):
    """List of available models response"""
    status: str
    models: Optional[list[ModelInfo]] = None
    message: Optional[str] = None


class AIEditTestResponse(BaseModel):
    """AI edit test response"""
    status: str
    message: str
    analysis_preview: Optional[str] = None
    original_size: Optional[int] = None
    edited_size: Optional[int] = None
    image_generated: Optional[bool] = None
    generation_model: Optional[str] = None
    analysis_model: Optional[str] = None
