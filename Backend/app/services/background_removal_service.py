"""Background removal service using rembg"""
import io
from PIL import Image
from typing import Tuple
import numpy as np


class BackgroundRemovalService:
    """Service for removing backgrounds from images"""
    
    def __init__(self):
        """Initialize background removal service"""
        self.model = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize rembg model"""
        try:
            import rembg
            # Use u2net model (good balance of speed and quality)
            self.model = rembg.new_session('u2net')
            print("✅ Background removal model (u2net) loaded successfully")
        except ImportError:
            print("❌ rembg not installed. Install with: pip install rembg[gpu]")
            self.model = None
        except Exception as e:
            print(f"❌ Failed to initialize background removal model: {e}")
            print("💡 Try: pip install rembg[gpu] or rembg[cpu]")
            self.model = None
    
    def remove_background(self, image_data: bytes) -> Tuple[bytes, str]:
        """
        Remove background from image
        
        Args:
            image_data: Input image bytes
            
        Returns:
            Tuple of (processed_image_bytes, status_message)
        """
        try:
            if not self.model:
                return image_data, "Background removal not available - rembg not installed"
            
            # Load image
            input_image = Image.open(io.BytesIO(image_data))
            print(f"🖼️ Input image: {input_image.size[0]}x{input_image.size[1]} ({input_image.mode})")
            
            # Remove background
            import rembg
            output_image = rembg.remove(input_image, session=self.model)
            
            # Convert to bytes
            output_buffer = io.BytesIO()
            output_image.save(output_buffer, format='PNG')  # PNG supports transparency
            output_bytes = output_buffer.getvalue()
            
            print(f"✅ Background removed successfully")
            print(f"📏 Output image: {output_image.size[0]}x{output_image.size[1]} ({output_image.mode})")
            
            return output_bytes, "Background removed successfully"
            
        except Exception as e:
            print(f"❌ Background removal failed: {e}")
            import traceback
            traceback.print_exc()
            return image_data, f"Background removal failed: {e}"
    
    def remove_background_with_options(
        self, 
        image_data: bytes, 
        model_name: str = 'u2net',
        alpha_matting: bool = False,
        alpha_matting_foreground_threshold: int = 270,
        alpha_matting_background_threshold: int = 10,
        alpha_matting_erode_size: int = 10
    ) -> Tuple[bytes, str]:
        """
        Remove background with advanced options
        
        Args:
            image_data: Input image bytes
            model_name: Model to use ('u2net', 'u2netp', 'silueta', 'isnet-general-use')
            alpha_matting: Enable alpha matting for better edges
            alpha_matting_foreground_threshold: Foreground threshold for alpha matting
            alpha_matting_background_threshold: Background threshold for alpha matting
            alpha_matting_erode_size: Erode size for alpha matting
            
        Returns:
            Tuple of (processed_image_bytes, status_message)
        """
        try:
            import rembg
            
            # Create session with specified model
            try:
                session = rembg.new_session(model_name)
            except Exception as e:
                print(f"⚠️ Failed to load {model_name}, falling back to u2net: {e}")
                session = rembg.new_session('u2net')
                model_name = 'u2net'
            
            # Load image
            input_image = Image.open(io.BytesIO(image_data))
            print(f"🖼️ Input image: {input_image.size[0]}x{input_image.size[1]} ({input_image.mode})")
            print(f"🤖 Using model: {model_name}")
            
            # Remove background with options
            if alpha_matting:
                print("✨ Using alpha matting for better edges")
                try:
                    output_image = rembg.remove(
                        input_image, 
                        session=session,
                        alpha_matting=True,
                        alpha_matting_foreground_threshold=alpha_matting_foreground_threshold,
                        alpha_matting_background_threshold=alpha_matting_background_threshold,
                        alpha_matting_erode_size=alpha_matting_erode_size
                    )
                except Exception as e:
                    print(f"⚠️ Alpha matting failed, using standard removal: {e}")
                    output_image = rembg.remove(input_image, session=session)
            else:
                output_image = rembg.remove(input_image, session=session)
            
            # Convert to bytes
            output_buffer = io.BytesIO()
            output_image.save(output_buffer, format='PNG')
            output_bytes = output_buffer.getvalue()
            
            print(f"✅ Background removed successfully with {model_name}")
            print(f"📏 Output image: {output_image.size[0]}x{output_image.size[1]} ({output_image.mode})")
            
            return output_bytes, f"Background removed successfully using {model_name}"
            
        except Exception as e:
            print(f"❌ Background removal failed: {e}")
            import traceback
            traceback.print_exc()
            return image_data, f"Background removal failed: {e}"
    
    def test_connection(self) -> dict:
        """Test background removal service availability"""
        if not self.model:
            return {
                "status": "error",
                "message": "Background removal not available - rembg not installed",
                "available_models": [],
                "installation_command": "pip install rembg[gpu]"
            }
        
        try:
            import rembg
            available_models = [
                {
                    "name": "u2net",
                    "description": "General use, good balance of speed and quality",
                    "recommended": True
                },
                {
                    "name": "u2netp", 
                    "description": "Lighter version of u2net, faster but lower quality",
                    "recommended": False
                },
                {
                    "name": "silueta",
                    "description": "Good for objects and people",
                    "recommended": False
                },
                {
                    "name": "isnet-general-use",
                    "description": "High accuracy model, slower but better quality",
                    "recommended": False
                }
            ]
            
            return {
                "status": "success",
                "message": "Background removal service is ready",
                "available_models": available_models,
                "current_model": "u2net",
                "alpha_matting_available": True
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Background removal test failed: {e}"
            }


# Singleton instance
background_removal_service = BackgroundRemovalService()