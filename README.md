# 🎨 BrushWeaver

**AI-Powered Creative Studio** - Draw, design, and transform your ideas into reality with local AI image generation.

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

### 🤖 **Local AI Image Editing**
- Transform drawings with AI prompts
- Style presets (watercolor, oil painting, anime, etc.)
- Image-to-image editing using **Qwen Image Edit model**
- **Optimized for editing** - preserves composition while transforming style
- **Completely offline** - no API costs!

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
- **GPU recommended** (NVIDIA with 6-8GB VRAM for best performance)
- **10GB disk space** for AI models

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/brushweaver.git
cd brushweaver
```

2. **Setup Backend**
```bash
cd Backend/app
pip install -r requirements.txt
cp .env.example .env
```

3. **Download AI Model**
```bash
cd ../../qwen
pip install -r requirements.txt
python setup_qwen.py
```
Choose option 1 (qwen-image-edit) - specifically designed for image editing!

4. **Setup Frontend**
```bash
cd ../Frontend
npm install
```

5. **Run the Application**

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

6. **Open your browser**
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
- "Transform into photorealistic image"

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
├── main.py                      # Application entry point
├── config.py                   # Configuration and settings
├── models.py                   # Pydantic models
├── services/                   # Business logic
│   ├── qwen_service.py         # Local AI image generation
│   └── image_service.py        # Image processing
└── routers/                    # API endpoints
    ├── health_router.py        # Health checks
    └── image_router.py         # Image editing
```

### Frontend (React + Vite)

```
Frontend/src/
├── App.jsx                     # Main app component
├── components/
│   ├── DrawingEditor.jsx       # Canvas and drawing tools
│   ├── Toolbar.jsx             # Tool selection
│   ├── AIPanel.jsx             # AI controls and layers
│   ├── LandingPage.jsx         # Landing page
│   └── Auth/                   # Authentication components
└── main.jsx                    # Entry point
```

## 🎨 Available AI Models

| Model | Speed | Quality | Size | VRAM | Best For |
|-------|-------|---------|------|------|----------|
| **Qwen Image Edit** 🎯 | 5-8s | ⭐⭐⭐⭐⭐ | 10GB | 12GB+ | **Image Editing** |
| SDXL-Turbo ⚡ | 1-2s | ⭐⭐⭐⭐⭐ | 7GB | 8GB+ | Speed |
| SD-Turbo | 2-3s | ⭐⭐⭐⭐ | 5GB | 6GB+ | Lower VRAM |
| Stable Diffusion XL | 10-15s | ⭐⭐⭐⭐⭐ | 7GB | 8GB+ | Quality |
| Realistic Vision | 8-12s | ⭐⭐⭐⭐⭐ | 5GB | 6GB+ | Photorealistic |

**Qwen Image Edit is recommended** - specifically designed for image editing tasks!

## 🔧 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main Endpoints

- `POST /edit` - Edit image with AI
- `GET /healthz` - Health check
- `GET /test-ai` - Test AI model connection
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

- **Stability AI** for Stable Diffusion models
- **Hugging Face** for model hosting and diffusers library
- **Fabric.js** for canvas manipulation
- **FastAPI** for the backend framework
- **React** for the frontend framework
- **Vite** for blazing fast development

## 📚 Documentation

- [Local Models Guide](LOCAL_MODELS_GUIDE.md) - Complete setup guide
- [Image-to-Image Setup](IMAGE_TO_IMAGE_SETUP.md) - Quick start
- [Available Models](qwen/MODELS.md) - Model comparison
- [Setup Auth](SETUP_AUTH.md) - Authentication documentation

## 🐛 Known Issues

- Authentication is currently mock-based (localStorage only)
- Local models require GPU for optimal performance (CPU works but slower)
- Some features require modern browsers
- Qwen Image Edit model requires 12GB+ VRAM (use SDXL-Turbo for 8GB GPUs)

## 💡 Tips

- Use the AI with specific, descriptive prompts for best results
- Save your work frequently using Ctrl+S
- Experiment with different style presets
- Use layers to organize complex drawings
- Qwen Image Edit model is specifically optimized for editing tasks
- For faster generation, use SDXL-Turbo (1-2s vs 5-8s)

## 🗺️ Roadmap

- [x] Local image editing models
- [x] Qwen Image Edit integration
- [x] SDXL-Turbo for ultra-fast generation
- [ ] Real backend authentication (JWT)
- [ ] Database integration for user accounts
- [ ] Cloud storage for projects
- [ ] ControlNet for precise editing
- [ ] Collaborative editing
- [ ] Mobile app
- [ ] Plugin system
- [ ] Template library

---

Made with ❤️ and powered by local AI
