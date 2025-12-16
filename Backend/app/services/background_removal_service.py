"""Background removal service using lightweight BiRefNet"""
import io
import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Optional
import requests
from pathlib import Path


class BackgroundRemovalService:
    """Service for removing backgrounds from images using BiRefNet (lightweight)"""
    
    def __init__(self):
        """Initialize background removal service"""
        self.model = None
        self.session = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize lightweight background removal model"""
        try:
            # Try BiRefNet first (lightweight and accurate)
            try:
                from transformers import pipeline
                print("🤖 Loading BiRefNet background removal model...")
                self.model = pipeline(
                    "image-segmentation",
                    model="briaai/RMBG-1.4",
                    trust_remote_code=True
                )
                print("✅ BiRefNet model loaded successfully (lightweight)")
                return
            except Exception as e:
                print(f"⚠️ BiRefNet not available: {e}")
            
            # Fallback to rembg with smaller model
            try:
                import rembg
                print("🤖 Loading rembg u2netp model (lightweight)...")
                self.session = rembg.new_session('u2netp')  # Smaller, faster model
                print("✅ rembg u2netp model loaded successfully")
                return
            except Exception as e:
                print(f"⚠️ rembg not available: {e}")
            
            # Final fallback to OpenCV-based method
            print("🤖 Using OpenCV-based background removal (CPU-only)")
            self.model = "opencv"
            
        except Exception as e:
            print(f"❌ Failed to initialize any background removal model: {e}")
            print("💡 Install with: pip install transformers rembg opencv-python")
            self.model = None
    
    def remove_background(self, image_data: bytes) -> Tuple[bytes, str]:
        """
        Remove background from image using lightweight models
        
        Args:
            image_data: Input image bytes
            
        Returns:
            Tuple of (processed_image_bytes, status_message)
        """
        try:
            # Load image
            input_image = Image.open(io.BytesIO(image_data))
            print(f"🖼️ Input image: {input_image.size[0]}x{input_image.size[1]} ({input_image.mode})")
            
            # Try BiRefNet first (best quality, lightweight)
            if hasattr(self.model, '__call__'):
                try:
                    print("🤖 Using BiRefNet for background removal...")
                    result = self.model(input_image)
                    
                    # BiRefNet returns segmentation result
                    if isinstance(result, list) and len(result) > 0:
                        mask_image = result[0]['mask']
                        
                        # Convert mask to numpy array
                        mask_array = np.array(mask_image)
                        if len(mask_array.shape) == 3:
                            mask_array = mask_array[:, :, 0]  # Take first channel
                        
                        # Apply mask to original image
                        output_image = input_image.convert('RGBA')
                        output_array = np.array(output_image)
                        output_array[:, :, 3] = mask_array
                        
                        result_image = Image.fromarray(output_array, 'RGBA')
                        
                        # Convert to bytes
                        output_buffer = io.BytesIO()
                        result_image.save(output_buffer, format='PNG')
                        output_bytes = output_buffer.getvalue()
                        
                        print("✅ Background removed successfully with BiRefNet")
                        return output_bytes, "Background removed successfully using BiRefNet"
                        
                except Exception as e:
                    print(f"⚠️ BiRefNet failed: {e}")
            
            # Fallback to rembg
            if self.session:
                try:
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
                    print(f"⚠️ rembg failed: {e}")
            
            # Final fallback to OpenCV-based method
            if self.model == "opencv":
                return self._opencv_background_removal(input_image)
            
            return image_data, "No background removal method available"
            
        except Exception as e:
            print(f"❌ Background removal failed: {e}")
            import traceback
            traceback.print_exc()
            return image_data, f"Background removal failed: {e}"
    
    def _opencv_background_removal(self, input_image: Image.Image) -> Tuple[bytes, str]:
        """
        Simple OpenCV-based background removal using GrabCut algorithm
        """
        try:
            print("🤖 Using OpenCV GrabCut for background removal...")
            
            # Convert PIL to OpenCV
            image_rgb = np.array(input_image.convert('RGB'))
            image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
            
            # Initialize mask
            mask = np.zeros(image_bgr.shape[:2], np.uint8)
            
            # Define rectangle around the object (assume center 80% contains the object)
            h, w = image_bgr.shape[:2]
            rect = (int(w*0.1), int(h*0.1), int(w*0.8), int(h*0.8))
            
            # Initialize background and foreground models
            bgd_model = np.zeros((1, 65), np.float64)
            fgd_model = np.zeros((1, 65), np.float64)
            
            # Apply GrabCut algorithm
            cv2.grabCut(image_bgr, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
            
            # Create final mask
            mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
            
            # Apply mask to create transparent background
            output_image = input_image.convert('RGBA')
            output_array = np.array(output_image)
            output_array[:, :, 3] = mask2 * 255
            
            result_image = Image.fromarray(output_array, 'RGBA')
            
            # Convert to bytes
            output_buffer = io.BytesIO()
            result_image.save(output_buffer, format='PNG')
            output_bytes = output_buffer.getvalue()
            
            print("✅ Background removed successfully with OpenCV GrabCut")
            return output_bytes, "Background removed successfully using OpenCV GrabCut"
            
        except Exception as e:
            print(f"❌ OpenCV background removal failed: {e}")
            return input_image.tobytes(), f"OpenCV background removal failed: {e}"
    
    def remove_background_with_options(
        self, 
        image_data: bytes, 
        model_name: str = 'auto',
        alpha_matting: bool = False,
        edge_smoothing: bool = True,
        quality: str = 'balanced'
    ) -> Tuple[bytes, str]:
        """
        Remove background with advanced options
        
        Args:
            image_data: Input image bytes
            model_name: Model preference ('auto', 'birefnet', 'rembg', 'opencv')
            alpha_matting: Enable edge smoothing (post-processing)
            edge_smoothing: Apply edge smoothing for better results
            quality: Quality setting ('fast', 'balanced', 'high')
            
        Returns:
            Tuple of (processed_image_bytes, status_message)
        """
        try:
            # Load image
            input_image = Image.open(io.BytesIO(image_data))
            print(f"🖼️ Input image: {input_image.size[0]}x{input_image.size[1]} ({input_image.mode})")
            print(f"🤖 Using model preference: {model_name}, quality: {quality}")
            
            result_bytes = None
            method_used = ""
            
            # Try methods based on preference and availability
            if model_name in ['auto', 'birefnet'] and hasattr(self.model, '__call__'):
                try:
                    print("🤖 Trying BiRefNet...")
                    result = self.model(input_image)
                    
                    if isinstance(result, list) and len(result) > 0:
                        mask_image = result[0]['mask']
                        mask_array = np.array(mask_image)
                        if len(mask_array.shape) == 3:
                            mask_array = mask_array[:, :, 0]
                        
                        # Apply edge smoothing if requested
                        if edge_smoothing or alpha_matting:
                            mask_array = cv2.GaussianBlur(mask_array.astype(np.float32), (3, 3), 0)
                        
                        # Apply mask
                        output_image = input_image.convert('RGBA')
                        output_array = np.array(output_image)
                        output_array[:, :, 3] = (mask_array * 255).astype(np.uint8)
                        
                        result_image = Image.fromarray(output_array, 'RGBA')
                        
                        output_buffer = io.BytesIO()
                        result_image.save(output_buffer, format='PNG')
                        result_bytes = output_buffer.getvalue()
                        method_used = "BiRefNet"
                        
                except Exception as e:
                    print(f"⚠️ BiRefNet failed: {e}")
            
            # Try rembg if BiRefNet failed or not preferred
            if not result_bytes and model_name in ['auto', 'rembg'] and self.session:
                try:
                    import rembg
                    print("🤖 Trying rembg...")
                    
                    # Choose model based on quality setting
                    if quality == 'fast':
                        session = rembg.new_session('u2netp')
                    elif quality == 'high':
                        session = rembg.new_session('isnet-general-use')
                    else:
                        session = self.session  # Default u2netp
                    
                    output_image = rembg.remove(input_image, session=session)
                    
                    # Apply edge smoothing if requested
                    if edge_smoothing or alpha_matting:
                        output_array = np.array(output_image)
                        if len(output_array.shape) == 4:  # RGBA
                            alpha = output_array[:, :, 3].astype(np.float32) / 255.0
                            alpha_smooth = cv2.GaussianBlur(alpha, (3, 3), 0)
                            output_array[:, :, 3] = (alpha_smooth * 255).astype(np.uint8)
                            output_image = Image.fromarray(output_array, 'RGBA')
                    
                    output_buffer = io.BytesIO()
                    output_image.save(output_buffer, format='PNG')
                    result_bytes = output_buffer.getvalue()
                    method_used = f"rembg ({session.model_name if hasattr(session, 'model_name') else 'u2netp'})"
                    
                except Exception as e:
                    print(f"⚠️ rembg failed: {e}")
            
            # Final fallback to OpenCV
            if not result_bytes and model_name in ['auto', 'opencv']:
                try:
                    result_bytes, status = self._opencv_background_removal(input_image)
                    method_used = "OpenCV GrabCut"
                except Exception as e:
                    print(f"⚠️ OpenCV failed: {e}")
            
            if result_bytes:
                print(f"✅ Background removed successfully with {method_used}")
                return result_bytes, f"Background removed successfully using {method_used}"
            else:
                return image_data, "All background removal methods failed"
                
        except Exception as e:
            print(f"❌ Background removal failed: {e}")
            import traceback
            traceback.print_exc()
            return image_data, f"Background removal failed: {e}"
    
    def test_connection(self) -> dict:
        """Test background removal service availability"""
        available_methods = []
        
        # Check BiRefNet
        if hasattr(self.model, '__call__'):
            available_methods.append({
                "name": "birefnet",
                "description": "BiRefNet - Lightweight and accurate (CPU/GPU)",
                "recommended": True,
                "accuracy": "High",
                "speed": "Fast",
                "compute_requirements": "Low (CPU: 2GB RAM, GPU: 4GB VRAM)"
            })
        
        # Check rembg
        if self.session:
            available_methods.append({
                "name": "rembg",
                "description": "rembg u2netp - Fast and lightweight",
                "recommended": True,
                "accuracy": "Good",
                "speed": "Very Fast",
                "compute_requirements": "Very Low (CPU: 1GB RAM)"
            })
        
        # OpenCV is always available
        if self.model == "opencv":
            available_methods.append({
                "name": "opencv",
                "description": "OpenCV GrabCut - Basic CPU-only method",
                "recommended": False,
                "accuracy": "Basic",
                "speed": "Fast",
                "compute_requirements": "Minimal (CPU only)"
            })
        
        if available_methods:
            return {
                "status": "success",
                "message": "Background removal service is ready",
                "available_methods": available_methods,
                "edge_smoothing_available": True,
                "quality_settings": ["fast", "balanced", "high"],
                "installation_requirements": {
                    "birefnet": "pip install transformers torch",
                    "rembg": "pip install rembg",
                    "opencv": "pip install opencv-python (included)"
                }
            }
        else:
            return {
                "status": "error",
                "message": "No background removal methods available",
                "installation_command": "pip install transformers rembg opencv-python"
            }


# Singleton instance
background_removal_service = BackgroundRemovalService()