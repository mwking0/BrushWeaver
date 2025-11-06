import React, { useState } from 'react'

const AIPanel = ({ onAIEdit, isLoading }) => {
  const [prompt, setPrompt] = useState('')
  const [history, setHistory] = useState([])
  const [selectedStyle, setSelectedStyle] = useState('')
  const [favorites, setFavorites] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)

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

    // Send to AI
    await onAIEdit(finalPrompt)
    
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

      <div className="tool-group">
        <h3>💡 Tips</h3>
        <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>
          <p>• <strong>Be specific:</strong> "bright red sunset" vs "colorful"</p>
          <p>• <strong>Style keywords:</strong> "watercolor", "oil painting", "sketch"</p>
          <p>• <strong>Add elements:</strong> "add mountains in background"</p>
          <p>• <strong>Lighting:</strong> "soft lighting", "dramatic shadows"</p>
          <p>• <strong>Shortcuts:</strong> Ctrl+Z (undo), G (grid), Ctrl+0 (reset zoom)</p>
        </div>
      </div>
    </div>
  )
}

export default AIPanel