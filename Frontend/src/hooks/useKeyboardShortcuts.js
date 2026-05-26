import { useEffect } from 'react'

/**
 * Registers all keyboard shortcuts for the drawing editor.
 */
export function useKeyboardShortcuts({
  canvas,
  showGrid,
  setShowGrid,
  setActiveTool,
  undo,
  redo,
  resetZoom,
  deleteSelectedObjects,
  mergeSelectedObjects,
  ungroupSelectedObject,
  saveProject,
  downloadCanvas,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isTypingInInput =
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.contentEditable === 'true' ||
        e.target.isContentEditable

      const isEditingCanvasText =
        canvas && canvas.getActiveObject()?.isEditing

      const isTyping = isTypingInInput || isEditingCanvasText

      // Always-available shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveProject?.()
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        downloadCanvas?.('jpeg', 0.9)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo?.()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo?.()
      }

      if (isTyping) return

      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowGrid(prev => !prev)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        resetZoom?.()
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvas) {
        e.preventDefault()
        deleteSelectedObjects?.()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey && canvas) {
        e.preventDefault()
        mergeSelectedObjects?.()
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G' && canvas) {
        e.preventDefault()
        ungroupSelectedObject?.()
      }

      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'p': e.preventDefault(); setActiveTool('pen'); break
          case 'v': e.preventDefault(); setActiveTool('select'); break
          case 'e': e.preventDefault(); setActiveTool('eraser'); break
          case 't': e.preventDefault(); setActiveTool('text'); break
          case 'l': e.preventDefault(); setActiveTool('line'); break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    canvas, showGrid, setShowGrid, setActiveTool,
    undo, redo, resetZoom, deleteSelectedObjects,
    mergeSelectedObjects, ungroupSelectedObject,
    saveProject, downloadCanvas,
  ])
}
