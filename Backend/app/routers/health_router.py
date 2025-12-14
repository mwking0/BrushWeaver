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
    ImageGenerationTestResponse,
    ImageGenerationTestResult
)
from services.qwen_service import get_image_gen_service
from config import settings

# Initialize image generation service
image_gen_service = get_image_gen_service(settings.LOCAL_MODEL_NAME)

router = APIRouter(tags=["Health & Testing"])


@router.get("/healthz", response_model=HealthResponse)
def health_check():
    """Health check endpoint"""
    return {
        "ok": True,
        "service": "BrushWeaver AI Backend",
        "ai_provider": "Local Stable Diffusion"
    }


@router.get("/test-ai", response_model=GeminiTestResponse)
async def test_ai():
    """Test AI model connection"""
    result = image_gen_service.test_connection()
    return result


@router.get("/list-models", response_model=ModelsListResponse)
async def list_available_models():
    """List available local models"""
    return {
        "status": "success",
        "models": [
            {"name": "sdxl-turbo", "display_name": "SDXL Turbo", "description": "Ultra-fast, 1-2s generation"},
            {"name": "sd-turbo", "display_name": "SD Turbo", "description": "Fast, 2-3s generation"},
            {"name": "stable-diffusion-xl", "display_name": "Stable Diffusion XL", "description": "High quality"},
            {"name": "stable-diffusion-2", "display_name": "Stable Diffusion 2.1", "description": "Balanced"},
            {"name": "realistic-vision", "display_name": "Realistic Vision", "description": "Photorealistic"},
        ]
    }


@router.post("/test-ai-edit", response_model=AIEditTestResponse)
async def test_ai_edit():
    """Test AI editing functionality"""
    try:
        # Create test image
        test_img = Image.new('RGB', (200, 200), color='red')
        buf = BytesIO()
        test_img.save(buf, format='PNG')
        test_data = buf.getvalue()
        
        # Test AI editing
        edited_data, analysis = await image_gen_service.edit_image_with_ai(
            test_data,
            "make it blue",
            "image/png"
        )
        
        image_generated = len(edited_data) != len(test_data)
        
        return {
            "status": "success",
            "message": "AI editing test completed",
            "analysis_preview": analysis[:200] + "..." if len(analysis) > 200 else analysis,
            "original_size": len(test_data),
            "edited_size": len(edited_data),
            "image_generated": image_generated,
            "provider": "Local Stable Diffusion"
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
        
        # Create test image
        test_img = Image.new('RGB', (200, 200), color='red')
        buf = BytesIO()
        test_img.save(buf, format='PNG')
        test_data = buf.getvalue()
        
        # Test background removal
        processed_data, status = background_removal_service.remove_background(test_data)
        
        return {
            "status": "success" if "successfully" in status else "warning",
            "message": status,
            "original_size": len(test_data),
            "processed_size": len(processed_data),
            "service_available": background_removal_service.model is not None
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Background removal test failed: {e}",
            "service_available": False
        }