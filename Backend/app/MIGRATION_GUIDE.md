# Migration Guide: Old → New Backend Structure

## What Changed?

The backend has been refactored from a single 684-line `main.py` file into a clean, modular architecture.

## File Mapping

### Old Structure
```
Backend/app/
└── main.py (684 lines - everything in one file)
```

### New Structure
```
Backend/app/
├── main.py              # App initialization (40 lines)
├── config.py            # Configuration (60 lines)
├── models.py            # Data models (90 lines)
├── services/
│   ├── ai_service.py    # AI logic (180 lines)
│   └── image_service.py # Image processing (220 lines)
└── routers/
    ├── health_router.py # Health endpoints (140 lines)
    └── image_router.py  # Image editing (130 lines)
```

## Code Migration Map

### Configuration
**Old**: Scattered throughout `main.py`
```python
# Old
ALLOWED_CT = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = 10 * 1024 * 1024
```

**New**: Centralized in `config.py`
```python
# New
from config import settings
settings.ALLOWED_CONTENT_TYPES
settings.MAX_FILE_SIZE
```

### AI Operations
**Old**: Functions in `main.py`
```python
# Old
async def _edit_with_ai(image_data, prompt, content_type):
    # 200+ lines of code
```

**New**: Service class in `services/ai_service.py`
```python
# New
from services.ai_service import ai_service
result = await ai_service.edit_image_with_ai(image_data, prompt, content_type)
```

### Image Processing
**Old**: Helper functions in `main.py`
```python
# Old
def _resize_keep_aspect(img, width, height):
def _watermark(img, text, opacity, margin):
def _apply_ai_suggested_edits(image_data, prompt, analysis):
```

**New**: Service class in `services/image_service.py`
```python
# New
from services.image_service import image_service
img = image_service.resize_keep_aspect(img, width, height)
img = image_service.add_watermark(img, text)
data = image_service.apply_ai_suggested_edits(data, prompt, analysis)
```

### API Endpoints
**Old**: All in `main.py`
```python
# Old
@app.get("/healthz")
@app.post("/edit")
@app.get("/test-gemini")
```

**New**: Organized in routers
```python
# New - in routers/health_router.py
@router.get("/healthz")
@router.get("/test-gemini")

# New - in routers/image_router.py
@router.post("/edit")
```

## Breaking Changes

### ⚠️ None!
The API endpoints remain exactly the same. All changes are internal.

### API Compatibility
✅ `GET /healthz` - Same
✅ `POST /edit` - Same parameters and response
✅ `GET /test-gemini` - Same
✅ `GET /list-models` - Same
✅ All other endpoints - Same

## Benefits of New Structure

### For Developers
- **Find code faster**: Know exactly where to look
- **Easier debugging**: Smaller, focused files
- **Better testing**: Test services independently
- **Parallel work**: Multiple devs can work on different modules

### For Maintenance
- **Isolated changes**: Modify one area without affecting others
- **Clear dependencies**: Easy to see what depends on what
- **Better documentation**: Self-documenting structure
- **Easier onboarding**: New developers understand structure quickly

### For Features
- **Add endpoints easily**: Just add to appropriate router
- **Extend services**: Add methods to service classes
- **New configurations**: Add to `config.py`
- **New models**: Add to `models.py`

## How to Use

### Running the Server
```bash
# Same as before
cd Backend/app
python -m uvicorn main:app --reload --port 8000

# Or
python main.py
```

### Importing in Code
```python
# Configuration
from config import settings

# Models
from models import ImageEditRequest, HealthResponse

# Services
from services.ai_service import ai_service
from services.image_service import image_service

# Routers (in main.py)
from routers import health_router, image_router
```

## Testing

### Old Way
- Test everything through API endpoints
- Hard to isolate issues
- Slow tests

### New Way
```python
# Test services directly
from services.ai_service import ai_service

def test_ai_connection():
    result = ai_service.test_connection()
    assert result["status"] == "success"

# Test image processing
from services.image_service import image_service

def test_resize():
    img = Image.new('RGB', (100, 100))
    resized = image_service.resize_keep_aspect(img, 50, None)
    assert resized.size == (50, 50)
```

## Rollback Plan

If you need to rollback to the old version:

```bash
cd Backend/app
# The old file is backed up as main_old.py
mv main.py main_refactored.py
mv main_old.py main.py
# Restart server
```

## Common Tasks

### Adding a New Endpoint
1. Choose appropriate router (`health_router.py` or `image_router.py`)
2. Add route function
3. Use services for logic
4. Define Pydantic model if needed

### Adding Configuration
1. Open `config.py`
2. Add to `Settings` class
3. Use via `settings.YOUR_CONFIG`

### Modifying AI Logic
1. Open `services/ai_service.py`
2. Modify `AIService` class
3. Changes automatically available to all endpoints

### Modifying Image Processing
1. Open `services/image_service.py`
2. Modify `ImageService` class
3. Changes automatically available to all endpoints

## Questions?

- Check `ARCHITECTURE.md` for detailed structure
- Old code is in `main_old.py` for reference
- All functionality is preserved, just better organized

## Summary

✅ **Same API** - No breaking changes
✅ **Better organized** - Clear structure
✅ **Easier to maintain** - Modular design
✅ **Faster development** - Find and modify code quickly
✅ **Better testing** - Test components independently
✅ **Team-friendly** - Multiple developers can work together
✅ **Production-ready** - Professional architecture
