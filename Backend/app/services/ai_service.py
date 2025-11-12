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
        content_type: str,
        style: str = "none"
    ) -> Tuple[bytes, str]:
        """
        Edit image using AI Image Generation ONLY (Approach A)
        
        Args:
            image_data: Original image bytes
            prompt: Editing instructions
            content_type: Image MIME type
            style: Style preset to apply
            
        Returns:
            Tuple of (edited_image_bytes, status_message)
        """
        try:
            pil_image = Image.open(BytesIO(image_data))
            
            # Use image generation ONLY (Approach A)
            if not self.generation_model:
                raise Exception("Image generation model not available")
            
            result = await self._try_image_generation(pil_image, prompt, style)
            if result:
                return result
            
            # If generation fails, return error
            raise Exception("Image generation failed - no fallback available")
            
        except Exception as e:
            print(f"❌ AI editing error: {e}")
            return image_data, f"AI image generation failed: {e}"
    
    def _enhance_prompt(self, user_prompt: str, style: str = "none") -> str:
        """
        Enhance user prompt with better instructions for image generation
        
        Args:
            user_prompt: Original user prompt
            style: Style preset to apply
            
        Returns:
            Enhanced prompt with better instructions
        """
        # Clean and normalize the prompt
        prompt = user_prompt.strip()
        
        # Style-specific instructions
        style_instructions = {
            "realistic": "in a photorealistic style with high detail, natural lighting, and lifelike textures",
            "cartoon": "in a vibrant cartoon style with bold outlines, simplified shapes, and bright colors",
            "artistic": "in an artistic style with creative interpretation, expressive brushwork, and aesthetic composition",
            "sketch": "in a hand-drawn sketch style with pencil-like strokes, shading, and artistic linework",
            "watercolor": "in a watercolor painting style with soft edges, color bleeding, and artistic washes",
            "oil-painting": "in an oil painting style with rich colors, visible brushstrokes, and classical painting techniques",
            "anime": "in an anime/manga style with characteristic features, vibrant colors, and stylized proportions"
        }
        
        # Build enhanced prompt
        style_suffix = ""
        if style != "none" and style in style_instructions:
            style_suffix = f"\n\nStyle: Apply {style_instructions[style]}"
        
        enhanced = f"""Based on the provided image, {prompt}{style_suffix}

Instructions:
- Maintain the overall composition and structure of the original image
- Keep the same aspect ratio and dimensions
- Ensure high quality and detailed output
- Make the changes look natural and cohesive
- Preserve any important elements not mentioned in the request"""
        
        print(f"📝 Original prompt: '{user_prompt}'")
        if style != "none":
            print(f"🎨 Style: {style}")
        print(f"✨ Enhanced prompt: '{enhanced[:200]}...'")
        
        return enhanced
    
    async def _try_image_generation(
        self,
        pil_image: Image.Image,
        prompt: str,
        style: str = "none"
    ) -> Optional[Tuple[bytes, str]]:
        """Try to generate image using Gemini"""
        try:
            print(f"🎨 Attempting image generation: {self.generation_model._model_name}")
            
            # Enhance the prompt for better results
            enhanced_prompt = self._enhance_prompt(prompt, style)
            
            prompt_parts = [pil_image, enhanced_prompt]
            response = self.generation_model.generate_content(prompt_parts)
            
            # Debug: Print response structure
            print(f"📊 Response received: {type(response)}")
            print(f"📊 Candidates: {len(response.candidates) if hasattr(response, 'candidates') else 'N/A'}")
            
            # Check response structure
            if not response.candidates:
                print("❌ No candidates in response")
                return None
            
            candidate = response.candidates[0]
            print(f"📊 Candidate finish_reason: {candidate.finish_reason if hasattr(candidate, 'finish_reason') else 'N/A'}")
            print(f"📊 Candidate safety_ratings: {candidate.safety_ratings if hasattr(candidate, 'safety_ratings') else 'N/A'}")
            
            if not candidate.content or not candidate.content.parts:
                print("❌ No content parts in candidate")
                return None
            
            print(f"📊 Parts count: {len(candidate.content.parts)}")
            
            # Check each part and find the one with actual image data
            for i, part in enumerate(candidate.content.parts):
                print(f"📊 Part {i}: {type(part)}")
                if hasattr(part, 'inline_data'):
                    print(f"   ✓ Has inline_data")
                    # Try to get the data
                    try:
                        if isinstance(part.inline_data.data, str):
                            test_bytes = base64.b64decode(part.inline_data.data)
                        else:
                            test_bytes = part.inline_data.data
                        print(f"   📏 Data size: {len(test_bytes)} bytes")
                    except Exception as e:
                        print(f"   ❌ Error reading data: {e}")
                if hasattr(part, 'text'):
                    print(f"   ✓ Has text: {part.text[:100] if part.text else 'None'}")
            
            # Try to find a part with valid image data
            generated_bytes = None
            for part in candidate.content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    try:
                        if isinstance(part.inline_data.data, str):
                            test_bytes = base64.b64decode(part.inline_data.data)
                        else:
                            test_bytes = part.inline_data.data
                        
                        if len(test_bytes) > 0:
                            generated_bytes = test_bytes
                            print(f"✅ Found valid image data: {len(generated_bytes)} bytes")
                            break
                    except Exception as e:
                        print(f"⚠️ Error extracting from part: {e}")
                        continue
            
            if generated_bytes and len(generated_bytes) > 0:
                return generated_bytes, f"AI-generated with {self.generation_model._model_name}"
            else:
                print("❌ No valid image data found in any part")
                return None
            
        except Exception as e:
            print(f"❌ Image generation failed: {type(e).__name__}: {e}")
            import traceback
            print(f"📋 Full traceback:\n{traceback.format_exc()}")
        
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
