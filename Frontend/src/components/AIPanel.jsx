import React, { useState } from 'react'

const AIPanel = ({ onAIEdit, isLoading, canvasObjects, onBringToFront, onSendToBack, onBringForward, onSendBackward, onSelectObject, selectedObjectId, onReorderLayers, onRenameLayer, onLockObject, onUnlockObject, onToggleObjectLock }) => {
  const [prompt, setPrompt] = useState('')
  const [history, setHistory] = useState([])
  const [selectedStyle, setSelectedStyle] = useState('')
  const [favorites, setFavorites] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [processingMode, setProcessingMode] = useState('replace') // 'replace', 'layer', 'selection'
  const [draggedLayer, setDraggedLayer] = useState(null)
  const [dragOverLayer, setDragOverLayer] = useState(null)
  const [editingLayerId, setEditingLayerId] = useState(null)
  const [editingLayerName, setEditingLayerName] = useState('')

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
      // Find indices in the original canvas order
      const draggedIndex = canvasObjects.findIndex(obj => obj.id === draggedLayer)
      const targetIndex = canvasObjects.findIndex(obj => obj.id === targetLayerId)
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Call reorder with the actual canvas indices
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

  // Rename layer handlers
  const startRenaming = (obj) => {
    setEditingLayerId(obj.id)
    setEditingLayerName(obj.name || getDefaultLayerName(obj.type))
  }

  const finishRenaming = () => {
    if (editingLayerId && editingLayerName.trim() && onRenameLayer) {
      onRenameLayer(editingLayerId, editingLayerName.trim())
    }
    setEditingLayerId(null)
    setEditingLayerName('')
  }

  const cancelRenaming = () => {
    setEditingLayerId(null)
    setEditingLayerName('')
  }

  const getDefaultLayerName = (type) => {
    const names = {
      'path': 'Drawing',
      'rect': 'Rectangle',
      'circle': 'Circle',
      'triangle': 'Triangle',
      'line': 'Line',
      'i-text': 'Text',
      'image': 'Image',
      'group': 'Group'
    }
    return names[type] || type
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

      <div className="tool-group" style={{ 
        padding: 0, 
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', 
        borderRadius: '12px',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
          {/* Layers header */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '12px 12px 0 0'
          }}>
            <h3 style={{ 
              margin: 0, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '0.95rem', 
              fontWeight: '700',
              letterSpacing: '0.02em'
            }}>🎨 Layers</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ 
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', 
                border: '1px solid rgba(102, 126, 234, 0.2)', 
                color: '#667eea', 
                cursor: 'pointer',
                padding: '0.4rem 0.6rem',
                fontSize: '0.85rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
              }} title="Add new layer">
                ➕
              </button>
              <button style={{ 
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                color: '#ef4444', 
                cursor: 'pointer',
                padding: '0.4rem 0.6rem',
                fontSize: '0.85rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
              }} title="Delete layer">
                🗑️
              </button>
            </div>
          </div>

          {/* Layers list */}
          <div style={{ 
            maxHeight: '350px', 
            overflowY: 'auto', 
            background: 'linear-gradient(145deg, #fafbfc 0%, #f1f5f9 100%)',
            padding: '0.75rem',
            borderRadius: '0 0 12px 12px'
          }}>
            {canvasObjects && canvasObjects.length > 0 && canvasObjects.slice().reverse().map((obj, reverseIndex) => {
              const actualIndex = canvasObjects.length - 1 - reverseIndex
              const isSelected = obj.id === selectedObjectId
              const isDragging = draggedLayer === obj.id
              const isDragOver = dragOverLayer === obj.id
              
              return (
                <div
                  key={obj.id || actualIndex}
                  draggable={!obj.isLocked}
                  onDragStart={(e) => !obj.isLocked && handleDragStart(e, obj.id)}
                  onDragOver={(e) => handleDragOver(e, obj.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, obj.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelectObject && onSelectObject(obj.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    margin: '0.5rem 0',
                    background: isSelected 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : isDragOver 
                        ? 'linear-gradient(145deg, #e2e8f0 0%, #cbd5e0 100%)'
                        : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                    border: isSelected 
                      ? '2px solid rgba(102, 126, 234, 0.3)' 
                      : '1px solid rgba(102, 126, 234, 0.1)',
                    borderRadius: '10px',
                    cursor: obj.isLocked 
                      ? 'not-allowed' 
                      : isDragging 
                        ? 'grabbing' 
                        : 'pointer',
                    fontSize: '0.85rem',
                    color: isSelected ? '#ffffff' : '#374151',
                    opacity: isDragging ? 0.5 : 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isSelected 
                      ? '0 8px 25px rgba(102, 126, 234, 0.3)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transform: isSelected ? 'translateY(-1px)' : 'none'
                  }}
                >
                  {/* Eye icon for visibility */}
                  <div style={{ 
                    width: '24px',
                    textAlign: 'center',
                    fontSize: '1rem',
                    color: isSelected ? '#ffffff' : '#667eea',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }} title="Toggle visibility">
                    👁️
                  </div>

                  {/* Thumbnail */}
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: isSelected
                      ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)'
                      : obj.isLocked
                        ? 'linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)'
                        : 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)',
                    border: `2px solid ${
                      isSelected 
                        ? 'rgba(255, 255, 255, 0.3)' 
                        : obj.isLocked 
                          ? '#f59e0b' 
                          : 'rgba(102, 126, 234, 0.1)'
                    }`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                    boxShadow: isSelected 
                      ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
                      : obj.isLocked
                        ? '0 2px 8px rgba(245, 158, 11, 0.2)'
                        : '0 2px 6px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    opacity: obj.isLocked ? 0.8 : 1,
                    position: 'relative'
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
                    
                    {/* Lock overlay indicator */}
                    {obj.isLocked && (
                      <div style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '16px',
                        height: '16px',
                        background: '#f59e0b',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6rem',
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                      }}>
                        🔒
                      </div>
                    )}
                  </div>

                  {/* Layer name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingLayerId === obj.id ? (
                      <input
                        type="text"
                        value={editingLayerName}
                        onChange={(e) => setEditingLayerName(e.target.value)}
                        onBlur={finishRenaming}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishRenaming()
                          if (e.key === 'Escape') cancelRenaming()
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          border: '2px solid #667eea',
                          borderRadius: '4px',
                          background: 'white',
                          color: '#374151',
                          outline: 'none'
                        }}
                      />
                    ) : (
                      <div 
                        style={{ 
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: isSelected ? '#ffffff' : '#374151',
                          letterSpacing: '0.01em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          startRenaming(obj)
                        }}
                        title="Double-click to rename"
                      >
                        <span style={{ 
                          flex: 1, 
                          minWidth: 0, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          opacity: obj.isLocked ? 0.7 : 1,
                          fontStyle: obj.isLocked ? 'italic' : 'normal'
                        }}>
                          {obj.isLocked && '🔒 '}
                          {obj.name || (obj.type === 'path' && 'Drawing') ||
                           (obj.type === 'rect' && 'Rectangle') ||
                           (obj.type === 'circle' && 'Circle') ||
                           (obj.type === 'triangle' && 'Triangle') ||
                           (obj.type === 'line' && 'Line') ||
                           (obj.type === 'i-text' && 'Text') ||
                           (obj.type === 'image' && 'Image') ||
                           (obj.type === 'group' && 'Group') ||
                           obj.type}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleObjectLock && onToggleObjectLock(obj.id)
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            fontSize: '0.75rem',
                            color: obj.isLocked 
                              ? (isSelected ? '#fbbf24' : '#f59e0b') 
                              : (isSelected ? 'rgba(255, 255, 255, 0.8)' : '#667eea'),
                            opacity: obj.isLocked ? 1 : 0.7,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = 1}
                          onMouseLeave={(e) => e.target.style.opacity = obj.isLocked ? 1 : 0.7}
                          title={obj.isLocked ? "Unlock object" : "Lock object"}
                        >
                          {obj.isLocked ? '🔒' : '🔓'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startRenaming(obj)
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            fontSize: '0.75rem',
                            color: isSelected ? 'rgba(255, 255, 255, 0.8)' : '#667eea',
                            opacity: 0.7,
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = 1}
                          onMouseLeave={(e) => e.target.style.opacity = 0.7}
                          title="Rename layer"
                        >
                          🏷️
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Effects indicator (optional) */}
                  {obj.type === 'group' && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: isSelected ? 'rgba(255, 255, 255, 0.8)' : '#667eea',
                      fontStyle: 'italic',
                      fontWeight: '600',
                      padding: '0.25rem 0.5rem',
                      background: isSelected 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'rgba(102, 126, 234, 0.1)',
                      borderRadius: '6px'
                    }}>
                      fx
                    </div>
                  )}
                </div>
              )
            })}
            {(!canvasObjects || canvasObjects.length === 0) && (
              <div style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '10px',
                border: '2px dashed rgba(102, 126, 234, 0.2)',
                margin: '0.5rem'
              }}>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.2))'
                }}>🎨</div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.5rem'
                }}>No objects on canvas</div>
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: '#6b7280',
                  fontWeight: '500'
                }}>Start drawing to see layers appear here</div>
              </div>
            )}
          </div>
      </div>

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