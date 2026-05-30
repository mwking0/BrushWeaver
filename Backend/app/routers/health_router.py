# app/routers/health_router.py
"""Health check and testing endpoints"""
from fastapi import APIRouter
from PIL import Image
from io import BytesIO
from models import (
    HealthResponse,
    GeminiTestResponse,
    ModelsListResponse,
    AIEditTestResponse,
)
from services.gemini_service import get_gemini_service
from config import settings

# Initialize Gemini service
gemini_service = get_gemini_service()

router = APIRouter(tags=["Health & Testing"])


@router.get("/healthz", response_model=HealthResponse)
def health_check():
    """Health check endpoint"""
    return {
        "ok": True,
        "service": "BrushWeaver AI Backend",
        "ai_provider": "Google Gemini 2.5 Flash Image"
    }


@router.get("/test-ai", response_model=GeminiTestResponse)
async def test_ai():
    """Test Gemini connection"""
    return gemini_service.test_connection()


@router.get("/list-models", response_model=ModelsListResponse)
async def list_available_models():
    """List the AI model in use"""
    return {
        "status": "success",
        "models": [
            {
                "name": settings.GEMINI_MODEL,
                "display_name": "Gemini 2.5 Flash Image",
                "description": "Cloud AI via Google Gemini"
            }
        ]
    }


@router.post("/test-ai-edit", response_model=AIEditTestResponse)
async def test_ai_edit():
    """Test AI editing functionality end-to-end against Gemini"""
    try:
        test_img = Image.new('RGB', (200, 200), color='red')
        buf = BytesIO()
        test_img.save(buf, format='PNG')
        test_data = buf.getvalue()

        edited_data, analysis = await gemini_service.edit_image_with_ai(
            test_data,
            "make it blue",
            "image/png"
        )

        image_generated = edited_data != test_data

        return {
            "status": "success",
            "message": "AI editing test completed",
            "analysis_preview": analysis[:200] + "..." if len(analysis) > 200 else analysis,
            "original_size": len(test_data),
            "edited_size": len(edited_data),
            "image_generated": image_generated,
            "generation_model": settings.GEMINI_MODEL,
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"AI editing test failed: {e}"
        }


@router.get("/test-background-removal")
async def test_background_removal():
    """Test background removal service"""
    try:
        from services.background_removal_service import background_removal_service

        test_img = Image.new('RGB', (200, 200), color='red')
        buf = BytesIO()
        test_img.save(buf, format='PNG')
        test_data = buf.getvalue()

        processed_data, status = background_removal_service.remove_background(test_data)

        return {
            "status": "success" if "successfully" in status else "warning",
            "message": status,
            "original_size": len(test_data),
            "processed_size": len(processed_data),
            "service_available": background_removal_service.session is not None
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Background removal test failed: {e}",
            "service_available": False
        }
