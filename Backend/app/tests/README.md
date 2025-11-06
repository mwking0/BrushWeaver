# 🧪 Backend Tests

This directory contains test files for the PaintWeaver backend.

## Test Files

- `test_models.py` - Test available Gemini models and capabilities
- `test_system.py` - Test the complete AI editing pipeline
- `test_api.py` - Test API endpoints and responses

## Running Tests

```bash
# Run all tests
python -m pytest tests/

# Run specific test
python test_models.py

# Run with verbose output
python test_system.py -v
```

## Test Coverage

The tests cover:
- ✅ Model availability and initialization
- ✅ Image processing pipeline
- ✅ API endpoint functionality
- ✅ Error handling and fallbacks
- ✅ Gemini API integration

## Adding New Tests

1. Create test file in this directory
2. Follow naming convention `test_*.py`
3. Include docstrings and comments
4. Test both success and failure cases
5. Update this README