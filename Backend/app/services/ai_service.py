# app/services/ai_service.py
"""AI service for image analysis and generation"""
import base64
import google.generativeai as genai
from PIL import Image
from io import BytesIO
from typing import Tuple, Optional
from config import settings


class AIService:
    """Service for AI-powered image operations"""
    
    def __init__(self):
        """Initialize AI models"""
        self.generation_model = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize Gemini image generation model ONLY (Approach A)"""
        if not settings.GEMINI_API_KEY:
            print("⚠️ No Gemini API key found")
            return
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Initialize image generation model ONLY (Approach A)
        for model_name in settings.IMAGE_GENERATION_MODELS:
            try:
                self.generation_model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config={"response_modalities": ["TEXT", "IMAGE"]}
                )
                print(f"🎨 Initialized {model_name} for AI image generation")
                print("✨ Using ONLY Image Generation approach (Approach A)")
                break
            except Exception as e:
                print(f"⚠️ {model_name} not available: {e}")
                continue
        
        if not self.generation_model:
            print("❌ No image generation models available - AI editing will not work")
    
    async def edit_image_with_ai(
        self,
        image_data: bytes,
        prompt: str,
        content_type: str
    ) -> Tuple[bytes, str]:
        """
        Edit image using AI Image Generation ONLY (Approach A)
        
        Args:
            image_data: Original image bytes
            prompt: Editing instructions
            content_type: Image MIME type
            
        Returns:
            Tuple of (edited_image_bytes, status_message)
        """
        try:
            pil_image = Image.open(BytesIO(image_data))
            
            # Use image generation ONLY (Approach A)
            if not self.generation_model:
                raise Exception("Image generation model not available")
            
            result = await self._try_image_generation(pil_image, prompt)
            if result:
                return result
            
            # If generation fails, return error
            raise Exception("Image generation failed - no fallback available")
            
        except Exception as e:
            print(f"❌ AI editing error: {e}")
            return image_data, f"AI image generation failed: {e}"
    
    async def _try_image_generation(
        self,
        pil_image: Image.Image,
        prompt: str
    ) -> Optional[Tuple[bytes, str]]:
        """Try to generate image using Gemini"""
        try:
            print(f"🎨 Attempting image generation: {self.generation_model._model_name}")
            print(f"🎯 Prompt: '{prompt}'")
            
            prompt_parts = [pil_image, prompt]
            response = self.generation_model.generate_content(prompt_parts)
            
            # Extract image data
            image_data = response.candidates[0].content.parts[0].inline_data
            
            if isinstance(image_data.data, str):
                generated_bytes = base64.b64decode(image_data.data)
            else:
                generated_bytes = image_data.data
            
            if len(generated_bytes) > 0:
                print(f"✅ Generated image: {len(generated_bytes)} bytes")
                return generated_bytes, f"AI-generated with {self.generation_model._model_name}"
            
        except Exception as e:
            print(f"❌ Image generation failed: {e}")
        
        return None
    

    
    def test_connection(self) -> dict:
        """Test Gemini API connection"""
        try:
            if not self.generation_model:
                available_models = []
                try:
                    for m in genai.list_models():
                        if 'generateContent' in m.supported_generation_methods:
                            available_models.append(m.name)
                except Exception:
                    pass
                
                return {
                    "status": "error",
                    "message": "Image generation model not initialized",
                    "available_models": available_models[:10]
                }
            
            return {
                "status": "success",
                "message": "Gemini Image Generation API is connected",
                "model": self.generation_model._model_name,
                "approach": "Image Generation Only (Approach A)"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Gemini API connection failed: {e}"
            }
    
    def list_models(self) -> dict:
        """List available Gemini models"""
        try:
            models = []
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    models.append({
                        "name": m.name,
                        "display_name": m.display_name,
                        "description": m.description
                    })
            
            return {"status": "success", "models": models}
        except Exception as e:
            return {"status": "error", "message": f"Failed to list models: {e}"}


# Singleton instance
ai_service = AIService()
