# 🎨 BrushWeaver Frontend

Modern React-based image editor with AI-powered enhancement capabilities. Built with Vite for fast development and optimized production builds.

## ✨ Features

### 🖌️ Drawing Tools
- **Brush Tool** - Freehand drawing with customizable size and color
- **Rectangle Tool** - Create rectangles with fill and stroke options
- **Circle Tool** - Draw circles and ellipses
- **Line Tool** - Straight lines with various styles
- **Text Tool** - Add and edit text with font customization
- **Selection Tool** - Move, resize, and transform objects

### 🎯 Advanced Features
- **Layers System** - Organize artwork with multiple layers
- **Undo/Redo** - Comprehensive history management (50+ actions)
- **Object Grouping** - Merge and organize canvas elements
- **Zoom & Pan** - Navigate large canvases smoothly
- **Grid System** - Alignment guides and snapping
- **Keyboard Shortcuts** - Efficient workflow

### 🤖 AI Integration
- **AI Panel** - Intuitive interface for AI commands
- **Style Presets** - Quick access to common styles
- **Prompt History** - Reuse previous AI commands
- **Favorites System** - Save frequently used prompts
- **Real-time Processing** - Live feedback during AI operations

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Backend server running on `http://localhost:8000`

### Installation
```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to use the application.

## 🏗️ Project Structure

```
Frontend/
├── src/
│   ├── components/          # React components
│   │   ├── DrawingEditor.jsx    # Main canvas component
│   │   ├── Toolbar.jsx          # Drawing tools
│   │   ├── AIPanel.jsx          # AI interface
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── styles/             # CSS modules
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
└── vite.config.js         # Vite configuration
```

## 🎮 Component Overview

### DrawingEditor.jsx
Main canvas component handling:
- Fabric.js canvas initialization
- Tool state management
- Object manipulation
- Undo/redo system
- AI integration

```jsx
const DrawingEditor = () => {
  const [canvas, setCanvas] = useState(null);
  const [selectedTool, setSelectedTool] = useState('brush');
  const [isLoading, setIsLoading] = useState(false);
  
  // Canvas setup, tool handlers, AI processing
};
```

### Toolbar.jsx
Tool selection and configuration:
- Drawing tool buttons
- Color picker
- Brush size controls
- Style options
- Action buttons (undo/redo/clear)

### AIPanel.jsx
AI interaction interface:
- Prompt input
- Style presets
- History management
- Favorites system
- Quick suggestions

## 🎨 Canvas Management

### Fabric.js Integration
```javascript
// Canvas initialization
const canvas = new fabric.Canvas('canvas', {
  width: 800,
  height: 600,
  backgroundColor: 'white'
});

// Tool switching
const switchTool = (tool) => {
  canvas.isDrawingMode = (tool === 'brush');
  canvas.selection = (tool === 'select');
};
```

### State Management
```javascript
// Undo/Redo system
const saveState = () => {
  const state = JSON.stringify(canvas.toJSON());
  setHistory(prev => [...prev.slice(-49), state]);
};

const undo = () => {
  if (historyStep > 0) {
    canvas.loadFromJSON(history[historyStep - 1]);
    setHistoryStep(historyStep - 1);
  }
};
```

## 🤖 AI Integration

### API Communication
```javascript
const handleAIEdit = async (prompt) => {
  setIsLoading(true);
  
  try {
    // Export canvas to blob
    const blob = await new Promise(resolve => 
      canvas.toBlob(resolve, 'image/png')
    );
    
    // Send to backend
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('prompt', prompt);
    
    const response = await fetch('http://localhost:8000/edit', {
      method: 'POST',
      body: formData
    });
    
    // Load enhanced image
    const enhancedBlob = await response.blob();
    const imageUrl = URL.createObjectURL(enhancedBlob);
    
    // Update canvas
    fabric.Image.fromURL(imageUrl, (img) => {
      canvas.add(img);
      canvas.renderAll();
    });
    
  } catch (error) {
    console.error('AI editing failed:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Error Handling
```javascript
// Network error handling
const handleAIError = (error) => {
  if (error.name === 'NetworkError') {
    showNotification('Backend server not available');
  } else if (error.status === 413) {
    showNotification('Image too large (max 10MB)');
  } else {
    showNotification('AI processing failed');
  }
};
```

## ⌨️ Keyboard Shortcuts

### Global Shortcuts
- `Ctrl+Z` - Undo last action
- `Ctrl+Y` - Redo last action
- `Ctrl+0` - Reset zoom to 100%
- `Ctrl+A` - Select all objects
- `Delete` - Delete selected objects
- `Escape` - Deselect all objects

### Tool Shortcuts
- `B` - Brush tool
- `R` - Rectangle tool
- `C` - Circle tool
- `L` - Line tool
- `T` - Text tool
- `S` - Selection tool
- `G` - Toggle grid

### AI Shortcuts
- `Ctrl+Enter` - Submit AI prompt
- `Ctrl+H` - Show/hide AI panel

## 🎨 Styling System

### CSS Architecture
```css
/* Global styles */
:root {
  --primary-color: #4CAF50;
  --secondary-color: #2196F3;
  --background-color: #f5f5f5;
  --text-color: #333;
}

/* Component-specific styles */
.drawing-editor {
  display: flex;
  height: 100vh;
}

.toolbar {
  width: 60px;
  background: var(--background-color);
}

.ai-panel {
  width: 300px;
  background: white;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
}
```

### Responsive Design
```css
@media (max-width: 768px) {
  .drawing-editor {
    flex-direction: column;
  }
  
  .toolbar {
    width: 100%;
    height: 60px;
  }
  
  .ai-panel {
    width: 100%;
    height: 200px;
  }
}
```

## 🔧 Configuration

### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### Environment Variables
```env
# .env.local
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=BrushWeaver
VITE_VERSION=1.0.0
```

## 🧪 Testing

### Component Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Manual Testing Checklist
- [ ] All drawing tools work correctly
- [ ] Undo/redo functions properly
- [ ] AI panel submits requests
- [ ] Canvas exports correctly
- [ ] Keyboard shortcuts respond
- [ ] Responsive design works

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Static Deployment
```bash
# Build for static hosting
npm run build

# Deploy dist/ folder to your hosting service
```

## 🔧 Customization

### Adding New Tools
1. Create tool component in `components/tools/`
2. Add tool logic to `DrawingEditor.jsx`
3. Update toolbar in `Toolbar.jsx`
4. Add keyboard shortcut
5. Update documentation

### Extending AI Features
1. Add new prompt templates in `AIPanel.jsx`
2. Extend style presets
3. Add new processing options
4. Update backend integration

### Theming
1. Update CSS custom properties in `index.css`
2. Modify component styles
3. Add theme switcher component
4. Persist theme preference

## 🚀 Performance Optimization

### Canvas Performance
- Use `fabric.Object.NUM_FRACTION_DIGITS = 2` for better performance
- Implement object pooling for frequently created objects
- Use `canvas.renderOnAddRemove = false` during batch operations

### Memory Management
- Dispose of unused fabric objects
- Clear canvas history when not needed
- Optimize image loading and caching

### Bundle Optimization
- Code splitting with React.lazy()
- Tree shaking unused dependencies
- Optimize images and assets

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Implement changes
3. Add/update tests
4. Update documentation
5. Submit pull request

### Code Style
- Use ESLint and Prettier
- Follow React best practices
- Write meaningful component names
- Add PropTypes for type checking

### Component Guidelines
- Keep components small and focused
- Use custom hooks for complex logic
- Implement proper error boundaries
- Add loading states for async operations

## 📞 Support

### Common Issues
- **Canvas not loading**: Check Fabric.js import
- **AI not working**: Verify backend connection
- **Tools not responding**: Check event handlers
- **Performance issues**: Reduce canvas complexity

### Debugging
- Use React DevTools
- Check browser console for errors
- Monitor network requests
- Use Fabric.js debugging tools