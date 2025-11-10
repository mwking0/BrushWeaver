# app/services/image_service.py
"""Image processing service"""
import re
from PIL import Image, ImageFilter, ImageEnhance, ImageOps, ImageDraw, ImageFont
from io import BytesIO
from typing import Optional, Tuple
from config import settings


class ImageService:
    """Service for image processing operations"""
    
    @staticmethod
    def pick_output_format(fmt_param: str, content_type: Optional[str]) -> str:
        """Determine output format"""
        if fmt_param and fmt_param.lower() in {"jpeg", "png", "webp"}:
            return fmt_param.lower()
        
        mapping = {
            "image/jpeg": "jpeg",
            "image/png": "png",
            "image/webp": "webp"
        }
        return mapping.get(content_type or "", "png")
    
    @staticmethod
    def ensure_mode_for_format(img: Image.Image, out_fmt: str) -> Image.Image:
        """Ensure image mode is compatible with output format"""
        if out_fmt == "jpeg":
            if img.mode in ("RGBA", "LA", "P"):
                return img.convert("RGB")
            if img.mode not in ("RGB", "L"):
                return img.convert("RGB")
        else:
            if img.mode == "P":
                return img.convert("RGBA")
        return img
    
    @staticmethod
    def resize_keep_aspect(
        img: Image.Image,
        width: Optional[int],
        height: Optional[int]
    ) -> Image.Image:
        """Resize image while maintaining aspect ratio"""
        if not width and not height:
            return img
        
        w0, h0 = img.size
        
        if width and height:
            return img.resize((width, height), Image.LANCZOS)
        
        if width:
            height = int(h0 * (width / w0))
            return img.resize((width, height), Image.LANCZOS)
        
        width = int(w0 * (height / h0))
        return img.resize((width, height), Image.LANCZOS)
    
    @staticmethod
    def add_watermark(
        img: Image.Image,
        text: str,
        opacity: int = None,
        margin: int = None
    ) -> Image.Image:
        """Add watermark to image"""
        if not text:
            return img
        
        opacity = opacity or settings.DEFAULT_WATERMARK_OPACITY
        margin = margin or settings.DEFAULT_WATERMARK_MARGIN
        
        base = img.convert("RGBA")
        overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        font = ImageFont.load_default()
        
        x0, y0, x1, y1 = draw.textbbox((0, 0), text, font=font)
        tw, th = x1 - x0, y1 - y0
        x = base.width - tw - margin
        y = base.height - th - margin
        
        draw.rectangle(
            [x - 6, y - 4, x + tw + 6, y + th + 4],
            fill=(0, 0, 0, int(opacity * 0.6))
        )
        draw.text((x, y), text, font=font, fill=(255, 255, 255, opacity))
        
        return Image.alpha_composite(base, overlay)
    
    @staticmethod
    def apply_ai_suggested_edits(
        image_data: bytes,
        prompt: str,
        analysis: str
    ) -> bytes:
        """Apply programmatic edits based on AI analysis"""
        try:
            img = Image.open(BytesIO(image_data))
            
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            prompt_lower = prompt.lower()
            analysis_lower = analysis.lower() if analysis else ""
            
            print(f"🎨 Applying AI-guided edits for: '{prompt}'")
            
            # Parse specific values from analysis
            brightness_match = re.search(r'brightness[:\s]*([+-]?\d+)%?', analysis_lower)
            contrast_match = re.search(r'contrast[:\s]*([+-]?\d+)%?', analysis_lower)
            saturation_match = re.search(r'saturation[:\s]*([+-]?\d+)%?', analysis_lower)
            
            # Apply specific adjustments
            if brightness_match:
                val = int(brightness_match.group(1))
                factor = 1.0 + (val / 100.0)
                enhancer = ImageEnhance.Brightness(img)
                img = enhancer.enhance(max(0.1, min(3.0, factor)))
                print(f"💡 Applied brightness: {val}%")
            
            if contrast_match:
                val = int(contrast_match.group(1))
                factor = 1.0 + (val / 100.0)
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(max(0.1, min(3.0, factor)))
                print(f"🔍 Applied contrast: {val}%")
            
            if saturation_match:
                val = int(saturation_match.group(1))
                factor = 1.0 + (val / 100.0)
                enhancer = ImageEnhance.Color(img)
                img = enhancer.enhance(max(0.0, min(3.0, factor)))
                print(f"🌈 Applied saturation: {val}%")
            
            # Style-based adjustments
            img = ImageService._apply_style_adjustments(img, prompt_lower)
            
            # Convert back to bytes
            buf = BytesIO()
            img.save(buf, format='PNG', quality=95, optimize=True)
            return buf.getvalue()
            
        except Exception as e:
            print(f"❌ Error applying edits: {e}")
            return image_data
    
    @staticmethod
    def _apply_style_adjustments(img: Image.Image, prompt_lower: str) -> Image.Image:
        """Apply style-specific adjustments"""
        
        # Logo enhancements
        if 'logo' in prompt_lower:
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.3)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.2)
            print("🏷️ Applied logo enhancements")
        
        # Photorealistic
        elif any(word in prompt_lower for word in ['photorealistic', 'realistic', 'detailed']):
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.4)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.15)
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.1)
            print("📸 Applied photorealistic enhancements")
        
        # Artistic/Watercolor
        elif any(word in prompt_lower for word in ['watercolor', 'painting', 'artistic']):
            img = img.filter(ImageFilter.GaussianBlur(radius=1.0))
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.3)
            print("🎨 Applied artistic style")
        
        # Vintage
        elif any(word in prompt_lower for word in ['vintage', 'retro', 'aged']):
            img = ImageOps.colorize(img.convert('L'), '#704214', '#C0A882')
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(0.85)
            print("📸 Applied vintage effect")
        
        # Modern/Clean
        elif any(word in prompt_lower for word in ['modern', 'clean', 'minimal']):
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.2)
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.2)
            print("✨ Applied modern style")
        
        # Vibrant
        elif any(word in prompt_lower for word in ['colorful', 'vibrant', 'bright']):
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.5)
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(1.1)
            print("🌈 Applied vibrant colors")
        
        # Monochrome
        elif any(word in prompt_lower for word in ['monochrome', 'black and white', 'grayscale']):
            img = img.convert('L').convert('RGB')
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.2)
            print("⚫ Applied monochrome")
        
        # Professional
        elif any(word in prompt_lower for word in ['professional', 'polished', 'refined']):
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.1)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.05)
            print("💼 Applied professional finishing")
        
        # Default enhancement
        else:
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.1)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.1)
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.05)
            print("✨ Applied general enhancement")
        
        return img


# Singleton instance
image_service = ImageService()
