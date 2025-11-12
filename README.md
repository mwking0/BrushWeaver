# 🎨 BrushWeaver - Personal AI Image Editor

My personal web-based image editor that combines intuitive drawing tools with AI-powered image enhancement using Google's Gemini 2.5 Flash.

## ✨ Features

### 🖌️ Drawing & Editing Tools
- **Freehand Drawing** - Smooth brush strokes with pressure sensitivity
- **Shape Tools** - Rectangles, circles, lines with customizable properties
- **Text Tool** - Add and edit text with various fonts and styles
- **Selection Tools** - Move, resize, and transform objects
- **Layers System** - Organize your artwork with multiple layers
- **Undo/Redo** - Comprehensive history management
- **Zoom & Pan** - Navigate large canvases with ease

### 🤖 AI-Powered Enhancement
- **Intelligent Analysis** - Gemini 2.5 Flash analyzes your images
- **Style Transformation** - Convert to watercolor, vintage, modern styles
- **Logo Creation** - Transform drawings into professional logos
- **Color Enhancement** - Smart color adjustments and corrections
- **Quality Improvement** - Sharpen, brighten, and enhance images
- **Creative Suggestions** - AI-guided editing recommendations

### 🎯 Advanced Features
- **Object Grouping** - Merge and organize canvas elements
- **Keyboard Shortcuts** - Efficient workflow with hotkeys
- **Export Options** - Save in multiple formats (PNG, JPEG, WebP)
- **Responsive Design** - Works on desktop and tablet devices
- **Real-time Preview** - See changes instantly

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────────┐
│   FRONTEND      │    │   FASTAPI        │    │     GOOGLE GEMINI API       │
│   (React)       │◄──►│   BACKEND        │◄──►│                             │
│                 │    │                  │    │  • Image Analysis           │
│ • Canvas        │    │ • Image Upload   │    │  • Text Instructions        │
│ • AI Panel      │    │ • AI Processing  │    │  • Editing Guidance         │
│ • Toolbar       │    │ • Image Editing  │    │  • Technical Parameters     │
└─────────────────┘    └──────────────────┘    └─────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/brushweaver.git
cd brushweaver
```

### 2. Backend Setup
```bash
cd Backend/app

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your Gemini API key

# Start the backend server
python main.py
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup
```bash
cd Frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📖 Documentation

- [Backend API Documentation](Backend/README.md)
- [Frontend Development Guide](Frontend/README.md)
- [Architecture Overview](Backend/app/architecture_overview.md)
- [API Reference](http://localhost:8000/docs) (when backend is running)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in `Backend/app/` with:

```env
# Required: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: OpenAI API Key (for additional features)
OPENAI_API_KEY=your_openai_api_key_here
```

### API Keys Setup

1. **Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy and paste it into your `.env` file

2. **OpenAI API Key** (Optional):
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account and generate an API key
   - Add it to your `.env` file

## 🎮 Usage

### Basic Drawing
1. Select a drawing tool from the toolbar
2. Choose colors, brush size, and other properties
3. Draw on the canvas
4. Use Ctrl+Z/Ctrl+Y for undo/redo

### AI Enhancement
1. Draw or upload an image
2. Open the AI Panel on the right
3. Enter a prompt like "make this more colorful" or "turn into a logo"
4. Click "Weave with AI" to apply enhancements
5. View the enhanced result on your canvas

### Keyboard Shortcuts
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+0` - Reset zoom
- `G` - Toggle grid
- `Delete` - Delete selected objects
- `Ctrl+A` - Select all
- `Escape` - Deselect all

## 🛠️ Development

### Project Structure
```
brushweaver/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── package.json
├── Backend/                 # FastAPI backend application
│   └── app/
│       ├── main.py         # Main FastAPI application
│       ├── requirements.txt # Python dependencies
│       └── .env.example    # Environment variables template
└── README.md
```

### Adding New Features

1. **Frontend**: Add React components in `Frontend/src/components/`
2. **Backend**: Extend the FastAPI app in `Backend/app/main.py`
3. **AI Features**: Modify the AI processing pipeline in `_edit_with_ai()`

### Testing

```bash
# Backend tests
cd Backend/app
python test_simplified_system.py

# Frontend tests
cd Frontend
npm test
```

## 📝 Development Notes

This is a personal project. For development:
1. Create feature branches for major changes
2. Test thoroughly before merging to main
3. Keep documentation updated

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** - For powerful AI image analysis
- **FastAPI** - For the robust backend framework
- **React** - For the interactive frontend
- **Fabric.js** - For canvas manipulation
- **PIL/Pillow** - For image processing

## 📝 Notes

Personal project for learning and experimentation with:
- React and modern frontend development
- FastAPI and Python backend development  
- AI integration with Google Gemini
- Canvas manipulation and image processing

---

Built with ❤️ using React, FastAPI, and Google Gemini AI