import React, { useState } from 'react'

const AIPanel = ({ onAIEdit, isLoading, canvasObjects, onBringToFront, onSendToBack, onBringForward, onSendBackward, onSelectObject, selectedObjectId, onReorderLayers }) => {
  const [prompt, setPrompt] = useState('')
  const [history, setHistory] = useState([])
  const [selectedStyle, setSelectedStyle] = useState('')
  const [favorites, setFavorites] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [processingMode, setProcessingMode] = useState('replace') // 'replace', 'layer', 'selection'
  const [draggedLayer, setDraggedLayer] = useState(null)
  const [dragOverLayer, setDragOverLayer] = useState(null)
  const [objectA, setObjectA] = useState('')
  const [objectB, setObjectB] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    let finalPrompt = prompt.trim()
    
    // Add style preset if selected
    if (selectedStyle) {
      const style = stylePresets.find(s => s.id === selectedStyle)
      if (style) {
        finalPrompt = `${finalPrompt}, ${style.prompt}`
      }
    }

    // Add to history
    const newEntry = {
      id: Date.now(),
      prompt: finalPrompt,
      originalPrompt: prompt.trim(),
      style: selectedStyle,
      timestamp: new Date().toLocaleTimeString()
    }
    setHistory(prev => [newEntry, ...prev.slice(0, 9)]) // Keep last 10

    // Send to AI with processing mode
    try {
      await onAIEdit(finalPrompt, processingMode)
    } catch (error) {
      console.error('AI Edit failed:', error)
      // Don't clear the prompt if there was an error
      return
    }
    
    // Clear prompt after successful submission
    setPrompt('')
    setSelectedStyle('')
  }

  const useHistoryPrompt = (historyPrompt) => {
    setPrompt(historyPrompt)
  }

  const stylePresets = [
    { id: 'watercolor', name: 'Watercolor', prompt: 'watercolor painting style, soft edges, flowing colors' },
    { id: 'oil', name: 'Oil Painting', prompt: 'oil painting style, thick brushstrokes, rich textures' },
    { id: 'sketch', name: 'Pencil Sketch', prompt: 'pencil sketch style, hand-drawn, artistic lines' },
    { id: 'cartoon', name: 'Cartoon', prompt: 'cartoon style, bold colors, simplified shapes' },
    { id: 'realistic', name: 'Photorealistic', prompt: 'photorealistic style, detailed, lifelike' },
    { id: 'anime', name: 'Anime', prompt: 'anime art style, vibrant colors, clean lines' }
  ]

  const promptCategories = {
    'Style': [
      "Make it more colorful and vibrant",
      "Convert to a cartoon style",
      "Apply a watercolor effect",
      "Make it look like a sketch",
      "Add anime-style features"
    ],
    'Effects': [
      "Add shadows and depth",
      "Add lighting effects",
      "Add glow effects",
      "Make it look 3D",
      "Add motion blur"
    ],
    'Environment': [
      "Add a background landscape",
      "Place in a fantasy setting",
      "Add a cityscape background",
      "Set in outer space",
      "Add weather effects"
    ],
    'Enhancement': [
      "Make it look more realistic",
      "Increase detail and texture",
      "Improve composition",
      "Enhance colors",
      "Add more contrast"
    ]
  }

  const addToFavorites = (promptText) => {
    if (!favorites.includes(promptText)) {
      setFavorites([...favorites, promptText])
    }
  }

  const removeFromFavorites = (promptText) => {
    setFavorites(favorites.filter(fav => fav !== promptText))
  }

  // Drag and drop handlers for layers
  const handleDragStart = (e, layerId) => {
    setDraggedLayer(layerId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, layerId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverLayer(layerId)
  }

  const handleDragLeave = () => {
    setDragOverLayer(null)
  }

  const handleDrop = (e, targetLayerId) => {
    e.preventDefault()
    
    if (draggedLayer && draggedLayer !== targetLayerId && onReorderLayers) {
      // Find indices
      const draggedIndex = canvasObjects.findIndex(obj => obj.id === draggedLayer)
      const targetIndex = canvasObjects.findIndex(obj => obj.id === targetLayerId)
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        onReorderLayers(draggedIndex, targetIndex)
      }
    }
    
    setDraggedLayer(null)
    setDragOverLayer(null)
  }

  const handleDragEnd = () => {
    setDraggedLayer(null)
    setDragOverLayer(null)
  }

  const handlePlaceAbove = () => {
    if (!objectA || !objectB || !onReorderLayers) return
    
    const indexA = canvasObjects.findIndex(obj => obj.id === objectA)
    const indexB = canvasObjects.findIndex(obj => obj.id === objectB)
    
    if (indexA !== -1 && indexB !== -1) {
      // Place A above B (higher index = on top)
      const targetIndex = indexB > indexA ? indexB : indexB + 1
      onReorderLayers(indexA, targetIndex)
    }
  }

  const handlePlaceBelow = () => {
    if (!objectA || !objectB || !onReorderLayers) return
    
    const indexA = canvasObjects.findIndex(obj => obj.id === objectA)
    const indexB = canvasObjects.findIndex(obj => obj.id === objectB)
    
    if (indexA !== -1 && indexB !== -1) {
      // Place A below B (lower index = below)
      const targetIndex = indexB < indexA ? indexB : indexB
      onReorderLayers(indexA, targetIndex)
    }
  }

  return (
    <div className="ai-panel">
      <div className="tool-group">
        <h3>🤖 AI Weaver</h3>
        <form onSubmit={handleSubmit} className="prompt-section">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe how you want to weave your creation..."
            disabled={isLoading}
          />
          
          <div style={{ margin: '0.5rem 0' }}>
            <label style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem', display: 'block' }}>
              Style Preset (optional):
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '0.25rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">No style preset</option>
              {stylePresets.map(style => (
                <option key={style.id} value={style.id}>{style.name}</option>
              ))}
            </select>
          </div>

          <div style={{ margin: '0.5rem 0' }}>
            <label style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem', display: 'block' }}>
              Processing Mode:
            </label>
            <select
              value={processingMode}
              onChange={(e) => setProcessingMode(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '0.25rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="replace">Replace Canvas (flatten to single image)</option>
              <option value="layer">Add as Background Layer (keep drawings)</option>
              <option value="selection">Process Selected Object Only</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              className="ai-btn"
              disabled={!prompt.trim() || isLoading}
              style={{ flex: 1 }}
            >
              {isLoading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  Processing...
                </div>
              ) : (
                '🎨 Weave with AI'
              )}
            </button>
            {prompt.trim() && (
              <button
                type="button"
                onClick={() => addToFavorites(prompt.trim())}
                disabled={isLoading || favorites.includes(prompt.trim())}
                style={{ 
                  padding: '0.75rem', 
                  background: favorites.includes(prompt.trim()) ? '#6c757d' : '#ffc107',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                title="Add to favorites"
              >
                ⭐
              </button>
            )}
          </div>
        </form>
      </div>

      {favorites.length > 0 && (
        <div className="tool-group">
          <h3>⭐ Favorites</h3>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {favorites.map((favorite, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  margin: '0.25rem 0',
                  background: '#fff3cd',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}
              >
                <button
                  onClick={() => setPrompt(favorite)}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  title="Use this prompt"
                >
                  {favorite}
                </button>
                <button
                  onClick={() => removeFromFavorites(favorite)}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '2px',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.7rem'
                  }}
                  title="Remove from favorites"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tool-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3>💡 Quick Prompts</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: '#007bff'
            }}
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
        </div>
        
        {showAdvanced ? (
          Object.entries(promptCategories).map(([category, prompts]) => (
            <div key={category} style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                {category}
              </h4>
              <div>
                {prompts.map((suggestion, index) => (
                  <button
                    key={index}
                    className="tool-btn"
                    onClick={() => setPrompt(suggestion)}
                    disabled={isLoading}
                    style={{ 
                      width: '100%', 
                      marginBottom: '0.25rem', 
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      padding: '0.4rem 0.6rem'
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="tool-buttons">
            {Object.values(promptCategories).flat().slice(0, 6).map((suggestion, index) => (
              <button
                key={index}
                className="tool-btn"
                onClick={() => setPrompt(suggestion)}
                disabled={isLoading}
                style={{ width: '100%', marginBottom: '0.25rem', textAlign: 'left' }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="tool-group">
          <h3>📝 Recent Prompts</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {history.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding: '0.5rem',
                  margin: '0.25rem 0',
                  background: '#f8f9fa',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  border: '1px solid #e9ecef'
                }}
                onClick={() => useHistoryPrompt(entry.originalPrompt || entry.prompt)}
                title="Click to use this prompt"
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '0.25rem' 
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.7rem' }}>
                    {entry.timestamp}
                  </span>
                  {entry.style && (
                    <span style={{ 
                      background: '#007bff', 
                      color: 'white', 
                      padding: '0.1rem 0.3rem', 
                      borderRadius: '2px',
                      fontSize: '0.6rem'
                    }}>
                      {stylePresets.find(s => s.id === entry.style)?.name}
                    </span>
                  )}
                </div>
                <div>{entry.originalPrompt || entry.prompt}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {canvasObjects && canvasObjects.length > 1 && (
        <div className="tool-group">
          <h3>🔄 Layer Order</h3>
          <div style={{ 
            background: '#f8f9fa',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>
              Choose which object goes above the other:
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>
                  Object 1:
                </label>
                <select
                  value={objectA}
                  onChange={(e) => setObjectA(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem',
                    borderRadius: '3px',
                    border: '1px solid #ddd',
                    fontSize: '0.75rem'
                  }}
                >
                  <option value="">Select object...</option>
                  {canvasObjects.map((obj, index) => (
                    <option key={obj.id} value={obj.id}>
                      {obj.type === 'path' && '✏️ Drawing'}
                      {obj.type === 'rect' && '⬜ Rectangle'}
                      {obj.type === 'circle' && '⭕ Circle'}
                      {obj.type === 'triangle' && '🔺 Triangle'}
                      {obj.type === 'line' && '📏 Line'}
                      {obj.type === 'i-text' && '📝 Text'}
                      {obj.type === 'image' && '🖼️ Image'}
                      {obj.type === 'group' && '🔗 Group'}
                      {!['path', 'rect', 'circle', 'triangle', 'line', 'i-text', 'image', 'group'].includes(obj.type) && `📦 ${obj.type}`}
                      {' (Layer ' + (index + 1) + ')'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>
                  Object 2:
                </label>
                <select
                  value={objectB}
                  onChange={(e) => setObjectB(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem',
                    borderRadius: '3px',
                    border: '1px solid #ddd',
                    fontSize: '0.75rem'
                  }}
                >
                  <option value="">Select object...</option>
                  {canvasObjects.map((obj, index) => (
                    <option key={obj.id} value={obj.id}>
                      {obj.type === 'path' && '✏️ Drawing'}
                      {obj.type === 'rect' && '⬜ Rectangle'}
                      {obj.type === 'circle' && '⭕ Circle'}
                      {obj.type === 'triangle' && '🔺 Triangle'}
                      {obj.type === 'line' && '📏 Line'}
                      {obj.type === 'i-text' && '📝 Text'}
                      {obj.type === 'image' && '🖼️ Image'}
                      {obj.type === 'group' && '🔗 Group'}
                      {!['path', 'rect', 'circle', 'triangle', 'line', 'i-text', 'image', 'group'].includes(obj.type) && `📦 ${obj.type}`}
                      {' (Layer ' + (index + 1) + ')'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  onClick={handlePlaceAbove}
                  disabled={!objectA || !objectB || objectA === objectB}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: (!objectA || !objectB || objectA === objectB) ? '#e9ecef' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: (!objectA || !objectB || objectA === objectB) ? 'not-allowed' : 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    opacity: (!objectA || !objectB || objectA === objectB) ? 0.6 : 1
                  }}
                  title="Place Object 1 above Object 2"
                >
                  ⬆️ 1 Above 2
                </button>
                <button
                  onClick={handlePlaceBelow}
                  disabled={!objectA || !objectB || objectA === objectB}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: (!objectA || !objectB || objectA === objectB) ? '#e9ecef' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: (!objectA || !objectB || objectA === objectB) ? 'not-allowed' : 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    opacity: (!objectA || !objectB || objectA === objectB) ? 0.6 : 1
                  }}
                  title="Place Object 1 below Object 2"
                >
                  ⬇️ 1 Below 2
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {canvasObjects && canvasObjects.length > 0 && (
        <div className="tool-group" style={{ padding: 0, background: '#2b2b2b', borderRadius: '4px' }}>
          {/* Photoshop-style header */}
          <div style={{ 
            background: '#3a3a3a',
            padding: '0.5rem',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, color: '#b8b8b8', fontSize: '0.85rem', fontWeight: 'normal' }}>Layers</h3>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button style={{ 
                background: 'none', 
                border: 'none', 
                color: '#b8b8b8', 
                cursor: 'pointer',
                padding: '0.25rem',
                fontSize: '0.9rem'
              }} title="Add new layer">
                ➕
              </button>
              <button style={{ 
                background: 'none', 
                border: 'none', 
                color: '#b8b8b8', 
                cursor: 'pointer',
                padding: '0.25rem',
                fontSize: '0.9rem'
              }} title="Delete layer">
                🗑️
              </button>
            </div>
          </div>

          {/* Blend mode and opacity controls */}
          <div style={{ 
            background: '#2b2b2b',
            padding: '0.5rem',
            borderBottom: '1px solid #1a1a1a'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <select style={{
                flex: 1,
                background: '#3a3a3a',
                border: '1px solid #1a1a1a',
                color: '#b8b8b8',
                padding: '0.25rem',
                fontSize: '0.7rem',
                borderRadius: '2px'
              }}>
                <option>Normal</option>
                <option>Multiply</option>
                <option>Screen</option>
                <option>Overlay</option>
              </select>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                color: '#b8b8b8',
                fontSize: '0.7rem'
              }}>
                <span>Opacity:</span>
                <span>100%</span>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem',
              color: '#b8b8b8',
              fontSize: '0.7rem',
              alignItems: 'center'
            }}>
              <span>Lock:</span>
              <button style={{ background: '#3a3a3a', border: 'none', color: '#b8b8b8', padding: '0.2rem 0.4rem', cursor: 'pointer', borderRadius: '2px' }}>🔒</button>
              <button style={{ background: '#3a3a3a', border: 'none', color: '#b8b8b8', padding: '0.2rem 0.4rem', cursor: 'pointer', borderRadius: '2px' }}>✏️</button>
              <button style={{ background: '#3a3a3a', border: 'none', color: '#b8b8b8', padding: '0.2rem 0.4rem', cursor: 'pointer', borderRadius: '2px' }}>🎨</button>
            </div>
          </div>

          {/* Layers list */}
          <div style={{ 
            maxHeight: '350px', 
            overflowY: 'auto', 
            background: '#2b2b2b',
            padding: '0.25rem'
          }}>
            {canvasObjects.slice().reverse().map((obj, reverseIndex) => {
              const actualIndex = canvasObjects.length - 1 - reverseIndex
              const isSelected = obj.id === selectedObjectId
              const isDragging = draggedLayer === obj.id
              const isDragOver = dragOverLayer === obj.id
              
              return (
                <div
                  key={obj.id || actualIndex}
                  draggable
                  onDragStart={(e) => handleDragStart(e, obj.id)}
                  onDragOver={(e) => handleDragOver(e, obj.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, obj.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelectObject && onSelectObject(obj.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem',
                    margin: '1px 0',
                    background: isSelected ? '#4a7bb7' : isDragOver ? '#3a3a3a' : '#2b2b2b',
                    border: isSelected ? '1px solid #5a8bc7' : '1px solid transparent',
                    cursor: isDragging ? 'grabbing' : 'pointer',
                    fontSize: '0.75rem',
                    color: '#d4d4d4',
                    opacity: isDragging ? 0.5 : 1,
                    transition: 'background 0.1s ease'
                  }}
                >
                  {/* Eye icon for visibility */}
                  <div style={{ 
                    width: '20px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: '#b8b8b8',
                    cursor: 'pointer'
                  }} title="Toggle visibility">
                    👁️
                  </div>

                  {/* Thumbnail */}
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    background: 'linear-gradient(45deg, #555 25%, transparent 25%, transparent 75%, #555 75%, #555), linear-gradient(45deg, #555 25%, #3a3a3a 25%, #3a3a3a 75%, #555 75%, #555)',
                    backgroundSize: '10px 10px',
                    backgroundPosition: '0 0, 5px 5px',
                    border: '1px solid #1a1a1a',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                    boxShadow: 'inset 0 0 3px rgba(0,0,0,0.5)'
                  }}>
                    {obj.type === 'path' && '✏️'}
                    {obj.type === 'rect' && '⬜'}
                    {obj.type === 'circle' && '⭕'}
                    {obj.type === 'triangle' && '🔺'}
                    {obj.type === 'line' && '📏'}
                    {obj.type === 'i-text' && '📝'}
                    {obj.type === 'image' && '🖼️'}
                    {obj.type === 'group' && '📁'}
                    {!['path', 'rect', 'circle', 'triangle', 'line', 'i-text', 'image', 'group'].includes(obj.type) && '📦'}
                  </div>

                  {/* Layer name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: isSelected ? '600' : 'normal',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: isSelected ? '#ffffff' : '#d4d4d4'
                    }}>
                      {obj.type === 'path' && 'Drawing'}
                      {obj.type === 'rect' && 'Rectangle'}
                      {obj.type === 'circle' && 'Circle'}
                      {obj.type === 'triangle' && 'Triangle'}
                      {obj.type === 'line' && 'Line'}
                      {obj.type === 'i-text' && 'Text'}
                      {obj.type === 'image' && 'Image'}
                      {obj.type === 'group' && 'Group'}
                      {!['path', 'rect', 'circle', 'triangle', 'line', 'i-text', 'image', 'group'].includes(obj.type) && obj.type}
                    </div>
                  </div>

                  {/* Effects indicator (optional) */}
                  {obj.type === 'group' && (
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: '#888',
                      fontStyle: 'italic'
                    }}>
                      fx
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="tool-group">
        <h3>💡 Tips</h3>
        <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>
          <p>• <strong>Be specific:</strong> "bright red sunset" vs "colorful"</p>
          <p>• <strong>Style keywords:</strong> "watercolor", "oil painting", "sketch"</p>
          <p>• <strong>Processing modes:</strong></p>
          <p style={{ marginLeft: '10px' }}>- <strong>Replace:</strong> Flattens canvas to single image</p>
          <p style={{ marginLeft: '10px' }}>- <strong>Layer:</strong> Keeps your drawings, adds AI as background</p>
          <p style={{ marginLeft: '10px' }}>- <strong>Selection:</strong> Processes only selected object</p>
          <p>• <strong>Shortcuts:</strong> Ctrl+Z (undo), G (grid), Ctrl+0 (reset zoom)</p>
        </div>
      </div>
    </div>
  )
}

export default AIPanel