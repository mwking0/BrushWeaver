import React, { useEffect, useRef, useState } from 'react'

const BACKDROP_STYLE = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  zIndex: 999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const MODAL_STYLE = {
  background: '#1a1a1a',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '1.5rem',
  width: 'min(520px, 92vw)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  color: 'white',
  zIndex: 1000,
}

const HEADER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.75rem',
}

const TITLE_STYLE = {
  margin: 0,
  fontSize: '1.05rem',
  fontWeight: 700,
  letterSpacing: '0.01em',
}

const SUBTITLE_STYLE = {
  margin: '0 0 1rem',
  fontSize: '0.82rem',
  color: 'rgba(255, 255, 255, 0.55)',
}

const TEXTAREA_STYLE = {
  width: '100%',
  minHeight: '110px',
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '0.7rem',
  color: 'white',
  fontSize: '0.9rem',
  resize: 'vertical',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const ERROR_STYLE = {
  marginTop: '0.7rem',
  padding: '0.55rem 0.7rem',
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.35)',
  borderRadius: '6px',
  color: '#fca5a5',
  fontSize: '0.82rem',
}

const ACTIONS_STYLE = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.5rem',
  marginTop: '1rem',
}

const CLOSE_BTN_STYLE = {
  background: 'transparent',
  border: 'none',
  color: 'rgba(255, 255, 255, 0.55)',
  fontSize: '1.2rem',
  cursor: 'pointer',
  lineHeight: 1,
  padding: '0.2rem 0.4rem',
}

const SPINNER_STYLE = {
  display: 'inline-block',
  width: '0.85rem',
  height: '0.85rem',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTopColor: 'white',
  borderRadius: '50%',
  marginRight: '0.45rem',
  animation: 'gen-spin 0.7s linear infinite',
  verticalAlign: '-2px',
}

const GenerateModal = ({ isOpen, onClose, onGenerate, isLoading, error }) => {
  const [prompt, setPrompt] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setPrompt('')
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  const trimmed = prompt.trim()
  const canSubmit = trimmed.length > 0 && !isLoading

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    if (!canSubmit) return
    onGenerate?.(trimmed)
  }

  const handleBackdropClick = () => {
    if (!isLoading) onClose?.()
  }

  return (
    <div style={BACKDROP_STYLE} onClick={handleBackdropClick}>
      <style>{`@keyframes gen-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={MODAL_STYLE} onClick={(e) => e.stopPropagation()}>
        <div style={HEADER_STYLE}>
          <h2 style={TITLE_STYLE}>🪄 Generate Image</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{ ...CLOSE_BTN_STYLE, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            title="Close"
          >
            ✕
          </button>
        </div>
        <p style={SUBTITLE_STYLE}>
          Describe the image you want. Costs 1 credit.
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A watercolor dragon flying over a mountain at sunrise…"
            disabled={isLoading}
            style={TEXTAREA_STYLE}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e)
            }}
          />
          {error && <div style={ERROR_STYLE}>{error}</div>}
          <div style={ACTIONS_STYLE}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="tool-btn"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="tool-btn"
              style={{
                padding: '0.5rem 1.1rem',
                fontSize: '0.85rem',
                background: canSubmit ? '#8b5cf6' : 'rgba(139, 92, 246, 0.4)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {isLoading && <span style={SPINNER_STYLE} />}
              {isLoading ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GenerateModal
