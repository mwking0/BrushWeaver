import { useState, useRef, useCallback } from 'react'

/**
 * Manages undo/redo history for the Fabric.js canvas.
 */
export function useHistory() {
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(-1)
  const historyRef = useRef([])
  const historyStepRef = useRef(-1)
  const saveTimeoutRef = useRef(null)

  // Keep refs in sync so callbacks always see latest values
  const syncRefs = useCallback((h, s) => {
    historyRef.current = h
    historyStepRef.current = s
  }, [])

  const saveState = useCallback((canvas) => {
    if (!canvas || canvas._isUndoRedo) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(() => {
      const currentState = JSON.stringify(canvas.toJSON())
      const currentHistory = historyRef.current
      const currentStep = historyStepRef.current

      if (currentHistory.length > 0 && currentHistory[currentStep] === currentState) return

      const newHistory = [...currentHistory.slice(0, currentStep + 1), currentState]

      if (newHistory.length > 50) {
        newHistory.shift()
        setHistory(newHistory)
        setHistoryStep(49)
        syncRefs(newHistory, 49)
      } else {
        setHistory(newHistory)
        setHistoryStep(newHistory.length - 1)
        syncRefs(newHistory, newHistory.length - 1)
      }
    }, 100)
  }, [syncRefs])

  const undo = useCallback((canvas, onDone) => {
    const step = historyStepRef.current
    const hist = historyRef.current

    if (step <= 0 || !canvas) return

    const newStep = step - 1
    canvas._isUndoRedo = true
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    canvas.loadFromJSON(hist[newStep], () => {
      canvas.renderAll()
      setHistoryStep(newStep)
      syncRefs(hist, newStep)
      setTimeout(() => { canvas._isUndoRedo = false }, 100)
      onDone?.()
    })
  }, [syncRefs])

  const redo = useCallback((canvas, onDone) => {
    const step = historyStepRef.current
    const hist = historyRef.current

    if (step >= hist.length - 1 || !canvas) return

    const newStep = step + 1
    canvas._isUndoRedo = true
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    canvas.loadFromJSON(hist[newStep], () => {
      canvas.renderAll()
      setHistoryStep(newStep)
      syncRefs(hist, newStep)
      setTimeout(() => { canvas._isUndoRedo = false }, 100)
      onDone?.()
    })
  }, [syncRefs])

  const initHistory = useCallback((canvas) => {
    const initialState = JSON.stringify(canvas.toJSON())
    setHistory([initialState])
    setHistoryStep(0)
    syncRefs([initialState], 0)
  }, [syncRefs])

  const clearSaveTimeout = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
  }, [])

  return {
    history,
    historyStep,
    saveState,
    undo,
    redo,
    initHistory,
    clearSaveTimeout,
    canUndo: historyStep > 0,
    canRedo: historyStep < history.length - 1,
  }
}
