import React, { useState } from 'react'
import { LAYER_TYPE_ICONS, LAYER_TYPE_NAMES } from '../../utils/constants'

const SECTION_HEADER_STYLE = {
  fontSize: '0.65rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.35)',
  marginBottom: '0.5rem',
}

const DIVIDER = (
  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.75rem 0' }} />
)

const stylePresets = [
  { id: 'watercolor', name: 'Watercolor' },
  { id: 'oil',        name: 'Oil Painting' },
  { id: 'sketch',     name: 'Sketch' },
  { id: 'cartoon',    name: 'Cartoon' },
  { id: 'realistic',  name: 'Photorealistic' },
  { id: 'anime',      name: 'Anime' },
]

const quickPrompts = [
  'Make it more colorful',
  'Convert to cartoon style',
  'Apply watercolor effect',
  'Add shadows and depth',
  'Make it look 3D',
  'Add a background landscape',
]

const getLayerIcon = (type) => {
  const icons = {
    path: '✏️', rect: '▭', circle: '○', triangle: '△',
    line: '—', 'i-text': 'T', image: '⬚', group: '⊞',
  }
  return icons[type] || '◻'
}

const getLayerName = (obj) => {
  if (obj.name) return obj.name
  return LAYER_TYPE_NAMES[obj.type] || obj.type
}

const AIPanel = ({
  onAIEdit, isLoading,
  canvasObjects,
  onSelectObject, selectedObjectId,
  onReorderLayers, onRenameLayer,
  onToggleObjectLock,
  onToggleObjectVisibility,
}) => {
  const [prompt, setPrompt]               = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [processingMode, setProcessingMode] = useState('replace')
  const [history, setHistory]             = useState([])
  const [draggedLayer, setDraggedLayer]   = useState(null)
  const [dragOverLayer, setDragOverLayer] = useState(null)
  const [editingId, setEditingId]         = useState(null)
  const [editingName, setEditingName]     = useState('')

  // ── AI submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    const styleObj = stylePresets.find(s => s.id === selectedStyle)
    const finalPrompt = styleObj
      ? `${prompt.trim()}, ${styleObj.name.toLowerCase()} style`
      : prompt.trim()

    setHistory(prev => [
      { id: Date.now(), text: prompt.trim(), time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9),
    ])

    try {
      await onAIEdit(finalPrompt, processingMode)
      setPrompt('')
      setSelectedStyle('')
    } catch {}
  }

  // ── Layer drag & drop ────────────────────────────────────────────────────
  const onDragStart = (e, id) => { setDraggedLayer(id); e.dataTransfer.effectAllowed = 'move' }
  const onDragOver  = (e, id) => { e.preventDefault(); setDragOverLayer(id) }
  const onDragLeave = ()      => setDragOverLayer(null)
  const onDrop      = (e, targetId) => {
    e.preventDefault()
    if (draggedLayer && draggedLayer !== targetId && onReorderLayers) {
      const from = canvasObjects.findIndex(o => o.id === draggedLayer)
      const to   = canvasObjects.findIndex(o => o.id === targetId)
      if (from !== -1 && to !== -1) onReorderLayers(from, to)
    }
    setDraggedLayer(null)
    setDragOverLayer(null)
  }

  // ── Layer rename ─────────────────────────────────────────────────────────
  const startRename  = (obj) => { setEditingId(obj.id); setEditingName(getLayerName(obj)) }
  const finishRename = () => {
    if (editingId && editingName.trim() && onRenameLayer) onRenameLayer(editingId, editingName.trim())
    setEditingId(null); setEditingName('')
  }

  // ── Shared select style ──────────────────────────────────────────────────
  const selectStyle = {
    width: '100%',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: '8px',
    padding: '0.45rem 0.6rem',
    fontSize: '0.82rem',
    cursor: 'pointer',
  }

  return (
    <div className="ai-panel" style={{ gap: 0 }}>

      {/* ── AI WEAVER ── */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={SECTION_HEADER_STYLE}>✨ AI Weaver</div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe what you want to create…"
            disabled={isLoading}
            rows={3}
            style={{
              width: '100%', resize: 'vertical',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '0.6rem',
              color: 'white', fontSize: '0.85rem',
              fontFamily: 'inherit', marginBottom: '0.5rem',
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} style={selectStyle} disabled={isLoading}>
              <option value="">No style</option>
              {stylePresets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={processingMode} onChange={e => setProcessingMode(e.target.value)} style={selectStyle} disabled={isLoading}>
              <option value="replace">Replace canvas</option>
              <option value="layer">Add as layer</option>
              <option value="selection">Selected only</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="ai-btn"
          >
            {isLoading
              ? <><div className="spinner" />Processing…</>
              : '✨ Weave with AI'
            }
          </button>
        </form>
      </div>

      {DIVIDER}

      {/* ── QUICK PROMPTS ── */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={SECTION_HEADER_STYLE}>Quick Prompts</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              className="tool-btn"
              onClick={() => setPrompt(p)}
              disabled={isLoading}
              style={{ textAlign: 'left', fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {DIVIDER}

      {/* ── LAYERS ── */}
      <div>
        <div style={{ ...SECTION_HEADER_STYLE, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Layers ({canvasObjects?.length || 0})</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '320px', overflowY: 'auto' }}>
          {canvasObjects && canvasObjects.length > 0
            ? canvasObjects.slice().reverse().map((obj, ri) => {
                const isSelected = obj.id === selectedObjectId
                const isDragging = draggedLayer === obj.id
                const isDragOver = dragOverLayer === obj.id

                return (
                  <div
                    key={obj.id || ri}
                    draggable={!obj.isLocked}
                    onDragStart={e => !obj.isLocked && onDragStart(e, obj.id)}
                    onDragOver={e => onDragOver(e, obj.id)}
                    onDragLeave={onDragLeave}
                    onDrop={e => onDrop(e, obj.id)}
                    onClick={() => onSelectObject?.(obj.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      cursor: obj.isLocked ? 'not-allowed' : 'pointer',
                      opacity: isDragging ? 0.4 : (obj.isVisible === false ? 0.4 : 1),
                      background: isSelected
                        ? 'rgba(139, 92, 246, 0.25)'
                        : isDragOver
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.06)'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Type icon */}
                    <span style={{
                      width: '22px', height: '22px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isSelected ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: isSelected ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                      flexShrink: 0,
                      fontWeight: 700,
                    }}>
                      {getLayerIcon(obj.type)}
                    </span>

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {editingId === obj.id ? (
                        <input
                          autoFocus
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onBlur={finishRename}
                          onKeyDown={e => { if (e.key === 'Enter') finishRename(); if (e.key === 'Escape') { setEditingId(null) } }}
                          onClick={e => e.stopPropagation()}
                          style={{
                            width: '100%', background: 'rgba(0,0,0,0.4)',
                            border: '1px solid rgba(139,92,246,0.6)',
                            borderRadius: '4px', padding: '0.15rem 0.4rem',
                            color: 'white', fontSize: '0.82rem', outline: 'none',
                          }}
                        />
                      ) : (
                        <span
                          onDoubleClick={e => { e.stopPropagation(); startRename(obj) }}
                          style={{
                            fontSize: '0.82rem',
                            color: isSelected ? '#e9d5ff' : 'rgba(255,255,255,0.75)',
                            fontWeight: isSelected ? 600 : 400,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            display: 'block',
                            fontStyle: obj.isLocked ? 'italic' : 'normal',
                          }}
                          title="Double-click to rename"
                        >
                          {getLayerName(obj)}
                        </span>
                      )}
                    </div>

                    {/* Visibility button */}
                    <button
                      onClick={e => { e.stopPropagation(); onToggleObjectVisibility?.(obj.id) }}
                      title={obj.isVisible !== false ? 'Hide' : 'Show'}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0.15rem', fontSize: '0.7rem', lineHeight: 1,
                        color: obj.isVisible !== false ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)',
                        flexShrink: 0,
                      }}
                    >
                      {obj.isVisible !== false ? '◉' : '○'}
                    </button>

                    {/* Lock button */}
                    <button
                      onClick={e => { e.stopPropagation(); onToggleObjectLock?.(obj.id) }}
                      title={obj.isLocked ? 'Unlock' : 'Lock'}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0.15rem', fontSize: '0.7rem', lineHeight: 1,
                        color: obj.isLocked ? '#f59e0b' : 'rgba(255,255,255,0.25)',
                        flexShrink: 0,
                      }}
                    >
                      {obj.isLocked ? '🔒' : '🔓'}
                    </button>
                  </div>
                )
              })
            : (
              <div style={{
                padding: '2rem 1rem', textAlign: 'center',
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '8px', color: 'rgba(255,255,255,0.25)',
                fontSize: '0.82rem',
              }}>
                No objects yet.<br />Start drawing to see layers.
              </div>
            )
          }
        </div>
      </div>

      {DIVIDER}

      {/* ── HISTORY ── */}
      {history.length > 0 && (
        <div>
          <div style={SECTION_HEADER_STYLE}>Recent Prompts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '150px', overflowY: 'auto' }}>
            {history.map(entry => (
              <button
                key={entry.id}
                onClick={() => setPrompt(entry.text)}
                className="tool-btn"
                style={{ textAlign: 'left', fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
              >
                <span style={{ color: 'rgba(255,255,255,0.35)', marginRight: '0.4rem', fontSize: '0.7rem' }}>{entry.time}</span>
                {entry.text}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default AIPanel
