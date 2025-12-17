"""Background removal service using rembg"""
import io
from PIL import Image
from typing import Tuple


class BackgroundRemovalService:
    """Service for removing backgrounds from images using rembg"""
    
    def __init__(self):
        """Initialize background removal service"""
        self.model = None
        self.session = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize rembg background removal model"""
        try:
            import rembg
            print("🤖 Loading rembg u2net model (high quality)...")
            self.session = rembg.new_session('u2net')  # Use u2net for better quality
            print("✅ rembg u2net model loaded successfully")
            
        except ImportError:
            print("❌ rembg not installed. Install with: pip install rembg")
            self.session = None
        except Exception as e:
            print(f"❌ Failed to initialize rembg model: {e}")
            print("💡 Try: pip install rembg")
            self.session = None
    
    def remove_background(self, image_data: bytes) -> Tuple[bytes, str]:
        """
        Remove background from image using rembg
        
        Args:
            image_data: Input image bytes
            
        Returns:
            Tuple of (processed_image_bytes, status_message)
        """
        try:
            if not self.session:
                return image_data, "Background removal not available - rembg not loaded"
            
            # Load image
            input_image = Image.open(io.BytesIO(image_data))
            print(f"🖼️ Input image: {input_image.size[0]}x{input_image.size[1]} ({input_image.mode})")
            
            # Use rembg for background removal
            import rembg
            print("🤖 Using rembg for background removal...")
            output_image = rembg.remove(input_image, session=self.session)
            
            # Convert to bytes
            output_buffer = io.BytesIO()
            output_image.save(output_buffer, format='PNG')
            output_bytes = output_buffer.getvalue()
            
            print("✅ Background removed successfully with rembg")
            return output_bytes, "Background removed successfully using rembg"
            
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
        Remove background with rembg options
        
        Args:
            image_data: Input image bytes
            model_name: rembg model ('u2net', 'u2netp', 'silueta', 'isnet-general-use')
            alpha_matting: Enable alpha matting for better edges
            alpha_matting_foreground_threshold: Foreground threshold for alpha matting
            alpha_matting_background_threshold: Background threshold for alpha matting
            alpha_matting_erode_size: Erode size for alpha matting
            
        Returns:
            Tuple of (processed_image_bytes, status_message)
        """
        try:
            if not self.session:
                return image_data, "rembg not available"
            
            import rembg
            
            # Load image
            input_image = Image.open(io.BytesIO(image_data))
            print(f"🖼️ Input image: {input_image.size[0]}x{input_image.size[1]} ({input_image.mode})")
            print(f"🤖 Using rembg model: {model_name}")
            
            # Create session with specified model
            try:
                session = rembg.new_session(model_name)
            except Exception as e:
                print(f"⚠️ Failed to load {model_name}, using default session: {e}")
                session = self.session
                model_name = 'u2net'
            
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
            
            print(f"✅ Background removed successfully with rembg {model_name}")
            return output_bytes, f"Background removed successfully using rembg {model_name}"
            
        except Exception as e:
            print(f"❌ rembg background removal failed: {e}")
            import traceback
            traceback.print_exc()
            return image_data, f"Background removal failed: {e}"
    
    def test_connection(self) -> dict:
        """Test rembg background removal service availability"""
        if not self.session:
            return {
                "status": "error",
                "message": "rembg not available - check installation",
                "available_models": [],
                "installation_command": "pip install rembg"
            }
        
        try:
            available_models = [
                {
                    "name": "u2net",
                    "description": "General purpose model, good balance of speed and quality",
                    "recommended": True,
                    "accuracy": "High",
                    "speed": "Fast"
                },
                {
                    "name": "u2netp", 
                    "description": "Lighter version of u2net, faster but slightly lower quality",
                    "recommended": False,
                    "accuracy": "Good",
                    "speed": "Very Fast"
                },
                {
                    "name": "silueta",
                    "description": "Good for objects and people",
                    "recommended": False,
                    "accuracy": "Good",
                    "speed": "Fast"
                },
                {
                    "name": "isnet-general-use",
                    "description": "High accuracy model, slower but better quality",
                    "recommended": False,
                    "accuracy": "Very High",
                    "speed": "Medium"
                }
            ]
            
            return {
                "status": "success",
                "message": "rembg background removal service is ready",
                "available_models": available_models,
                "current_model": "u2net",
                "alpha_matting_available": True,
                "compute_requirements": "Low (CPU: 1-2GB RAM)"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"rembg service test failed: {e}"
            }


# Singleton instance
background_removal_service = BackgroundRemovalService()