import React, { useState } from 'react'

const Toolbar = ({
  activeTool, setActiveTool,
  brushColor, setBrushColor,
  brushSize, setBrushSize,
  onClear, onAddShape, onDownload,
  onLoadImageAsBackground, onLoadImageAsObject,
  onRemoveBackground, onRemoveObjectBackground,
  onSetPresetSize, onSetCanvasDimensions,
  canvasSize, useCustomSize,
  onUndo, onRedo, canUndo, canRedo,
  zoom, onZoomIn, onZoomOut, onResetZoom,
  showGrid, onToggleGrid,
  onSaveProject, onLoadProject,
  onDeleteSelected, hasSelection,
  onMergeObjects, onUngroupObject,
  hasMultipleSelection, hasGroupSelected
}) => {
  const [customWidth, setCustomWidth] = useState(canvasSize?.width || 1200)
  const [customHeight, setCustomHeight] = useState(canvasSize?.height || 800)
  const [showCustomInputs, setShowCustomInputs] = useState(false)

  const tools = [
    { id: 'pen',    label: '✏️ Pen',    shortcut: 'P' },
    { id: 'select', label: '👆 Select', shortcut: 'V' },
    { id: 'eraser', label: '🧽 Eraser', shortcut: 'E' },
    { id: 'text',   label: '📝 Text',   shortcut: 'T' },
    { id: 'line',   label: '📏 Line',   shortcut: 'L' },
  ]

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB',
  ]

  const presets = [
    { id: 'square-small',    label: 'Square S',  size: '500×500'   },
    { id: 'square-medium',   label: 'Square M',  size: '800×800'   },
    { id: 'square-large',    label: 'Square L',  size: '1200×1200' },
    { id: 'landscape-hd',    label: 'HD',        size: '1280×720'  },
    { id: 'landscape-fhd',   label: 'Full HD',   size: '1920×1080' },
    { id: 'portrait-a4',     label: 'A4',        size: '595×842'   },
    { id: 'social-instagram',label: 'Instagram', size: '1080×1080' },
    { id: 'social-facebook', label: 'Facebook',  size: '1200×630'  },
  ]

  const handleCustomSize = () => {
    onSetCanvasDimensions(customWidth, customHeight)
    setShowCustomInputs(false)
  }

  // ── Shared section header ──────────────────────────────────────────────
  const SectionHeader = ({ label }) => (
    <div style={{
      fontSize: '0.65rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'rgba(255,255,255,0.35)',
      marginBottom: '0.5rem',
      marginTop: '0.25rem',
    }}>
      {label}
    </div>
  )

  // ── Compact button ─────────────────────────────────────────────────────
  const Btn = ({ onClick, disabled, active, color, children, title, fullWidth, style = {} }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`tool-btn${active ? ' active' : ''}`}
      style={{
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.4 : 1,
        background: color || undefined,
        color: color ? 'white' : undefined,
        border: color ? 'none' : undefined,
        fontSize: '0.82rem',
        padding: '0.45rem 0.6rem',
        ...style,
      }}
    >
      {children}
    </button>
  )

  return (
    <div className="toolbar" style={{ gap: '0' }}>

      {/* ── TOOLS ── */}
      <div className="tool-group" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader label="Tools" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
          {tools.map(t => (
            <Btn key={t.id} active={activeTool === t.id} onClick={() => setActiveTool(t.id)} title={`${t.label} (${t.shortcut})`}>
              {t.label}
            </Btn>
          ))}
          <Btn onClick={onDeleteSelected} disabled={!hasSelection} color={hasSelection ? '#ef4444' : undefined} title="Delete (Del)">
            🗑️ Delete
          </Btn>
          <Btn onClick={() => onRemoveObjectBackground?.()} disabled={!hasSelection} color={hasSelection ? '#e83e8c' : undefined} title="Remove background from selected">
            ✂️ Remove BG
          </Btn>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 0.75rem' }} />

      {/* ── HISTORY ── */}
      <div className="tool-group" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader label="History" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
          <Btn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">↶ Undo</Btn>
          <Btn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">↷ Redo</Btn>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 0.75rem' }} />

      {/* ── VIEW ── */}
      <div className="tool-group" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader label={`View · ${Math.round(zoom * 100)}%`} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <Btn onClick={onZoomOut} title="Zoom Out">🔍−</Btn>
          <Btn onClick={onResetZoom} title="Reset Zoom (Ctrl+0)">1:1</Btn>
          <Btn onClick={onZoomIn} title="Zoom In">🔍+</Btn>
        </div>
        <Btn fullWidth active={showGrid} onClick={onToggleGrid} title="Toggle Grid (G)">
          📐 {showGrid ? 'Hide Grid' : 'Show Grid'}
        </Btn>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 0.75rem' }} />

      {/* ── COLORS ── */}
      <div className="tool-group" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader label="Colors" />
        <div className="color-picker" style={{ marginBottom: '0.4rem' }}>
          {colors.map(c => (
            <div
              key={c}
              className={`color-option${brushColor === c ? ' active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setBrushColor(c)}
              title={c}
            />
          ))}
        </div>
        <input
          type="color"
          value={brushColor}
          onChange={e => setBrushColor(e.target.value)}
          style={{ width: '100%', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'none' }}
        />
      </div>

      {/* ── BRUSH SIZE ── */}
      <div className="tool-group" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader label={`Brush · ${brushSize}px`} />
        <input
          type="range" min="1" max="50"
          value={brushSize}
          onChange={e => setBrushSize(parseInt(e.target.value))}
          className="slider"
        />
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 0.75rem' }} />

      {/* ── SHAPES ── */}
      <div className="tool-group" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader label="Shapes" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
          <Btn onClick={() => onAddShape('rectangle')} title="Rectangle">⬜</Btn>
          <Btn onClick={() => onAddShape('circle')} title="Circle">⭕</Btn>
          <Btn onClick={() => onAddShape('triangle')} title="Triangle">🔺</Btn>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 0.75rem' }} />

      {/* ── CANVAS SIZE ── */}
      <div className="tool-group" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader label={`Canvas · ${canvasSize?.width}×${canvasSize?.height}`} />
        <select
          onChange={e => { if (e.target.value) onSetPresetSize(e.target.value) }}
          style={{
            width: '100%', marginBottom: '0.4rem',
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', borderRadius: '8px', padding: '0.45rem 0.6rem',
            fontSize: '0.82rem', cursor: 'pointer',
          }}
          defaultValue=""
        >
          <option value="" disabled>Select preset…</option>
          {presets.map(p => (
            <option key={p.id} value={p.id}>{p.label} ({p.size})</option>
          ))}
        </select>

        <Btn fullWidth onClick={() => setShowCustomInputs(v => !v)} style={{ marginBottom: showCustomInputs ? '0.4rem' : 0 }}>
          📐 Custom Size
        </Btn>

        {showCustomInputs && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              <input type="number" placeholder="W" value={customWidth}
                onChange={e => setCustomWidth(parseInt(e.target.value) || 800)}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px', padding: '0.4rem', fontSize: '0.82rem' }}
                min="100" max="4000"
              />
              <input type="number" placeholder="H" value={customHeight}
                onChange={e => setCustomHeight(parseInt(e.target.value) || 600)}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px', padding: '0.4rem', fontSize: '0.82rem' }}
                min="100" max="4000"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              <Btn onClick={handleCustomSize} color="#22c55e">✓ Apply</Btn>
              <Btn onClick={() => setShowCustomInputs(false)}>✕ Cancel</Btn>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 0.75rem' }} />

      {/* ── IMAGES ── */}
      <div className="tool-group" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader label="Images" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label className="tool-btn" style={{ width: '100%', background: '#f97316', color: 'white', cursor: 'pointer', textAlign: 'center', fontSize: '0.82rem', padding: '0.45rem 0.6rem', borderRadius: '8px', border: 'none' }}>
            🖼️ Load Background
            <input type="file" accept="image/*" onChange={e => onLoadImageAsBackground(e.target.files[0])} style={{ display: 'none' }} />
          </label>
          <label className="tool-btn" style={{ width: '100%', background: '#10b981', color: 'white', cursor: 'pointer', textAlign: 'center', fontSize: '0.82rem', padding: '0.45rem 0.6rem', borderRadius: '8px', border: 'none' }}>
            📷 Add Image
            <input type="file" accept="image/*" onChange={e => onLoadImageAsObject(e.target.files[0])} style={{ display: 'none' }} />
          </label>
          <Btn fullWidth onClick={onRemoveBackground} title="Remove background image">🗑️ Clear BG</Btn>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 0.75rem' }} />

      {/* ── OBJECTS ── */}
      <div className="tool-group" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader label="Objects" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
          <Btn onClick={onMergeObjects} disabled={!hasMultipleSelection} color={hasMultipleSelection ? '#0ea5e9' : undefined} title="Group (Ctrl+G)">🔗 Group</Btn>
          <Btn onClick={onUngroupObject} disabled={!hasGroupSelected} color={hasGroupSelected ? '#f59e0b' : undefined} style={{ color: hasGroupSelected ? '#000' : undefined }} title="Ungroup (Ctrl+Shift+G)">🔓 Ungroup</Btn>
          <Btn fullWidth onClick={onClear} color="#ef4444" title="Clear canvas" style={{ gridColumn: '1 / -1' }}>🗑️ Clear All</Btn>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 0.75rem' }} />

      {/* ── PROJECT ── */}
      <div className="tool-group" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader label="Project" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
          <Btn onClick={onSaveProject} color="#3b82f6" title="Save (Ctrl+S)">💾 Save</Btn>
          <label className="tool-btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', textAlign: 'center', fontSize: '0.82rem', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            📁 Load
            <input type="file" accept=".json" onChange={e => onLoadProject(e.target.files[0])} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 0.75rem' }} />

      {/* ── EXPORT ── */}
      <div className="tool-group">
        <SectionHeader label="Export" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
          <Btn onClick={() => onDownload('png')} color="#22c55e" title="PNG">📥 PNG</Btn>
          <Btn onClick={() => onDownload('jpeg', 0.9)} color="#0ea5e9" title="JPEG">📥 JPG</Btn>
          <Btn onClick={() => onDownload('svg')} color="#8b5cf6" title="SVG">📥 SVG</Btn>
        </div>
      </div>

    </div>
  )
}

export default Toolbar
