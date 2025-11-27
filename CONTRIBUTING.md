# Contributing to BrushWeaver

Thank you for your interest in contributing to BrushWeaver! 🎨

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node/Python versions)

### Suggesting Features

We love new ideas! Please create an issue with:
- Clear description of the feature
- Use cases and benefits
- Mockups or examples if applicable

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   - Ensure the app runs without errors
   - Test both frontend and backend
   - Check for console errors

5. **Commit your changes**
   ```bash
   git commit -m "Add: brief description of your changes"
   ```
   
   Use conventional commits:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Include screenshots for UI changes

## Development Setup

### Backend
```bash
cd Backend
pip install -r requirements.txt
cd app
cp .env.example .env
# Add your GEMINI_API_KEY to .env
python -m uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints
- Add docstrings to functions
- Keep functions focused and small

### JavaScript/React (Frontend)
- Use functional components
- Follow React best practices
- Use meaningful variable names
- Add comments for complex logic

## Project Structure

```
brushweaver/
├── Backend/
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── models.py
│       ├── services/
│       └── routers/
├── Frontend/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       └── index.css
└── README.md
```

## Testing

Before submitting a PR:
1. Test all drawing tools
2. Test AI functionality
3. Test authentication flow
4. Check for console errors
5. Test on different browsers if possible

## Questions?

Feel free to create an issue or reach out to the maintainers!

Thank you for contributing! 🙏
