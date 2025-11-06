# PaintWeaver Backend Architecture Overview

## 🏗️ Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PAINTWEAVER BACKEND SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────────┐ │
│  │   FRONTEND      │    │   FASTAPI        │    │     GOOGLE GEMINI API       │ │
│  │   (React)       │◄──►│   BACKEND        │◄──►│                             │ │
│  │                 │    │                  │    │  ┌─────────────────────────┐ │ │
│  │ • Canvas        │    │ • Image Upload   │    │  │   gemini-2.5-flash     │ │ │
│  │ • AI Panel      │    │ • AI Processing  │    │  │                         │ │ │
│  │ • Toolbar       │    │ • Image Editing  │    │  │ • Image Analysis        │ │ │
│  │                 │    │ • Response       │    │  │ • Text Instructions     │ │ │
│  └─────────────────┘    └──────────────────┘    │  │ • Editing Guidance      │ │ │
│                                                 │  └─────────────────────────┘ │ │
│                                                 └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow Diagram

```
┌─────────────┐
│   USER      │
│ Uploads     │
│ Image +     │
│ Prompt      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND (/edit endpoint)                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1️⃣ RECEIVE REQUEST                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ • Multipart form data with image file                                   │   │
│  │ • Prompt text (e.g., "turn this into a logo")                          │   │
│  │ • Optional parameters (format, quality, etc.)                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                            │
│                                    ▼                                            │
│  2️⃣ VALIDATION & PREPROCESSING                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ • Check file type (JPEG/PNG/WebP)                                      │   │
│  │ • Validate file size (< 10MB)                                          │   │
│  │ • Convert to PIL Image object                                          │   │
│  │ • Extract image bytes                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                            │
│                                    ▼                                            │
│  3️⃣ AI PROCESSING PIPELINE                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    _edit_with_ai() function                             │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │              GOOGLE GEMINI API CALL                             │    │   │
│  │  │                                                                 │    │   │
│  │  │  📤 SEND TO GEMINI:                                             │    │   │
│  │  │  • Enhanced prompt with detailed instructions                   │    │   │
│  │  │  • Original image (PIL Image object)                           │    │   │
│  │  │  • Request for technical editing parameters                     │    │   │
│  │  │                                                                 │    │   │
│  │  │  📥 RECEIVE FROM GEMINI:                                        │    │   │
│  │  │  • Detailed text analysis of the image                         │    │   │
│  │  │  • Step-by-step editing instructions                           │    │   │
│  │  │  • Technical parameters (RGB values, percentages)              │    │   │
│  │  │  • Creative suggestions                                         │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                            │
│                                    ▼                                            │
│  4️⃣ PROGRAMMATIC IMAGE EDITING                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │              _apply_ai_suggested_edits() function                       │   │
│  │                                                                         │   │
│  │  • Parse Gemini's analysis for specific values                         │   │
│  │  • Apply PIL/Pillow image transformations:                             │   │
│  │    - Brightness/Contrast adjustments                                   │   │
│  │    - Color saturation changes                                          │   │
│  │    - Sharpness/Blur filters                                           │   │
│  │    - Style-specific effects (vintage, modern, etc.)                   │   │
│  │    - Logo optimizations                                               │   │
│  │  • Intelligent keyword matching from prompt                           │   │
│  │  • Professional finishing touches                                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                            │
│                                    ▼                                            │
│  5️⃣ RESPONSE PREPARATION                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ • Convert edited image back to bytes                                   │   │
│  │ • Apply format conversion (PNG/JPEG/WebP)                              │   │
│  │ • Add AI analysis to response headers                                  │   │
│  │ • Set appropriate MIME type                                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│   FRONTEND   │
│  Receives:   │
│ • Edited     │
│   Image      │
│ • AI         │
│   Analysis   │
└──────────────┘
```

## 🔧 Google Gemini API Integration Details

### 🔑 Authentication & Configuration
```python
# Environment Setup
GEMINI_API_KEY = "your_gemini_api_key_here"

# SDK Configuration
import google.generativeai as genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Model Initialization
model = genai.GenerativeModel('gemini-2.5-flash')
```

### 📤 Request Structure to Gemini
```python
# Enhanced Prompt Template
enhanced_prompt = f"""
I want to edit this image with the following request: "{user_prompt}"

Please provide detailed, actionable editing instructions including:

1. CURRENT IMAGE ANALYSIS:
   - What do you see in this image?
   - Current colors, shapes, style, composition

2. EDITING INSTRUCTIONS for "{user_prompt}":
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

Be very specific with numerical values and technical details.
"""

# API Call
response = model.generate_content([enhanced_prompt, pil_image])
```

### 📥 Response Processing
```python
# Extract Analysis Text
analysis = response.text

# Handle Safety Blocks
if hasattr(response, 'prompt_feedback'):
    if hasattr(response.prompt_feedback, 'block_reason'):
        # Handle blocked content
        
# Parse Technical Parameters
brightness_match = re.search(r'brightness[:\s]*([+-]?\d+)%?', analysis)
contrast_match = re.search(r'contrast[:\s]*([+-]?\d+)%?', analysis)
saturation_match = re.search(r'saturation[:\s]*([+-]?\d+)%?', analysis)
```

## 🎨 Image Processing Pipeline

### 📊 Data Flow
```
Original Image (bytes) 
    ↓
PIL Image Object 
    ↓
Gemini Analysis (text instructions)
    ↓
Parameter Extraction (regex parsing)
    ↓
PIL Transformations (programmatic edits)
    ↓
Enhanced Image (PIL Object)
    ↓
Final Image (bytes) → Frontend
```

### 🛠️ Processing Functions
```python
# Main Processing Functions
async def _edit_with_ai(image_data, prompt, content_type)
    ├── Load image with PIL
    ├── Send to Gemini for analysis
    ├── Parse response for technical parameters
    └── Apply programmatic edits

def _apply_ai_suggested_edits(image_data, prompt, analysis)
    ├── Parse Gemini analysis for specific values
    ├── Apply style-based transformations
    ├── Execute technical adjustments
    └── Return enhanced image
```

## 🔄 Error Handling & Fallbacks

```
┌─────────────────┐
│ Gemini API Call │
└─────────┬───────┘
          │
          ▼
    ┌─────────────┐     ┌──────────────────┐
    │ Success?    │────►│ Parse Analysis   │
    └─────┬───────┘     └──────────────────┘
          │
          ▼ (No)
    ┌─────────────────┐
    │ Safety Block?   │
    └─────┬───────────┘
          │
          ▼ (Yes)
    ┌─────────────────┐
    │ Apply Basic     │
    │ Keyword-Based   │
    │ Edits           │
    └─────────────────┘
```

## 📈 Performance Characteristics

- **Latency**: ~2-5 seconds per request
- **Throughput**: Limited by Gemini API rate limits
- **Image Size**: Up to 10MB input
- **Formats**: JPEG, PNG, WebP support
- **Quality**: Maintains high image quality with PIL processing

## 🔒 Security Features

- File type validation
- Size limits (10MB max)
- Content safety filtering via Gemini
- CORS protection
- Environment variable protection for API keys

This architecture provides a robust, AI-powered image editing system that leverages Google's Gemini 2.5 Flash for intelligent analysis while using local PIL processing for actual image transformations.