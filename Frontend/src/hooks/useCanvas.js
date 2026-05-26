import { useState, useRef, useEffect, useCallback } from 'react'
import { fabric } from 'fabric'

/**
 * Initializes and manages the Fabric.js canvas lifecycle,
 * zoom, pan, grid, and canvas sizing.
 */
export function useCanvas({ brushColor, brushSize, onReady, onObjectEvent }) {
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  const [customDimensions, setCustomDimensions] = useState({ width: 800, height: 600 })
  const [useCustomSize, setUseCustomSize] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)
  const [hasMultipleSelection, setHasMultipleSelection] = useState(false)
  const [hasGroupSelected, setHasGroupSelected] = useState(false)
  const panStartRef = useRef({ x: 0, y: 0 })
  const blobUrlsRef = useRef([])

  // --- Canvas sizing ---
  useEffect(() => {
    const updateSize = () => {
      try {
        if (useCustomSize) {
          setCanvasSize({ width: customDimensions.width, height: customDimensions.height })
        } else {
          // Default document size — not the container size
          setCanvasSize({ width: 1200, height: 800 })
        }
        setIsCanvasReady(true)
      } catch {
        setCanvasSize({ width: 1200, height: 800 })
        setIsCanvasReady(true)
      }
    }

    setTimeout(updateSize, 100)
  }, [useCustomSize, customDimensions])

  // --- Canvas init ---
  useEffect(() => {
    if (!canvasRef.current || !isCanvasReady) return

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: 'white',
      selectionKey: 'ctrlKey',
      uniScaleKey: 'shiftKey',
    })

    fabricCanvas.isDrawingMode = true
    fabricCanvas.freeDrawingBrush.width = brushSize
    fabricCanvas.freeDrawingBrush.color = brushColor

    // Zoom
    fabricCanvas.on('mouse:wheel', (opt) => {
      let z = fabricCanvas.getZoom()
      z *= 0.999 ** opt.e.deltaY
      z = Math.min(Math.max(z, 0.01), 20)
      fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, z)
      setZoom(z)
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    // Pan
    fabricCanvas.on('mouse:down', (opt) => {
      if (opt.e.altKey) {
        setIsPanning(true)
        panStartRef.current = { x: opt.e.clientX, y: opt.e.clientY }
        fabricCanvas.selection = false
        fabricCanvas.defaultCursor = 'grabbing'
      }
    })
    fabricCanvas.on('mouse:move', (opt) => {
      if (isPanning) {
        const vpt = fabricCanvas.viewportTransform
        vpt[4] += opt.e.clientX - panStartRef.current.x
        vpt[5] += opt.e.clientY - panStartRef.current.y
        fabricCanvas.requestRenderAll()
        panStartRef.current = { x: opt.e.clientX, y: opt.e.clientY }
      }
    })
    fabricCanvas.on('mouse:up', () => {
      if (isPanning) {
        setIsPanning(false)
        fabricCanvas.defaultCursor = 'default'
      }
    })

    // Selection tracking
    fabricCanvas.on('selection:created', (e) => {
      setHasSelection(true)
      setHasMultipleSelection(e.selected?.length > 1)
      const obj = fabricCanvas.getActiveObject()
      setHasGroupSelected(obj?.type === 'group')
    })
    fabricCanvas.on('selection:updated', (e) => {
      setHasSelection(true)
      setHasMultipleSelection(e.selected?.length > 1)
      const obj = fabricCanvas.getActiveObject()
      setHasGroupSelected(obj?.type === 'group')
    })
    fabricCanvas.on('selection:cleared', () => {
      setHasSelection(false)
      setHasMultipleSelection(false)
      setHasGroupSelected(false)
    })

    // Ctrl+click multi-select
    fabricCanvas.on('mouse:down', (options) => {
      if (!options.target) return
      const e = options.e
      if (!(e.ctrlKey || e.metaKey) || !fabricCanvas.selection) return

      const clicked = options.target
      const active = fabricCanvas.getActiveObject()
      if (!active) return

      if (active.type === 'activeSelection') {
        const objs = active.getObjects()
        if (objs.includes(clicked)) {
          active.removeWithUpdate(clicked)
          fabricCanvas.discardActiveObject()
          if (objs.length === 2) {
            fabricCanvas.setActiveObject(objs.find(o => o !== clicked))
          } else if (objs.length > 2) {
            fabricCanvas.setActiveObject(
              new fabric.ActiveSelection(objs.filter(o => o !== clicked), { canvas: fabricCanvas })
            )
          }
        } else {
          active.addWithUpdate(clicked)
        }
      } else if (active !== clicked) {
        fabricCanvas.setActiveObject(
          new fabric.ActiveSelection([active, clicked], { canvas: fabricCanvas })
        )
      }
      fabricCanvas.requestRenderAll()
    })

    // Forward object events to parent
    const objectEvents = ['path:created', 'object:added', 'object:removed', 'object:modified', 'object:moved', 'object:scaled', 'object:rotated', 'text:changed']
    objectEvents.forEach(ev => fabricCanvas.on(ev, () => onObjectEvent?.(fabricCanvas, ev)))

    setCanvas(fabricCanvas)
    onReady?.(fabricCanvas)

    return () => {
      blobUrlsRef.current.forEach(url => { try { URL.revokeObjectURL(url) } catch {} })
      blobUrlsRef.current = []
      fabricCanvas.off()
      fabricCanvas.getObjects().forEach(obj => obj.dispose?.())
      fabricCanvas.clear()
      fabricCanvas.dispose()
    }
  }, [isCanvasReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync canvas size when dimensions change
  useEffect(() => {
    if (canvas && canvasSize) {
      canvas.setDimensions({ width: canvasSize.width, height: canvasSize.height })
      canvas.renderAll()
    }
  }, [canvas, canvasSize])

  // --- Zoom controls ---
  const zoomIn = useCallback(() => {
    if (!canvas) return
    const z = Math.min(zoom * 1.2, 20)
    canvas.setZoom(z); setZoom(z); canvas.renderAll()
  }, [canvas, zoom])

  const zoomOut = useCallback(() => {
    if (!canvas) return
    const z = Math.max(zoom / 1.2, 0.01)
    canvas.setZoom(z); setZoom(z); canvas.renderAll()
  }, [canvas, zoom])

  const resetZoom = useCallback(() => {
    if (!canvas) return
    canvas.setZoom(1); setZoom(1); canvas.renderAll()
  }, [canvas])

  // --- Grid ---
  useEffect(() => {
    if (!canvas) return
    canvas.getObjects().filter(o => o.excludeFromExport).forEach(o => canvas.remove(o))

    if (showGrid) {
      const gridSize = 20 * zoom
      const lines = []
      for (let i = 0; i <= canvas.width; i += gridSize) {
        lines.push(new fabric.Line([i, 0, i, canvas.height], { stroke: '#ddd', strokeWidth: 1, selectable: false, evented: false }))
      }
      for (let i = 0; i <= canvas.height; i += gridSize) {
        lines.push(new fabric.Line([0, i, canvas.width, i], { stroke: '#ddd', strokeWidth: 1, selectable: false, evented: false }))
      }
      const group = new fabric.Group(lines, { selectable: false, evented: false, excludeFromExport: true })
      canvas.add(group)
      canvas.sendToBack(group)
    }
    canvas.renderAll()
  }, [canvas, showGrid, zoom])

  // --- Canvas size presets ---
  const setPresetSize = useCallback((preset) => {
    const presets = {
      'responsive': null,
      'square-small': { width: 500, height: 500 },
      'square-medium': { width: 800, height: 800 },
      'square-large': { width: 1200, height: 1200 },
      'landscape-hd': { width: 1280, height: 720 },
      'landscape-fhd': { width: 1920, height: 1080 },
      'portrait-a4': { width: 595, height: 842 },
      'portrait-letter': { width: 612, height: 792 },
      'social-instagram': { width: 1080, height: 1080 },
      'social-facebook': { width: 1200, height: 630 },
      'social-twitter': { width: 1024, height: 512 },
    }
    const p = presets[preset]
    if (p === null) { setUseCustomSize(false) }
    else if (p) { setCustomDimensions(p); setUseCustomSize(true) }
  }, [])

  const setCanvasDimensions = useCallback((width, height) => {
    setCustomDimensions({ width, height })
    setUseCustomSize(true)
  }, [])

  return {
    canvasRef,
    canvas,
    canvasSize,
    isCanvasReady,
    useCustomSize,
    zoom,
    showGrid,
    setShowGrid,
    isPanning,
    hasSelection,
    hasMultipleSelection,
    hasGroupSelected,
    blobUrlsRef,
    zoomIn,
    zoomOut,
    resetZoom,
    setPresetSize,
    setCanvasDimensions,
  }
}
