# 🔧 PaintWeaver Backend

FastAPI-based backend service that provides AI-powered image editing capabilities using Google's Gemini 2.5 Flash.

## 🏗️ Architecture

The backend serves as a bridge between the frontend canvas and Google's Gemini API, providing intelligent image analysis and programmatic image editing.

```
Frontend Request → FastAPI → Gemini Analysis → PIL Processing → Enhanced Image
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Google Gemini API Key

### Installation

```bash
cd Backend/app

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API key

# Start server
python main.py
```

Server runs on `http://localhost:8000`

## 📡 API Endpoints

### Health Check
```http
GET /healthz
```
Returns service status and AI provider information.

### Image Editing
```http
POST /edit
Content-Type: multipart/form-data

Parameters:
- file: Image file (JPEG/PNG/WebP, max 10MB)
- prompt: AI editing instruction (required)
- format: Output format (jpeg|png|webp|same)
- width: Resize width (optional)
- height: Resize height (optional)
- quality: JPEG quality 1-100 (default: 90)
- use_ai: Enable AI processing (default: true)
```

**Example Request:**
```bash
curl -X POST "http://localhost:8000/edit" \
  -F "file=@image.png" \
  -F "prompt=make this into a colorful logo" \
  -F "format=png"
```

**Response:**
- Binary image data
- `X-AI-Analysis` header with Gemini's analysis

### Testing Endpoints

#### Test Gemini Connection
```http
GET /test-gemini
```

#### List Available Models
```http
GET /list-models
```

#### Test AI Editing
```http
POST /test-ai-edit
```

## 🤖 AI Processing Pipeline

### 1. Image Analysis (Gemini 2.5 Flash)
```python
# Enhanced prompt sent to Gemini
enhanced_prompt = f"""
I want to edit this image: "{user_prompt}"

Provide detailed editing instructions:
1. Current image analysis
2. Specific editing steps
3. Technical parameters (RGB, percentages)
4. Step-by-step process
"""

response = model.generate_content([enhanced_prompt, pil_image])
```

### 2. Parameter Extraction
```python
# Parse Gemini's response for technical values
brightness_match = re.search(r'brightness[:\s]*([+-]?\d+)%?', analysis)
contrast_match = re.search(r'contrast[:\s]*([+-]?\d+)%?', analysis)
saturation_match = re.search(r'saturation[:\s]*([+-]?\d+)%?', analysis)
```

### 3. Image Processing (PIL/Pillow)
```python
# Apply extracted parameters
if brightness_match:
    factor = 1.0 + (int(brightness_match.group(1)) / 100.0)
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(factor)
```

## 🎨 Supported Editing Operations

### Style Transformations
- **Logo Enhancement**: Sharpness + contrast optimization
- **Photorealistic**: Detail enhancement and color correction
- **Vintage/Retro**: Sepia tones and aged effects
- **Watercolor**: Soft blur and color enhancement
- **Modern/Clean**: Sharp contrast and minimal processing

### Technical Adjustments
- **Brightness**: -100% to +200%
- **Contrast**: -100% to +200%
- **Saturation**: -100% to +200%
- **Sharpness**: Gaussian blur to sharp enhancement
- **Color Temperature**: Warm/cool tone adjustments

### Keyword Recognition
The system recognizes keywords in prompts:
- `logo`, `professional` → Logo optimizations
- `bright`, `darker` → Brightness adjustments
- `colorful`, `vibrant` → Saturation enhancement
- `vintage`, `retro` → Sepia effects
- `watercolor`, `artistic` → Soft blur effects

## 🔒 Security Features

### Input Validation
- File type restrictions (JPEG/PNG/WebP only)
- Size limits (10MB maximum)
- Content type verification

### API Safety
- Gemini safety filters for inappropriate content
- Error handling for blocked requests
- Rate limiting protection

### Environment Security
- API keys in environment variables
- No credentials in code
- Secure header handling

## ⚠️ Error Handling

### Gemini API Failures
```python
try:
    response = model.generate_content([prompt, image])
except Exception as e:
    # Fallback to keyword-based editing
    return apply_basic_edits(image, prompt)
```

### Safety Blocks
```python
if hasattr(response, 'prompt_feedback'):
    if response.prompt_feedback.block_reason:
        return image, "Request blocked by safety filters"
```

### Graceful Degradation
- AI failure → Keyword-based editing
- Invalid parameters → Default values
- Processing errors → Original image returned

## 🧪 Testing

### Run All Tests
```bash
# Test model availability
python list_models.py

# Test image generation capabilities
python test_image_generation.py

# Test complete system
python test_simplified_system.py

# Test specific functionality
python test_complete_system.py
```

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:8000/healthz

# Test Gemini connection
curl http://localhost:8000/test-gemini

# Test with sample image
curl -X POST "http://localhost:8000/edit" \
  -F "file=@test_image.png" \
  -F "prompt=make it brighter"
```

## 📊 Performance

### Typical Response Times
- Simple edits: 1-3 seconds
- Complex AI analysis: 3-7 seconds
- Large images (>5MB): 5-10 seconds

### Optimization Tips
- Use smaller images for faster processing
- Specific prompts get better results
- PNG format for best quality
- JPEG for smaller file sizes

## 🔧 Configuration

### Environment Variables
```env
# Required
GEMINI_API_KEY=your_api_key_here

# Optional
OPENAI_API_KEY=your_openai_key_here
```

### Model Configuration
```python
# Current model (can be changed)
model = genai.GenerativeModel('gemini-2.5-flash')

# Alternative models
# model = genai.GenerativeModel('gemini-2.5-pro')  # More powerful
# model = genai.GenerativeModel('gemini-2.0-flash-exp')  # Experimental
```

### Processing Limits
```python
ALLOWED_CT = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB
```

## 🚀 Deployment

### Local Development
```bash
python main.py
# or
uvicorn main:app --reload --port 8000
```

### Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker (Optional)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📝 API Documentation

When the server is running, visit:
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🤝 Contributing

1. Add new editing functions in `_apply_ai_suggested_edits()`
2. Extend AI prompts in `_edit_with_ai()`
3. Add new endpoints following FastAPI patterns
4. Include tests for new features
5. Update documentation

## 📞 Support

- Check logs for detailed error messages
- Use `/test-gemini` endpoint to verify API connection
- Ensure API key is correctly configured
- Check file format and size limits