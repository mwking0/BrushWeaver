# 🛠️ Development Guide

Personal development notes and guidelines for PaintWeaver.

## 🚀 Setup

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Google Gemini API Key

### Quick Start
```bash
# Backend
cd Backend/app
pip install -r requirements.txt
cp .env.example .env
# Add your Gemini API key to .env
python main.py

# Frontend
cd Frontend
npm install
npm run dev
```

## 🏗️ Project Structure

```
paintweaver/
├── Frontend/                 # React frontend
│   ├── src/components/      # React components
│   └── package.json
├── Backend/                 # FastAPI backend
│   └── app/
│       ├── main.py         # Main application
│       ├── tests/          # Test files
│       └── requirements.txt
└── scripts/                # Development tools
```

## 🔧 Development Workflow

### Before Committing
```bash
# Run security check
python scripts/security_check.py

# Test backend
cd Backend/app
python tests/test_system.py

# Test frontend
cd Frontend
npm test
```

### Git Workflow
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Merge when ready
```

## 🧪 Testing

### Backend Tests
```bash
cd Backend/app
python tests/test_models.py
python tests/test_system.py
```

### Frontend Tests
```bash
cd Frontend
npm test
npm run test:coverage
```

## 🔒 Security

- Never commit real API keys
- Use `.env` files for secrets
- Run security check before pushing
- Keep dependencies updated

## 📝 Code Style

### Python
- Follow PEP 8
- Use type hints
- Add docstrings

### JavaScript/React
- Use ESLint and Prettier
- Functional components with hooks
- Meaningful variable names

## 🚀 Deployment Notes

### Local Development
- Backend: `python main.py` (port 8000)
- Frontend: `npm run dev` (port 5173)

### Production Build
```bash
# Frontend
cd Frontend
npm run build

# Backend
cd Backend/app
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📊 Performance

- Typical AI processing: 2-5 seconds
- Image size limit: 10MB
- Supported formats: PNG, JPEG, WebP

## 🔧 Configuration

### Environment Variables
```env
GEMINI_API_KEY=your_api_key_here
```

### Model Settings
Currently using `gemini-2.5-flash` for image analysis.

## 📚 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Google Gemini API](https://ai.google.dev/)
- [Fabric.js Canvas Library](http://fabricjs.com/)

## 🐛 Common Issues

### Backend Issues
- **API key not working**: Check `.env` file
- **Import errors**: Verify Python dependencies
- **Port conflicts**: Change port in `main.py`

### Frontend Issues
- **Canvas not loading**: Check Fabric.js import
- **API calls failing**: Verify backend is running
- **Build errors**: Clear node_modules and reinstall

## 💡 Future Ideas

- [ ] Add more AI models
- [ ] Implement user authentication
- [ ] Add cloud storage integration
- [ ] Mobile responsive improvements
- [ ] Batch processing features
- [ ] Plugin system for custom tools

---

Personal development notes - keep this updated as the project evolves!