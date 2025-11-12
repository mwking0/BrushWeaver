# Backend Architecture

## Overview
The BrushWeaver backend has been refactored following clean architecture principles with clear separation of concerns.

## Project Structure

```
Backend/app/
├── main.py                 # Application entry point
├── config.py              # Configuration and settings
├── models.py              # Pydantic models for validation
├── services/              # Business logic layer
│   ├── __init__.py
│   ├── ai_service.py      # AI operations (Gemini)
│   └── image_service.py   # Image processing operations
├── routers/               # API endpoints layer
│   ├── __init__.py
│   ├── health_router.py   # Health checks and testing
│   └── image_router.py    # Image editing endpoints
└── tests/                 # Test files

```

## Architecture Layers

### 1. Configuration Layer (`config.py`)
- Centralized configuration management
- Environment variables loading
- Application settings (API keys, limits, defaults)
- Type-safe settings with defaults

### 2. Models Layer (`models.py`)
- Pydantic models for request/response validation
- Type safety and automatic documentation
- Input validation and serialization

### 3. Services Layer (`services/`)
- **AI Service** (`ai_service.py`)
  - Gemini API integration
  - Image generation and analysis
  - Model initialization and management
  - Singleton pattern for efficiency

- **Image Service** (`image_service.py`)
  - Image processing operations
  - Format conversion and resizing
  - Watermarking and filters
  - AI-guided programmatic edits

### 4. Routers Layer (`routers/`)
- **Health Router** (`health_router.py`)
  - Health checks
  - API testing endpoints
  - Model listing and testing

- **Image Router** (`image_router.py`)
  - Image editing endpoint
  - Request validation
  - Response formatting

### 5. Application Layer (`main.py`)
- FastAPI app initialization
- CORS configuration
- Router registration
- Server startup

## Key Improvements

### ✅ Separation of Concerns
- Each module has a single responsibility
- Business logic separated from API endpoints
- Configuration isolated from code

### ✅ Maintainability
- Smaller, focused files (< 300 lines each)
- Clear module boundaries
- Easy to locate and modify code

### ✅ Testability
- Services can be tested independently
- Mock-friendly architecture
- Clear dependencies

### ✅ Scalability
- Easy to add new endpoints
- Simple to extend services
- Modular design allows parallel development

### ✅ Type Safety
- Pydantic models for validation
- Type hints throughout
- Better IDE support

### ✅ Reusability
- Services can be used across multiple endpoints
- Singleton pattern for shared resources
- DRY principle applied

## Design Patterns Used

1. **Singleton Pattern**: AI and Image services
2. **Dependency Injection**: Services injected into routers
3. **Repository Pattern**: Services act as repositories for operations
4. **Factory Pattern**: Model initialization in AI service
5. **Strategy Pattern**: Different image processing strategies

## API Endpoints

### Health & Testing
- `GET /healthz` - Health check
- `GET /test-gemini` - Test Gemini connection
- `GET /list-models` - List available models
- `POST /test-ai-edit` - Test AI editing
- `GET /test-image-generation` - Test image generation

### Image Editing
- `POST /edit` - Edit image with AI and traditional processing

## Configuration

All configuration is centralized in `config.py`:

```python
from config import settings

# Access settings
api_key = settings.GEMINI_API_KEY
max_size = settings.MAX_FILE_SIZE
```

## Adding New Features

### Adding a New Endpoint
1. Create route function in appropriate router
2. Use services for business logic
3. Define Pydantic models for validation
4. Document with docstrings

### Adding a New Service
1. Create new service file in `services/`
2. Implement service class
3. Create singleton instance
4. Import in routers as needed

### Adding New Configuration
1. Add to `Settings` class in `config.py`
2. Set default value
3. Document in `.env.example`

## Error Handling

- HTTPException for API errors
- Try-except blocks in services
- Graceful degradation (AI fallback)
- Detailed error logging

## Performance Considerations

- Singleton services (no repeated initialization)
- Async/await for I/O operations
- Efficient image processing with PIL
- Connection pooling for AI APIs

## Security

- Input validation with Pydantic
- File size limits
- Content type validation
- CORS configuration
- Environment variable for secrets

## Migration from Old Code

The old monolithic `main.py` (684 lines) has been split into:
- `main.py` (40 lines) - Entry point
- `config.py` (60 lines) - Configuration
- `models.py` (90 lines) - Data models
- `services/ai_service.py` (180 lines) - AI logic
- `services/image_service.py` (220 lines) - Image logic
- `routers/health_router.py` (140 lines) - Health endpoints
- `routers/image_router.py` (130 lines) - Image endpoints

**Total**: ~860 lines (well-organized vs 684 lines monolithic)

## Benefits Achieved

✅ **Better Organization**: Clear file structure
✅ **Easier Testing**: Isolated components
✅ **Faster Development**: Find code quickly
✅ **Team Collaboration**: Multiple developers can work simultaneously
✅ **Code Reuse**: Services used across endpoints
✅ **Maintainability**: Changes isolated to specific modules
✅ **Documentation**: Self-documenting structure
✅ **Scalability**: Easy to add features

## Next Steps

1. Add unit tests for services
2. Add integration tests for routers
3. Implement caching for AI responses
4. Add rate limiting
5. Implement request logging
6. Add metrics and monitoring
7. Create Docker configuration
8. Add CI/CD pipeline
