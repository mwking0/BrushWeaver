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
from services.ai_service import ai_service
import google.generativeai as genai

router = APIRouter(tags=["Health & Testing"])


@router.get("/healthz", response_model=HealthResponse)
def health_check():
    """Health check endpoint"""
    return {
        "ok": True,
        "service": "BrushWeaver AI Backend",
        "ai_provider": "Google Gemini"
    }


@router.get("/test-gemini", response_model=GeminiTestResponse)
async def test_gemini():
    """Test Gemini API connection"""
    result = ai_service.test_connection()
    return result


@router.get("/list-models", response_model=ModelsListResponse)
async def list_available_models():
    """List available Gemini models"""
    result = ai_service.list_models()
    return result


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
        edited_data, analysis = await ai_service.edit_image_with_ai(
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
            "generation_model": ai_service.generation_model._model_name if ai_service.generation_model else None,
            "analysis_model": ai_service.analysis_model._model_name if ai_service.analysis_model else None
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"AI editing test failed: {e}"
        }


@router.get("/test-image-generation", response_model=ImageGenerationTestResponse)
async def test_image_generation():
    """Test which models can generate images"""
    try:
        results = []
        test_models = [
            'gemini-2.5-flash-image',
            'gemini-2.5-flash-image-preview',
            'imagen-4.0-fast-generate-001',
            'imagen-4.0-generate-001',
            'gemini-2.0-flash-exp-image-generation'
        ]
        
        test_img = Image.new('RGB', (100, 100), color='blue')
        
        for model_name in test_models:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content([
                    "Transform this blue square into a red heart",
                    test_img
                ])
                
                has_image = False
                if hasattr(response, 'candidates') and response.candidates:
                    for candidate in response.candidates:
                        if hasattr(candidate, 'content') and candidate.content.parts:
                            for part in candidate.content.parts:
                                if hasattr(part, 'inline_data') and part.inline_data:
                                    has_image = True
                                    break
                
                results.append(ImageGenerationTestResult(
                    model=model_name,
                    status="available",
                    can_generate_images=has_image,
                    response_type="image" if has_image else "text"
                ))
                
            except Exception as e:
                results.append(ImageGenerationTestResult(
                    model=model_name,
                    status="error",
                    can_generate_images=False,
                    error=str(e)
                ))
        
        return {
            "status": "success",
            "results": results,
            "current_generation_model": ai_service.generation_model._model_name if ai_service.generation_model else None
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Test failed: {e}"
        }
