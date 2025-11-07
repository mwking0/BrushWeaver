import React, { useState } from 'react'

const Toolbar = ({
  activeTool,
  setActiveTool,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  onClear,
  onAddShape,
  onDownload,
  onLoadImageAsBackground,
  onLoadImageAsObject,
  onRemoveBackground,
  onSetPresetSize,
  onSetCanvasDimensions,
  canvasSize,
  useCustomSize,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  showGrid,
  onToggleGrid,
  onSaveProject,
  onLoadProject,
  onDeleteSelected,
  hasSelection,
  onMergeObjects,
  onUngroupObject,
  hasMultipleSelection,
  hasGroupSelected
}) => {
  const tools = [
    { id: 'pen', name: 'Pen', icon: '✏️', shortcut: 'P' },
    { id: 'select', name: 'Select', icon: '👆', shortcut: 'V' },
    { id: 'eraser', name: 'Eraser', icon: '🧽', shortcut: 'E' },
    { id: 'text', name: 'Text', icon: '📝', shortcut: 'T' },
    { id: 'line', name: 'Line', icon: '📏', shortcut: 'L' }
  ]

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ]

  const shapes = [
    { id: 'rectangle', name: 'Rectangle', icon: '⬜' },
    { id: 'circle', name: 'Circle', icon: '⭕' },
    { id: 'triangle', name: 'Triangle', icon: '🔺' }
  ]

  const [customWidth, setCustomWidth] = useState(canvasSize.width)
  const [customHeight, setCustomHeight] = useState(canvasSize.height)
  const [showCustomInputs, setShowCustomInputs] = useState(false)

  const presets = [
    { id: 'responsive', name: 'Responsive', size: 'Auto' },
    { id: 'square-small', name: 'Square S', size: '500×500' },
    { id: 'square-medium', name: 'Square M', size: '800×800' },
    { id: 'square-large', name: 'Square L', size: '1200×1200' },
    { id: 'landscape-hd', name: 'HD', size: '1280×720' },
    { id: 'landscape-fhd', name: 'Full HD', size: '1920×1080' },
    { id: 'portrait-a4', name: 'A4', size: '595×842' },
    { id: 'social-instagram', name: 'Instagram', size: '1080×1080' },
    { id: 'social-facebook', name: 'Facebook', size: '1200×630' }
  ]

  const handleCustomSize = () => {
    onSetCanvasDimensions(customWidth, customHeight)
    setShowCustomInputs(false)
  }

  return (
    <div className="toolbar">
      <div className="tool-group">
        <h3>🛠️ Tools</h3>
        <div className="tool-buttons">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => setActiveTool(tool.id)}
              title={`${tool.name} (${tool.shortcut})`}
            >
              <span>{tool.icon}</span> {tool.name}
            </button>
          ))}
          <button
            className="tool-btn"
            onClick={onDeleteSelected}
            disabled={!hasSelection}
            style={{ 
              background: hasSelection ? '#ff6b6b' : '#6c757d', 
              color: 'white',
              opacity: hasSelection ? 1 : 0.6
            }}
            title="Delete (Del)"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="tool-group">
        <h3>↩️ History</h3>
        <div className="tool-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="tool-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            style={{ flex: 1, opacity: canUndo ? 1 : 0.5 }}
          >
            ↶ Undo
          </button>
          <button
            className="tool-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            style={{ flex: 1, opacity: canRedo ? 1 : 0.5 }}
          >
            ↷ Redo
          </button>
        </div>
      </div>



      <div className="tool-group">
        <h3>🔍 View</h3>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
          Zoom: {Math.round(zoom * 100)}%
        </div>
        <div className="tool-buttons" style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
          <button
            className="tool-btn"
            onClick={onZoomOut}
            title="Zoom Out"
            style={{ flex: 1 }}
          >
            🔍-
          </button>
          <button
            className="tool-btn"
            onClick={onResetZoom}
            title="Reset Zoom (Ctrl+0)"
            style={{ flex: 1 }}
          >
            1:1
          </button>
          <button
            className="tool-btn"
            onClick={onZoomIn}
            title="Zoom In"
            style={{ flex: 1 }}
          >
            🔍+
          </button>
        </div>
        <button
          className={`tool-btn ${showGrid ? 'active' : ''}`}
          onClick={onToggleGrid}
          title="Toggle Grid (G)"
          style={{ width: '100%' }}
        >
          📐 {showGrid ? 'Hide' : 'Show'} Grid
        </button>
      </div>

      <div className="tool-group">
        <h3>🎨 Colors</h3>
        <div className="color-picker">
          {colors.map(color => (
            <div
              key={color}
              className={`color-option ${brushColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setBrushColor(color)}
              title={color}
            />
          ))}
        </div>
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          style={{ width: '100%', marginTop: '0.5rem', height: '30px' }}
        />
      </div>

      <div className="tool-group">
        <div className="slider-group">
          <label>Brush Size: {brushSize}px</label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="slider"
          />
        </div>
      </div>

      <div className="tool-group">
        <h3>⬜ Shapes</h3>
        <div className="tool-buttons">
          {shapes.map(shape => (
            <button
              key={shape.id}
              className="tool-btn"
              onClick={() => onAddShape(shape.id)}
              title={shape.name}
            >
              <span>{shape.icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tool-group">
        <h3>📐 Canvas Size</h3>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
          Current: {canvasSize.width}×{canvasSize.height}
        </div>
        <select 
          onChange={(e) => onSetPresetSize(e.target.value)}
          className="tool-btn"
          style={{ width: '100%', marginBottom: '0.5rem' }}
          value={useCustomSize ? 'custom' : 'responsive'}
        >
          <option value="">Select Size...</option>
          {presets.map(preset => (
            <option key={preset.id} value={preset.id}>
              {preset.name} ({preset.size})
            </option>
          ))}
          <option value="custom">Custom Size</option>
        </select>
        
        {showCustomInputs && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              type="number"
              placeholder="Width"
              value={customWidth}
              onChange={(e) => setCustomWidth(parseInt(e.target.value) || 800)}
              className="tool-btn"
              style={{ width: '100%' }}
              min="100"
              max="4000"
            />
            <input
              type="number"
              placeholder="Height"
              value={customHeight}
              onChange={(e) => setCustomHeight(parseInt(e.target.value) || 600)}
              className="tool-btn"
              style={{ width: '100%' }}
              min="100"
              max="4000"
            />
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                className="tool-btn"
                onClick={handleCustomSize}
                style={{ flex: 1, background: '#28a745', color: 'white', fontSize: '0.7rem' }}
              >
                ✓ Apply
              </button>
              <button
                className="tool-btn"
                onClick={() => setShowCustomInputs(false)}
                style={{ flex: 1, background: '#6c757d', color: 'white', fontSize: '0.7rem' }}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
        
        <button
          className="tool-btn"
          onClick={() => setShowCustomInputs(!showCustomInputs)}
          style={{ 
            width: '100%', 
            background: showCustomInputs ? '#6c757d' : '#007bff', 
            color: 'white',
            marginTop: '0.5rem'
          }}
        >
          📐 Custom Size
        </button>
      </div>

      <div className="tool-group">
        <h3>🖼️ Images</h3>
        <div className="tool-buttons" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <label className="tool-btn" style={{ width: '100%', background: '#fd7e14', color: 'white', cursor: 'pointer', textAlign: 'center' }}>
            🖼️ Load Background
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onLoadImageAsBackground(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </label>
          <label className="tool-btn" style={{ width: '100%', background: '#20c997', color: 'white', cursor: 'pointer', textAlign: 'center' }}>
            📷 Add Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onLoadImageAsObject(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </label>
          <button
            className="tool-btn"
            onClick={onRemoveBackground}
            style={{ width: '100%', background: '#6c757d', color: 'white' }}
            title="Remove background image"
          >
            🗑️ Remove BG
          </button>
        </div>
      </div>

      <div className="tool-group">
        <h3>💾 Project</h3>
        <div className="tool-buttons" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <button
            className="tool-btn"
            onClick={onSaveProject}
            style={{ width: '100%', background: '#007bff', color: 'white' }}
            title="Save Project (Ctrl+S)"
          >
            💾 Save Project
          </button>
          <label className="tool-btn" style={{ width: '100%', background: '#6c757d', color: 'white', cursor: 'pointer', textAlign: 'center' }}>
            📁 Load Project
            <input
              type="file"
              accept=".json"
              onChange={(e) => onLoadProject(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="tool-group">
        <h3>📥 Export</h3>
        <div className="tool-buttons" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <button
            className="tool-btn"
            onClick={() => onDownload('png')}
            style={{ width: '100%', background: '#28a745', color: 'white' }}
            title="Download as PNG"
          >
            📥 PNG
          </button>
          <button
            className="tool-btn"
            onClick={() => onDownload('jpeg', 0.9)}
            style={{ width: '100%', background: '#17a2b8', color: 'white' }}
            title="Download as JPEG"
          >
            📥 JPEG
          </button>
          <button
            className="tool-btn"
            onClick={() => onDownload('svg')}
            style={{ width: '100%', background: '#6f42c1', color: 'white' }}
            title="Download as SVG"
          >
            📥 SVG
          </button>
        </div>
      </div>

      <div className="tool-group">
        <h3>🗑️ Actions</h3>
        <div className="tool-buttons" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <button
            className="tool-btn"
            onClick={onMergeObjects}
            disabled={!hasMultipleSelection}
            style={{ 
              width: '100%', 
              background: hasMultipleSelection ? '#17a2b8' : '#6c757d', 
              color: 'white',
              opacity: hasMultipleSelection ? 1 : 0.6
            }}
            title="Group Selected Objects (Ctrl+G)"
          >
            🔗 Group
          </button>
          <button
            className="tool-btn"
            onClick={onUngroupObject}
            disabled={!hasGroupSelected}
            style={{ 
              width: '100%', 
              background: hasGroupSelected ? '#ffc107' : '#6c757d', 
              color: hasGroupSelected ? '#000' : 'white',
              opacity: hasGroupSelected ? 1 : 0.6
            }}
            title="Ungroup Selected Group (Ctrl+Shift+G)"
          >
            🔓 Ungroup
          </button>
          <button
            className="tool-btn"
            onClick={onClear}
            style={{ width: '100%', background: '#dc3545', color: 'white' }}
            title="Clear entire canvas"
          >
            🗑️ Clear Canvas
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toolbar