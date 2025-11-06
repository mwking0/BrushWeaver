# app/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Form
from fastapi.responses import Response
from io import BytesIO
from typing import Optional
import base64
import os
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image, ImageFilter, ImageDraw, ImageFont
import requests

load_dotenv()

app = FastAPI(title="PaintWeaver AI Image Edit API")

# Initialize AI client - Using only Gemini 2.5 Flash
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Single model for everything
model = None
try:
    model = genai.GenerativeModel('gemini-2.5-flash')
    print("🚀 Using Gemini 2.5 Flash for all AI operations")
except Exception as e:
    try:
        model = genai.GenerativeModel('gemini-2.5-pro')
        print("💎 Using Gemini 2.5 Pro for all AI operations")
    except Exception as e2:
        print(f"❌ Failed to initialize Gemini models: {e}, {e2}")
        model = None

ALLOWED_CT = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB cap

def _pick_output_format(fmt_param: str, content_type: Optional[str]) -> str:
    if fmt_param and fmt_param.lower() in {"jpeg", "png", "webp"}:
        return fmt_param.lower()
    mapping = {"image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp"}
    return mapping.get(content_type or "", "png")

def _ensure_mode_for_format(img: Image.Image, out_fmt: str) -> Image.Image:
    # JPEG can't have alpha; normalize modes sensibly
    if out_fmt == "jpeg":
        if img.mode in ("RGBA", "LA", "P"):
            return img.convert("RGB")
        if img.mode not in ("RGB", "L"):
            return img.convert("RGB")
    else:
        # keep alpha for PNG/WebP if present; convert palette to RGBA
        if img.mode == "P":
            return img.convert("RGBA")
    return img

def _resize_keep_aspect(img: Image.Image, width: Optional[int], height: Optional[int]) -> Image.Image:
    if not width and not height:
        return img
    w0, h0 = img.size
    if width and height:
        # exact resize (may distort)
        return img.resize((width, height), Image.LANCZOS)
    if width:
        height = int(h0 * (width / w0))
        return img.resize((width, height), Image.LANCZOS)
    # height only
    width = int(w0 * (height / h0))
    return img.resize((width, height), Image.LANCZOS)

def _watermark(img: Image.Image, text: str, opacity: int = 160, margin: int = 12) -> Image.Image:
    if not text:
        return img
    base = img.convert("RGBA")
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    font = ImageFont.load_default()
    x0, y0, x1, y1 = draw.textbbox((0, 0), text, font=font)
    tw, th = x1 - x0, y1 - y0
    x = base.width - tw - margin
    y = base.height - th - margin
    draw.rectangle([x - 6, y - 4, x + tw + 6, y + th + 4], fill=(0, 0, 0, int(opacity * 0.6)))
    draw.text((x, y), text, font=font, fill=(255, 255, 255, opacity))
    return Image.alpha_composite(base, overlay)

def _encode_image_to_base64(image_data: bytes) -> str:
    """Convert image bytes to base64 string for OpenAI API"""
    return base64.b64encode(image_data).decode('utf-8')

async def _edit_with_ai(image_data: bytes, prompt: str, content_type: str) -> tuple[bytes, str]:
    """AI-powered image editing using only Gemini 2.5 Flash"""
    try:
        if not model:
            return image_data, "Gemini model not available"
            
        pil_image = Image.open(BytesIO(image_data))
        
        # Enhanced prompt for better analysis and editing guidance
        enhanced_prompt = f"""
        I want to edit this image with the following request: "{prompt}"
        
        Please provide detailed, actionable editing instructions including:
        
        1. CURRENT IMAGE ANALYSIS:
           - What do you see in this image?
           - Current colors, shapes, style, composition
        
        2. EDITING INSTRUCTIONS for "{prompt}":
           - Specific color changes (provide RGB values)
           - Brightness/contrast adjustments (provide percentages)
           - Style transformations needed
           - Shape or composition changes
           - Filter effects to apply
        
        3. TECHNICAL PARAMETERS:
           - Exact color values (hex codes or RGB)
           - Brightness: +/- percentage
           - Contrast: +/- percentage  
           - Saturation: +/- percentage
           - Any blur, sharpen, or other effects with intensity values
        
        4. STEP-BY-STEP PROCESS:
           - Order of operations for best results
           - Specific tools or techniques to use
        
        Be very specific with numerical values and technical details so the edits can be applied programmatically.
        """
        
        try:
            response = model.generate_content([enhanced_prompt, pil_image])
            
            # Check for safety issues
            if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
                if hasattr(response.prompt_feedback, 'block_reason'):
                    print(f"🚫 Prompt blocked: {response.prompt_feedback.block_reason}")
                    return image_data, f"Request blocked by safety filters: {response.prompt_feedback.block_reason}"
            
            # Get the analysis text
            analysis = ""
            try:
                analysis = response.text if response.text else "No analysis provided"
                print(f"🤖 Gemini 2.5 Analysis: {analysis[:150]}...")
            except Exception as text_error:
                print(f"⚠️ Could not get text response: {text_error}")
                # Check candidates for safety ratings
                if hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    if hasattr(candidate, 'safety_ratings'):
                        print(f"🛡️ Safety ratings: {candidate.safety_ratings}")
                analysis = "Response blocked by safety filters"
            
            # Apply enhanced programmatic edits based on Gemini's analysis
            edited_image_data = _apply_ai_suggested_edits(image_data, prompt, analysis)
            
            return edited_image_data, analysis
            
        except Exception as gemini_error:
            print(f"❌ Gemini processing failed: {gemini_error}")
            # Fallback to basic programmatic editing
            edited_image_data = _apply_ai_suggested_edits(image_data, prompt, "")
            return edited_image_data, f"Applied basic edits for: {prompt}"
        
    except Exception as e:
        print(f"❌ AI editing error: {str(e)}")
        return image_data, f"AI editing failed: {str(e)}"

def _apply_ai_suggested_edits(image_data: bytes, prompt: str, analysis: str) -> bytes:
    """Apply sophisticated programmatic edits based on Gemini 2.5 analysis"""
    try:
        from PIL import ImageEnhance, ImageOps, ImageDraw
        import re
        
        img = Image.open(BytesIO(image_data))
        
        # Convert to RGB if not already
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        prompt_lower = prompt.lower()
        analysis_lower = analysis.lower() if analysis else ""
        
        print(f"🎨 Applying Gemini 2.5 guided edits for: '{prompt}'")
        
        # Parse specific values from Gemini's analysis
        brightness_match = re.search(r'brightness[:\s]*([+-]?\d+)%?', analysis_lower)
        contrast_match = re.search(r'contrast[:\s]*([+-]?\d+)%?', analysis_lower)
        saturation_match = re.search(r'saturation[:\s]*([+-]?\d+)%?', analysis_lower)
        
        # Apply specific adjustments from Gemini's analysis
        if brightness_match:
            brightness_val = int(brightness_match.group(1))
            factor = 1.0 + (brightness_val / 100.0)
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(max(0.1, min(3.0, factor)))
            print(f"💡 Applied brightness: {brightness_val}%")
        
        if contrast_match:
            contrast_val = int(contrast_match.group(1))
            factor = 1.0 + (contrast_val / 100.0)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(max(0.1, min(3.0, factor)))
            print(f"🔍 Applied contrast: {contrast_val}%")
        
        if saturation_match:
            saturation_val = int(saturation_match.group(1))
            factor = 1.0 + (saturation_val / 100.0)
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(max(0.0, min(3.0, factor)))
            print(f"🌈 Applied saturation: {saturation_val}%")
        
        # Logo-specific enhancements
        if 'logo' in prompt_lower:
            # Enhance for logo use
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.3)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.2)
            print("🏷️ Applied logo enhancements (sharpness + contrast)")
        
        # Photorealistic enhancements
        if any(word in prompt_lower for word in ['photorealistic', 'realistic', 'lifelike', 'detailed']):
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.4)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.15)
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.1)
            print("📸 Applied photorealistic enhancements")
        
        # Style-based adjustments
        elif any(word in prompt_lower for word in ['watercolor', 'painting', 'artistic']):
            img = img.filter(ImageFilter.GaussianBlur(radius=1.0))
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.3)
            print("🎨 Applied artistic/watercolor style")
        
        elif any(word in prompt_lower for word in ['vintage', 'retro', 'aged']):
            # Vintage effect
            img = ImageOps.colorize(img.convert('L'), '#704214', '#C0A882')
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(0.85)
            print("📸 Applied vintage effect")
        
        elif any(word in prompt_lower for word in ['modern', 'clean', 'minimal']):
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.2)
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.2)
            print("✨ Applied modern/clean style")
        
        # Color transformations
        elif any(word in prompt_lower for word in ['colorful', 'vibrant', 'bright']):
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.5)
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(1.1)
            print("🌈 Applied vibrant color enhancement")
        
        elif any(word in prompt_lower for word in ['monochrome', 'black and white', 'grayscale']):
            img = img.convert('L').convert('RGB')
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.2)
            print("⚫ Applied monochrome effect")
        
        # Professional finishing touches
        if any(word in prompt_lower for word in ['professional', 'polished', 'refined']):
            # Subtle enhancement for professional look
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.1)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.05)
            print("💼 Applied professional finishing")
        
        # If no specific matches, apply intelligent general enhancement
        if not any([brightness_match, contrast_match, saturation_match]) and not any(word in prompt_lower for word in ['logo', 'photorealistic', 'watercolor', 'vintage', 'modern', 'colorful', 'monochrome', 'professional']):
            # Smart general enhancement based on prompt intent
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.1)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.1)
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.05)
            print("✨ Applied intelligent general enhancement")
        
        # Convert back to bytes
        buf = BytesIO()
        img.save(buf, format='PNG', quality=95, optimize=True)
        return buf.getvalue()
        
    except Exception as e:
        print(f"❌ Error applying edits: {str(e)}")
        return image_data

@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "PaintWeaver AI Backend", "ai_provider": "Google Gemini"}

@app.get("/test-gemini")
async def test_gemini():
    """Test endpoint to verify Gemini API connection"""
    try:
        if not model:
            # Try to list available models
            try:
                available_models = []
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                        available_models.append(m.name)
                
                return {
                    "status": "error",
                    "message": "Gemini model not initialized",
                    "available_models": available_models[:10]  # Show first 10
                }
            except Exception as list_error:
                return {
                    "status": "error",
                    "message": f"Gemini model not initialized and couldn't list models: {str(list_error)}"
                }
            
        response = model.generate_content("Hello! Please respond with 'Gemini API is working correctly.'")
        return {
            "status": "success",
            "message": "Gemini API is connected",
            "model": str(model._model_name) if hasattr(model, '_model_name') else "Unknown",
            "response": response.text
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Gemini API connection failed: {str(e)}"
        }

@app.get("/list-models")
async def list_available_models():
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
        
        return {
            "status": "success",
            "models": models
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to list models: {str(e)}"
        }

@app.post("/test-ai-edit")
async def test_ai_edit():
    """Test endpoint for AI editing functionality"""
    try:
        # Create a simple test image
        test_img = Image.new('RGB', (200, 200), color='red')
        buf = BytesIO()
        test_img.save(buf, format='PNG')
        test_data = buf.getvalue()
        
        # Test AI editing
        edited_data, analysis = await _edit_with_gemini(test_data, "make it blue", "image/png")
        
        return {
            "status": "success",
            "message": "AI editing test completed",
            "analysis_preview": analysis[:100] + "..." if len(analysis) > 100 else analysis,
            "original_size": len(test_data),
            "edited_size": len(edited_data)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"AI editing test failed: {str(e)}"
        }

# AI-powered image editing endpoint
@app.post("/edit")
async def edit_image(
    file: UploadFile = File(...),
    prompt: str = Form(..., description="AI editing prompt describing how to modify the image"),
    format: str = Form("same", description="jpeg|png|webp|same"),
    width: int | None = Form(None, ge=1, le=8000),
    height: int | None = Form(None, ge=1, le=8000),
    grayscale: bool = Form(False),
    rotate: int = Form(0, ge=0, le=359),
    blur: float = Form(0.0, ge=0.0, le=50.0),
    watermark: str = Form(""),
    quality: int = Form(90, ge=1, le=100),
    use_ai: bool = Form(True, description="Whether to use AI for editing based on prompt")
):
    if file.content_type not in ALLOWED_CT:
        raise HTTPException(415, f"Unsupported content type: {file.content_type or 'unknown'}")

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, f"File too large (> {MAX_BYTES} bytes)")

    # AI-powered editing with Google Gemini
    ai_analysis = ""
    if use_ai and prompt:
        try:
            print(f"🤖 Starting AI editing with prompt: '{prompt}'")
            # Send to AI for analysis/editing
            data, ai_analysis = await _edit_with_ai(data, prompt, file.content_type)
            print(f"✅ AI editing completed successfully!")
        except Exception as e:
            print(f"❌ AI editing failed: {str(e)}")
            ai_analysis = f"AI processing failed: {str(e)}"
            # Continue with traditional editing if AI fails

    try:
        img = Image.open(BytesIO(data))
        img.load()
    except Exception:
        raise HTTPException(400, "Invalid or corrupted image")

    # Apply traditional image processing operations
    if rotate:
        img = img.rotate(-rotate, expand=True)
    if grayscale:
        img = img.convert("L")

    if width or height:
        img = _resize_keep_aspect(img, width, height)

    if blur and blur > 0:
        img = img.filter(ImageFilter.GaussianBlur(radius=blur))

    if watermark:
        img = _watermark(img, watermark)

    out_fmt = _pick_output_format(format, file.content_type)
    img = _ensure_mode_for_format(img, out_fmt)

    buf = BytesIO()
    save_kwargs = {}
    if out_fmt in ("jpeg", "webp"):
        save_kwargs["quality"] = quality
    img.save(buf, format=out_fmt.upper(), **save_kwargs)

    # Add AI analysis to response headers if available
    headers = {"Content-Disposition": f'inline; filename="edited.{out_fmt}"'}
    if ai_analysis:
        # Clean and encode analysis for header (remove special characters and truncate)
        analysis_preview = ai_analysis[:150] + "..." if len(ai_analysis) > 150 else ai_analysis
        # Remove problematic Unicode characters and newlines
        clean_analysis = analysis_preview.replace('\n', ' ').replace('\r', ' ').replace('\u2013', '-').replace('\u2014', '-')
        # Encode to ASCII to avoid Unicode issues in headers
        try:
            headers["X-AI-Analysis"] = clean_analysis.encode('ascii', 'ignore').decode('ascii')
        except:
            headers["X-AI-Analysis"] = "AI analysis completed successfully"

    return Response(
        content=buf.getvalue(),
        media_type=f"image/{out_fmt}",
        headers=headers
    )

# Enable CORS for frontend communication
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://your-frontend.com"],
    allow_methods=["*"], 
    allow_headers=["*"],
    expose_headers=["X-AI-Analysis"]
)

# Alternative way to run the server directly
if __name__ == "__main__":
    import uvicorn
    print("🎨 PaintWeaver Backend Server Starting...")
    print("📡 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("🧪 Test Gemini: http://localhost:8000/test-gemini")
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1", 
        port=8000, 
        reload=True
    )