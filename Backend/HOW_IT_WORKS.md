# How PaintWeaver Backend Works

## 🎯 Overview

PaintWeaver's backend is a FastAPI application that uses Google's Gemini AI to intelligently edit images based on natural language prompts. It combines AI-powered analysis with traditional image processing.

## 🔄 Complete Flow: User → Frontend → Backend → Gemini → Response

```
┌─────────────┐
│   User      │ "Make this image look like a watercolor painting"
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend (React)                                       │
│  - User draws/uploads image                             │
│  - Enters AI prompt in AIPanel                          │
│  - Clicks "Weave with AI"                               │
└──────┬──────────────────────────────────────────────────┘
       │ HTTP POST /edit
       │ FormData: {file, prompt, use_ai: true}
       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend (FastAPI)                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1. Image Router (routers/image_router.py)      │   │
│  │    - Validates file type & size                 │   │
│  │    - Extracts prompt and parameters             │   │
│  └──────┬──────────────────────────────────────────┘   │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 2. AI Service (services/ai_service.py)         │   │
│  │    - Receives image bytes + prompt              │   │
│  │    - Decides: Generate or Analyze?              │   │
│  └──────┬──────────────────────────────────────────┘   │
│         │                                               │
│         ├─── Path A: Image Generation ─────────────┐   │
│         │                                           │   │
│         ▼                                           │   │
│  ┌──────────────────────────────────────────┐      │   │
│  │ Gemini Image Generation Model            │      │   │
│  │ (gemini-2.0-flash-preview-image-gen)     │      │   │
│  │                                           │      │   │
│  │ Input: [image, "watercolor painting"]    │      │   │
│  │ Output: NEW generated image bytes        │      │   │
│  └──────┬───────────────────────────────────┘      │   │
│         │                                           │   │
│         └───────────────┬───────────────────────────┘   │
│                         │                               │
│         ├─── Path B: Analysis + Programmatic ──────┐   │
│         │                                           │   │
│         ▼                                           │   │
│  ┌──────────────────────────────────────────┐      │   │
│  │ Gemini Analysis Model                    │      │   │
│  │ (gemini-2.5-flash)                       │      │   │
│  │                                           │      │   │
│  │ Input: [image, enhanced prompt]          │      │   │
│  │ Output: Text analysis with instructions  │      │   │
│  │ "Increase saturation by 30%,             │      │   │
│  │  apply soft blur, enhance colors..."     │      │   │
│  └──────┬───────────────────────────────────┘      │   │
│         │                                           │   │
│         ▼                                           │   │
│  ┌──────────────────────────────────────────┐      │   │
│  │ Image Service                            │      │   │
│  │ (services/image_service.py)              │      │   │
│  │                                           │      │   │
│  │ - Parses AI analysis                     │      │   │
│  │ - Applies programmatic edits:            │      │   │
│  │   • Brightness/Contrast/Saturation       │      │   │
│  │   • Filters (blur, sharpen)              │      │   │
│  │   • Style transformations                │      │   │
│  │   • Color adjustments                    │      │   │
│  └──────┬───────────────────────────────────┘      │   │
│         │                                           │   │
│         └───────────────┬───────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 3. Traditional Processing (optional)            │   │
│  │    - Resize, rotate, grayscale                  │   │
│  │    - Watermark, blur                            │   │
│  │    - Format conversion                          │   │
│  └──────┬──────────────────────────────────────────┘   │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 4. Response                                     │   │
│  │    - Edited image bytes                         │   │
│  │    - AI analysis in header                      │   │
│  └──────┬──────────────────────────────────────────┘   │
└─────────┼───────────────────────────────────────────────┘
          │ HTTP Response
          │ Content-Type: image/png
          │ X-AI-Analysis: "Applied watercolor effect..."
          ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend                                               │
│  - Receives edited image                                │
│  - Displays on canvas                                   │
│  - Shows AI analysis (optional)                         │
└─────────────────────────────────────────────────────────┘
```

## 🤖 Gemini API Integration Details

### Two Gemini Models Used

#### 1. **Image Generation Model** (Primary)
```python
Model: gemini-2.0-flash-preview-image-generation
Capability: Can actually GENERATE new images
Configuration: response_modalities=["TEXT", "IMAGE"]
```

**How it works:**
```python
# Send image + prompt to Gemini
response = generation_model.generate_content([
    pil_image,  # Original image
    "Make this look like a watercolor painting"
])

# Extract generated image
image_data = response.candidates[0].content.parts[0].inline_data
generated_bytes = base64.b64decode(image_data.data)

# Return completely new AI-generated image
return generated_bytes
```

**What Gemini does:**
- Analyzes the input image
- Understands the prompt
- Generates a BRAND NEW image from scratch
- Returns image bytes (base64 encoded)

#### 2. **Analysis Model** (Fallback)
```python
Model: gemini-2.5-flash
Capability: Analyzes images, provides text guidance
Configuration: Standard text generation
```

**How it works:**
```python
# Send enhanced prompt to Gemini
enhanced_prompt = """
Analyze this image and provide editing instructions for: "watercolor painting"

Include:
1. Current image analysis
2. Specific editing steps with numerical values
3. Color adjustments (RGB/hex values)
4. Brightness/contrast/saturation percentages
"""

response = analysis_model.generate_content([enhanced_prompt, pil_image])
analysis_text = response.text

# Example response:
# "To achieve a watercolor effect:
#  - Increase saturation by 30%
#  - Apply Gaussian blur radius 1.5
#  - Enhance color vibrancy by 40%
#  - Reduce contrast by 15%"
```

**What happens next:**
The backend parses this text and applies the edits programmatically using PIL (Python Imaging Library).

## 📊 Decision Flow: Which Path?

```python
async def edit_image_with_ai(image_data, prompt, content_type):
    # Try Path A: Image Generation
    if generation_model:
        try:
            generated_image = await _try_image_generation(image, prompt)
            if generated_image:
                return generated_image  # ✅ Success! Return AI-generated image
        except:
            pass  # Generation failed, continue to Path B
    
    # Path B: Analysis + Programmatic Editing
    analysis = await _analyze_image(image, prompt)
    edited_image = apply_programmatic_edits(image, prompt, analysis)
    return edited_image
```

## 🔧 Programmatic Editing (When Generation Fails)

The Image Service applies edits based on AI analysis:

### 1. **Parse AI Analysis**
```python
# Extract numerical values from AI text
brightness_match = re.search(r'brightness[:\s]*([+-]?\d+)%?', analysis)
if brightness_match:
    brightness_val = int(brightness_match.group(1))  # e.g., +30
    factor = 1.0 + (brightness_val / 100.0)  # 1.3
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(factor)
```

### 2. **Apply Style-Based Transformations**
```python
# Watercolor style
if 'watercolor' in prompt:
    img = img.filter(ImageFilter.GaussianBlur(radius=1.0))
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(1.3)  # Boost colors

# Vintage style
if 'vintage' in prompt:
    img = ImageOps.colorize(img.convert('L'), '#704214', '#C0A882')
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(0.85)  # Reduce contrast

# Photorealistic
if 'photorealistic' in prompt:
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(1.4)
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.15)
```

## 🔐 API Key Configuration

```python
# config.py
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# ai_service.py
genai.configure(api_key=settings.GEMINI_API_KEY)
```

**Get your API key:**
1. Visit: https://aistudio.google.com/app/apikey
2. Create/copy API key
3. Add to `Backend/app/.env`:
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```

## 📡 API Request Example

### Frontend Request
```javascript
const formData = new FormData();
formData.append('file', imageBlob);
formData.append('prompt', 'Make this look like a watercolor painting');
formData.append('use_ai', 'true');

const response = await fetch('http://localhost:8000/edit', {
  method: 'POST',
  body: formData
});

const editedImageBlob = await response.blob();
const analysis = response.headers.get('X-AI-Analysis');
```

### Backend Processing
```python
@router.post("/edit")
async def edit_image(
    file: UploadFile,
    prompt: str,
    use_ai: bool = True
):
    # 1. Read image
    data = await file.read()
    
    # 2. AI editing
    if use_ai and prompt:
        data, analysis = await ai_service.edit_image_with_ai(
            data, prompt, file.content_type
        )
    
    # 3. Traditional processing
    img = Image.open(BytesIO(data))
    # ... apply resize, rotate, etc.
    
    # 4. Return response
    return Response(
        content=edited_image_bytes,
        media_type="image/png",
        headers={"X-AI-Analysis": analysis}
    )
```

## 🎨 Real-World Example

**User prompt:** "Make this logo more professional and polished"

### Step 1: Frontend sends request
```
POST /edit
FormData:
  - file: logo.png (50KB)
  - prompt: "Make this logo more professional and polished"
  - use_ai: true
```

### Step 2: Backend tries image generation
```python
# Gemini receives:
- Image: [logo.png bytes]
- Prompt: "Make this logo more professional and polished"

# Gemini generates:
- New image with professional styling
- Returns: 75KB of image data
```

### Step 3: If generation fails, analyze
```python
# Gemini analyzes and responds:
"To make this logo professional:
- Increase sharpness by 30%
- Enhance contrast by 20%
- Apply subtle brightness boost of 10%
- Ensure clean edges with slight sharpening"
```

### Step 4: Apply programmatic edits
```python
# Backend applies:
enhancer = ImageEnhance.Sharpness(img)
img = enhancer.enhance(1.3)  # +30%

enhancer = ImageEnhance.Contrast(img)
img = enhancer.enhance(1.2)  # +20%

enhancer = ImageEnhance.Brightness(img)
img = enhancer.enhance(1.1)  # +10%
```

### Step 5: Return to frontend
```
Response:
  - Content-Type: image/png
  - Body: [edited image bytes]
  - X-AI-Analysis: "Applied professional enhancements: sharpness +30%, contrast +20%"
```

## 🚀 Performance & Optimization

### Singleton Pattern
```python
# Services initialized once, reused for all requests
ai_service = AIService()  # Created once
image_service = ImageService()  # Created once
```

### Async Operations
```python
# Non-blocking I/O
async def edit_image_with_ai(...):
    # Doesn't block other requests while waiting for Gemini
    response = await generation_model.generate_content(...)
```

### Caching (Future Enhancement)
```python
# Could cache AI responses for identical prompts
cache_key = f"{image_hash}:{prompt}"
if cache_key in cache:
    return cached_result
```

## 🛡️ Error Handling

### Graceful Degradation
```python
try:
    # Try AI generation
    return ai_generated_image
except:
    try:
        # Fallback to AI analysis + programmatic
        return programmatic_edit
    except:
        # Last resort: return original with basic edits
        return original_image
```

### Safety Filters
```python
# Gemini may block inappropriate content
if response.prompt_feedback.block_reason:
    return "Request blocked by safety filters"
```

## 📈 Monitoring & Debugging

### Logging
```python
print(f"🤖 Starting AI editing: '{prompt}'")
print(f"🎨 Attempting image generation: {model_name}")
print(f"✅ Generated image: {len(bytes)} bytes")
print(f"❌ Generation failed: {error}")
```

### Health Checks
```
GET /healthz          - Server status
GET /test-gemini      - Test Gemini connection
GET /list-models      - Available models
POST /test-ai-edit    - Test AI editing
```

## 🎯 Summary

**The backend is a smart orchestrator that:**

1. **Receives** image + prompt from frontend
2. **Tries** to generate a new image with Gemini (best quality)
3. **Falls back** to AI analysis + programmatic editing (good quality)
4. **Applies** traditional image processing (resize, rotate, etc.)
5. **Returns** edited image with AI analysis

**Gemini's role:**
- **Primary**: Generate completely new images based on prompts
- **Fallback**: Provide intelligent editing guidance
- **Always**: Understand context and user intent

**Result**: Users get AI-powered image editing that feels magical, with intelligent fallbacks ensuring it always works!
