# 🎨 BrushWeaver

**AI-Powered Creative Studio** - Draw, design, and transform your ideas into reality with the power of artificial intelligence.

![BrushWeaver](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Python](https://img.shields.io/badge/Python-3.11-3776ab)

## ✨ Features

### 🖌️ **Professional Drawing Tools**
- Pen, eraser, shapes, text, and line tools
- Customizable brush sizes and colors
- Text formatting (font, size, color, alignment)
- Shape tools (rectangle, circle, triangle)

### 🤖 **AI-Powered Editing**
- Transform drawings with AI prompts
- Style presets (watercolor, oil painting, anime, etc.)
- Multiple processing modes (replace, layer, selection)
- Powered by Google Gemini 2.5 Flash Image

### 📐 **Layer Management**
- Create, rename, and reorder layers
- Drag-and-drop layer organization
- Layer visibility controls
- Group/ungroup objects

### ⚡ **Advanced Features**
- Undo/Redo with full history
- Zoom and pan controls
- Grid overlay
- Multi-selection (Ctrl+click)
- Keyboard shortcuts
- Save/Load projects
- Export (PNG, JPEG, SVG)

### 🔐 **User Authentication**
- Beautiful landing page
- Sign up / Login system
- Protected routes
- Session management

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Gemini API Key** (Get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/brushweaver.git
cd brushweaver
```

2. **Setup Backend**
```bash
cd Backend
pip install -r requirements.txt
cd app
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

3. **Setup Frontend**
```bash
cd Frontend
npm install
```

4. **Run the Application**

Terminal 1 (Backend):
```bash
cd Backend/app
python -m uvicorn main:app --reload --port 8000
```

Terminal 2 (Frontend):
```bash
cd Frontend
npm run dev
```

5. **Open your browser**
- Frontend: http://localhost:3000/
- Backend API: http://localhost:8000/

## 📖 Usage

### Getting Started

1. **Visit the Landing Page** at http://localhost:3000/
2. **Sign Up** with any email and password (mock auth for now)
3. **Start Drawing** with the intuitive tools
4. **Use AI** to transform your artwork with natural language prompts

### AI Prompts Examples

- "Make it look like a watercolor painting"
- "Add a sunset background"
- "Convert to anime style"
- "Make it more colorful and vibrant"
- "Apply oil painting effect"

### Keyboard Shortcuts

- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo
- **Delete** - Delete selected objects
- **Ctrl+G** - Group objects
- **Ctrl+Shift+G** - Ungroup
- **G** - Toggle grid
- **Ctrl+0** - Reset zoom
- **P** - Pen tool
- **V** - Select tool
- **E** - Eraser tool
- **T** - Text tool
- **L** - Line tool

## 🏗️ Architecture

### Backend (FastAPI + Python)

```
Backend/app/
├── main.py                 # Application entry point
├── config.py              # Configuration and settings
├── models.py              # Pydantic models
├── services/              # Business logic
│   ├── ai_service.py      # AI operations (Gemini)
│   └── image_service.py   # Image processing
└── routers/               # API endpoints
    ├── health_router.py   # Health checks
    └── image_router.py    # Image editing
```

### Frontend (React + Vite)

```
Frontend/src/
├── App.jsx                # Main app with routing
├── components/
│   ├── LandingPage.jsx    # Landing page
│   ├── DrawingEditor.jsx  # Main editor
│   ├── Toolbar.jsx        # Drawing tools
│   ├── AIPanel.jsx        # AI controls & layers
│   └── Auth/              # Authentication
│       ├── Login.jsx
│       └── Signup.jsx
└── index.css              # Styles
```

## 🔧 Configuration

### Backend Configuration

Edit `Backend/app/.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

### Frontend Configuration

The frontend automatically connects to `http://localhost:8000` for the backend API.

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main Endpoints

- `POST /edit` - Edit image with AI
- `GET /healthz` - Health check
- `GET /test-gemini` - Test Gemini connection
- `GET /list-models` - List available AI models

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **Fabric.js** for canvas manipulation
- **FastAPI** for the backend framework
- **React** for the frontend framework
- **Vite** for blazing fast development

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/brushweaver](https://github.com/yourusername/brushweaver)

## 🗺️ Roadmap

- [ ] Real backend authentication (JWT)
- [ ] Database integration for user accounts
- [ ] Cloud storage for projects
- [ ] More AI models (Stable Diffusion, DALL-E)
- [ ] Collaborative editing
- [ ] Mobile app
- [ ] Plugin system
- [ ] Template library

## 🐛 Known Issues

- Authentication is currently mock-based (localStorage only)
- AI image generation requires Gemini API quota
- Some features require modern browsers

## 💡 Tips

- Use the AI with specific, descriptive prompts for best results
- Save your work frequently using Ctrl+S
- Experiment with different style presets
- Use layers to organize complex drawings

---

Made with ❤️ by [Your Name]
