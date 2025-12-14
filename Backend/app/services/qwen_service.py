"""Local image-to-image generation service using Stable Diffusion"""
import torch
from PIL import Image
from io import BytesIO
from typing import Tuple, Optional
from pathlib import Path
import numpy as np

# Model directory - can be configured via environment variable
import os
MODEL_DIR = Path(os.getenv("MODEL_DIR", str(Path(__file__).parent.parent.parent / "models")))


class ImageGenerationService:
    """Service for local image-to-image generation"""
    
    def __init__(self, model_name: str = "qwen-image-edit"):
        """Initialize image editing model"""
        self.pipe = None
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.is_turbo = "turbo" in model_name.lower()
        self.is_qwen = "qwen" in model_name.lower()
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize image editing pipeline"""
        try:
            from diffusers import AutoPipelineForImage2Image, DPMSolverMultistepScheduler
            
            model_path = MODEL_DIR / self.model_name
            
            if not model_path.exists():
                print(f"❌ Model not found at {model_path}")
                print(f"📥 Please download the model to: {model_path}")
                print(f"💡 You can download from: https://huggingface.co/Qwen/Qwen-Image-Edit-2509")
                return
            
            print(f"🔄 Loading {self.model_name} from {model_path}...")
            print(f"🖥️ Using device: {self.device}")
            
            # Load pipeline - AutoPipeline works for all models including Qwen
            self.pipe = AutoPipelineForImage2Image.from_pretrained(
                str(model_path),
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                safety_checker=None,
                requires_safety_checker=False,
                use_safetensors=True,
                trust_remote_code=True  # Required for Qwen models
            )
            
            # Don't change scheduler for turbo models (they have optimized schedulers)
            if not self.is_turbo and not self.is_qwen:
                try:
                    self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(
                        self.pipe.scheduler.config
                    )
                except:
                    print("⚠️ Using default scheduler")
            
            # Move to device
            self.pipe = self.pipe.to(self.device)
            
            # Enable memory optimizations
            if self.device == "cuda":
                try:
                    self.pipe.enable_xformers_memory_efficient_attention()
                    print("✅ xformers memory optimization enabled")
                except:
                    print("⚠️ xformers not available, using default attention")
                
                self.pipe.enable_attention_slicing()
                
                # Enable VAE slicing for SDXL and Qwen models
                if "xl" in self.model_name.lower() or self.is_qwen:
                    try:
                        self.pipe.enable_vae_slicing()
                    except:
                        pass
            
            print(f"✅ Model loaded successfully on {self.device}")
            if self.is_turbo:
                print("⚡ Turbo mode enabled - ultra-fast generation!")
            elif self.is_qwen:
                print("🎯 Qwen Image Edit model - optimized for image editing!")
            
        except Exception as e:
            print(f"❌ Failed to initialize model: {e}")
            import traceback
            traceback.print_exc()
    
    async def edit_image_with_ai(
        self,
        image_data: bytes,
        prompt: str,
        content_type: str,
        style: str = "none"
    ) -> Tuple[bytes, str]:
        """
        Edit image using Qwen VL model
        
        Args:
            image_data: Original image bytes
            prompt: Editing instructions
            content_type: Image MIME type
            style: Style preset to apply
            
        Returns:
            Tuple of (edited_image_bytes, status_message)
        """
        try:
            if not self.model or not self.processor:
                raise Exception("Qwen model not initialized")
            
            # Load input image
            pil_image = Image.open(BytesIO(image_data))
            print(f"🖼️ Input image: {pil_image.size[0]}x{pil_image.size[1]} ({pil_image.mode})")
            
            # Enhance prompt
            enhanced_prompt = self._enhance_prompt(prompt, style)
            
            # Generate edited image
            result = await self._generate_image(pil_image, enhanced_prompt)
            
            if result:
                return result
            
            raise Exception("Image generation failed")
            
        except Exception as e:
            print(f"❌ Qwen editing error: {e}")
            return image_data, f"Qwen image generation failed: {e}"
    
    def _enhance_prompt(self, user_prompt: str, style: str = "none") -> str:
        """Enhance user prompt with style instructions"""
        prompt = user_prompt.strip()
        
        style_instructions = {
            "realistic": "in a photorealistic style with high detail and natural lighting",
            "cartoon": "in a vibrant cartoon style with bold outlines and bright colors",
            "artistic": "in an artistic style with creative interpretation and expressive brushwork",
            "sketch": "in a hand-drawn sketch style with pencil-like strokes",
            "watercolor": "in a watercolor painting style with soft edges and color bleeding",
            "oil-painting": "in an oil painting style with rich colors and visible brushstrokes",
            "anime": "in an anime/manga style with characteristic features and vibrant colors"
        }
        
        style_suffix = ""
        if style != "none" and style in style_instructions:
            style_suffix = f" {style_instructions[style]}"
        
        enhanced = f"Based on this image, {prompt}{style_suffix}. Maintain the composition and make changes look natural."
        
        print(f"📝 Enhanced prompt: '{enhanced}'")
        return enhanced
    
    async def _generate_image(
        self,
        pil_image: Image.Image,
        prompt: str
    ) -> Optional[Tuple[bytes, str]]:
        """Generate image using Stable Diffusion img2img"""
        try:
            if not self.pipe:
                raise Exception("Stable Diffusion pipeline not initialized")
            
            print(f"🎨 Generating with Stable Diffusion img2img...")
            
            # Resize image if too large (SD works best with 512x512 or 768x768)
            max_size = 768
            if max(pil_image.size) > max_size:
                ratio = max_size / max(pil_image.size)
                new_size = tuple(int(dim * ratio) for dim in pil_image.size)
                pil_image = pil_image.resize(new_size, Image.Resampling.LANCZOS)
                print(f"📏 Resized to {new_size} for processing")
            
            # Ensure image is RGB
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Generate with img2img
            # Different parameters for different model types
            if self.is_turbo:
                # Turbo models are optimized for 1-4 steps
                result = self.pipe(
                    prompt=prompt,
                    image=pil_image,
                    strength=0.5,  # Lower for turbo to preserve original
                    guidance_scale=0.0,  # Turbo models don't use guidance
                    num_inference_steps=2,  # 1-4 steps for turbo
                )
            elif self.is_qwen:
                # Qwen Image Edit model - optimized for editing
                result = self.pipe(
                    prompt=prompt,
                    image=pil_image,
                    strength=0.7,  # Good balance for editing
                    guidance_scale=7.5,  # Standard guidance
                    num_inference_steps=25,  # Optimized for Qwen
                )
            else:
                # Standard models
                result = self.pipe(
                    prompt=prompt,
                    image=pil_image,
                    strength=0.75,  # Balance between original and new
                    guidance_scale=7.5,  # How closely to follow the prompt
                    num_inference_steps=30,  # More steps = better quality
                )
            
            generated_image = result.images[0]
            
            # Convert to bytes
            buffer = BytesIO()
            generated_image.save(buffer, format='PNG')
            generated_bytes = buffer.getvalue()
            
            print(f"✅ Generated image: {generated_image.size[0]}x{generated_image.size[1]}")
            
            return generated_bytes, f"Generated with {self.model_name}"
            
        except Exception as e:
            print(f"❌ Generation failed: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def test_connection(self) -> dict:
        """Test Stable Diffusion model availability"""
        if not self.pipe:
            return {
                "status": "error",
                "message": "Stable Diffusion model not initialized",
                "device": self.device
            }
        
        return {
            "status": "success",
            "message": "Stable Diffusion model is ready",
            "model": self.model_name,
            "device": self.device
        }


# Singleton instance
image_gen_service = None

def get_image_gen_service(model_name: str = "qwen-image-edit") -> ImageGenerationService:
    """Get or create image generation service instance"""
    global image_gen_service
    if image_gen_service is None:
        image_gen_service = ImageGenerationService(model_name)
    return image_gen_service
