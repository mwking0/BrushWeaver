import React, { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import Toolbar from './Toolbar'
import AIPanel from './AIPanel'



const DrawingEditor = () => {
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState(null)
  const [activeTool, setActiveTool] = useState('pen')
  const [brushColor, setBrushColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [isErasing, setIsErasing] = useState(false)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  const [customDimensions, setCustomDimensions] = useState({ width: 800, height: 600 })
  const [useCustomSize, setUseCustomSize] = useState(false)
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(-1)
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [hasSelection, setHasSelection] = useState(false)
  const [hasMultipleSelection, setHasMultipleSelection] = useState(false)
  const [hasGroupSelected, setHasGroupSelected] = useState(false)
  const saveTimeoutRef = useRef(null)

  // Comprehensive cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      // Clean up canvas if it exists
      if (canvas) {
        // Remove all event listeners
        canvas.off()
        
        // Dispose of all objects to prevent memory leaks
        const objects = canvas.getObjects()
        objects.forEach(obj => {
          if (obj.dispose) {
            obj.dispose()
          }
        })
        
        // Clear all objects
        canvas.clear()
        
        // Dispose canvas
        canvas.dispose()
      }
      
      // Clear history to free memory
      setHistory([])
      setHistoryStep(-1)
    }
  }, [])

  // Periodic memory cleanup during long sessions
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (canvas) {
        // Force garbage collection of unused fabric objects
        canvas.renderAll()
        
        // Limit history size more aggressively if memory is a concern
        if (history.length > 30) {
          const trimmedHistory = history.slice(-25) // Keep last 25 states
          setHistory(trimmedHistory)
          setHistoryStep(Math.min(historyStep, trimmedHistory.length - 1))
        }
      }
    }, 60000) // Run every minute
    
    return () => clearInterval(cleanupInterval)
  }, [canvas, history, historyStep])

  // Calculate canvas size (responsive or custom)
  useEffect(() => {
    const updateCanvasSize = () => {
      try {
        if (useCustomSize) {
          // Use custom dimensions
          setCanvasSize({ 
            width: customDimensions.width, 
            height: customDimensions.height 
          })
        } else {
          // Calculate available space (subtract toolbar and AI panel widths + margins)
          const availableWidth = Math.max(window.innerWidth - 250 - 300 - 60, 400) // toolbar + AI panel + margins
          const availableHeight = Math.max(window.innerHeight - 120, 300) // header + margins
          
          setCanvasSize({ width: availableWidth, height: availableHeight })
        }
        setIsCanvasReady(true)
      } catch (error) {
        console.error('Error calculating canvas size:', error)
        // Fallback to default size
        setCanvasSize({ width: 800, height: 600 })
        setIsCanvasReady(true)
      }
    }

    // Use setTimeout to ensure DOM is ready
    setTimeout(updateCanvasSize, 100)
    
    // Only add resize listener if not using custom size
    if (!useCustomSize) {
      window.addEventListener('resize', updateCanvasSize)
    }
    
    return () => {
      if (!useCustomSize) {
        window.removeEventListener('resize', updateCanvasSize)
      }
      // Clear any pending timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [useCustomSize, customDimensions])

  // Add keyboard shortcuts and undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if user is typing in a text input or editing text on canvas
      const isTypingInInput = e.target.tagName === 'INPUT' || 
                             e.target.tagName === 'TEXTAREA' || 
                             e.target.contentEditable === 'true' ||
                             e.target.isContentEditable
      
      // Check if user is editing text on canvas (Fabric.js text editing)
      const isEditingCanvasText = canvas && canvas.getActiveObject() && 
                                  canvas.getActiveObject().isEditing
      
      // Don't process tool shortcuts if user is typing
      const isTyping = isTypingInInput || isEditingCanvasText
      
      // Ctrl+S or Cmd+S to save project (always available)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveProject()
      }
      // Ctrl+Shift+S or Cmd+Shift+S to show download options (always available)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        downloadCanvas('jpeg', 0.9)
      }
      // Undo: Ctrl+Z or Cmd+Z (always available)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Redo: Ctrl+Y or Cmd+Shift+Z (always available)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo()
      }
      
      // Exit early if user is typing to prevent tool shortcuts
      if (isTyping) {
        return
      }
      
      // Toggle grid: G (only when not typing)
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowGrid(!showGrid)
      }
      // Zoom shortcuts (only when not typing)
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        resetZoom()
      }
      // Delete selected objects (only when not typing)
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvas) {
        e.preventDefault()
        deleteSelectedObjects()
      }
      
      // Group objects: Ctrl+G (only when not typing)
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey && canvas) {
        e.preventDefault()
        mergeSelectedObjects()
      }
      
      // Ungroup objects: Ctrl+Shift+G (only when not typing)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G' && canvas) {
        e.preventDefault()
        ungroupSelectedObject()
      }
      
      // Tool shortcuts (only when not typing)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'p':
            e.preventDefault()
            setActiveTool('pen')
            break
          case 'v':
            e.preventDefault()
            setActiveTool('select')
            break
          case 'e':
            e.preventDefault()
            setActiveTool('eraser')
            break
          case 't':
            e.preventDefault()
            setActiveTool('text')
            break
          case 'l':
            e.preventDefault()
            setActiveTool('line')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canvas, showGrid, zoom])

  // Add drag and drop functionality
  useEffect(() => {
    if (!canvas) return

    const canvasElement = canvas.upperCanvasEl || canvas.lowerCanvasEl

    const handleDragOver = (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
      canvasElement.style.border = '2px dashed #007bff'
    }

    const handleDragLeave = (e) => {
      e.preventDefault()
      canvasElement.style.border = '1px solid #ddd'
    }

    const handleDrop = (e) => {
      e.preventDefault()
      canvasElement.style.border = '1px solid #ddd'
      
      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find(file => file.type.startsWith('image/'))
      
      if (imageFile) {
        // Default to background image, hold Shift for object
        if (e.shiftKey) {
          loadImageAsObject(imageFile)
        } else {
          loadImageAsBackground(imageFile)
        }
      }
    }

    if (canvasElement) {
      canvasElement.addEventListener('dragover', handleDragOver)
      canvasElement.addEventListener('dragleave', handleDragLeave)
      canvasElement.addEventListener('drop', handleDrop)

      return () => {
        canvasElement.removeEventListener('dragover', handleDragOver)
        canvasElement.removeEventListener('dragleave', handleDragLeave)
        canvasElement.removeEventListener('drop', handleDrop)
      }
    }
  }, [canvas])

  // Initialize canvas only once
  useEffect(() => {
    if (!canvasRef.current || !isCanvasReady) return

    try {
      // Initialize Fabric.js canvas with initial size
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: 'white'
      })

      // Set initial drawing mode
      fabricCanvas.isDrawingMode = true
      fabricCanvas.freeDrawingBrush.width = brushSize
      fabricCanvas.freeDrawingBrush.color = brushColor

      // Add zoom functionality
      fabricCanvas.on('mouse:wheel', handleMouseWheel)
      
      // Add pan functionality only when needed
      fabricCanvas.on('mouse:down', handleMouseDown)
      fabricCanvas.on('mouse:move', handleMouseMove)
      fabricCanvas.on('mouse:up', handleMouseUp)

      // Enhanced history event listeners - capture ALL actions
      fabricCanvas.on('path:created', () => {
        if (!fabricCanvas._isUndoRedo) {
          setTimeout(() => saveState(fabricCanvas), 50)
        }
      })
      
      fabricCanvas.on('object:added', () => {
        if (!fabricCanvas._isUndoRedo) {
          setTimeout(() => saveState(fabricCanvas), 50)
        }
      })
      
      fabricCanvas.on('object:removed', () => {
        if (!fabricCanvas._isUndoRedo) {
          setTimeout(() => saveState(fabricCanvas), 50)
        }
      })
      
      // Capture object modifications (moving, scaling, rotating)
      fabricCanvas.on('object:modified', () => {
        if (!fabricCanvas._isUndoRedo) {
          setTimeout(() => saveState(fabricCanvas), 50)
        }
      })
      
      // Capture object movements
      fabricCanvas.on('object:moved', () => {
        if (!fabricCanvas._isUndoRedo) {
          setTimeout(() => saveState(fabricCanvas), 50)
        }
      })
      
      // Capture object scaling
      fabricCanvas.on('object:scaled', () => {
        if (!fabricCanvas._isUndoRedo) {
          setTimeout(() => saveState(fabricCanvas), 50)
        }
      })
      
      // Capture object rotation
      fabricCanvas.on('object:rotated', () => {
        if (!fabricCanvas._isUndoRedo) {
          setTimeout(() => saveState(fabricCanvas), 50)
        }
      })
      
      // Capture text changes
      fabricCanvas.on('text:changed', () => {
        if (!fabricCanvas._isUndoRedo) {
          setTimeout(() => saveState(fabricCanvas), 50)
        }
      })

      // Save initial state for undo/redo
      setTimeout(() => {
        const initialState = JSON.stringify(fabricCanvas.toJSON())
        setHistory([initialState])
        setHistoryStep(0)
      }, 100)

      // Handle selection clearing when clicking on empty canvas
      fabricCanvas.on('mouse:down', (e) => {
        if (activeTool === 'select' && !e.target && !isPanning) {
          fabricCanvas.discardActiveObject()
          fabricCanvas.renderAll()
        }
      })
      
      // Save state when mouse is released after dragging objects
      fabricCanvas.on('mouse:up', () => {
        if (!fabricCanvas._isUndoRedo && fabricCanvas.getActiveObject()) {
          // Small delay to ensure the object has finished moving
          setTimeout(() => saveState(fabricCanvas), 100)
        }
      })

      // Track selection changes
      fabricCanvas.on('selection:created', (e) => {
        setHasSelection(true)
        setHasMultipleSelection(e.selected && e.selected.length > 1)
        const activeObj = fabricCanvas.getActiveObject()
        setHasGroupSelected(activeObj && activeObj.type === 'group')
      })
      fabricCanvas.on('selection:updated', (e) => {
        setHasSelection(true)
        setHasMultipleSelection(e.selected && e.selected.length > 1)
        const activeObj = fabricCanvas.getActiveObject()
        setHasGroupSelected(activeObj && activeObj.type === 'group')
      })
      fabricCanvas.on('selection:cleared', () => {
        setHasSelection(false)
        setHasMultipleSelection(false)
        setHasGroupSelected(false)
      })

      setCanvas(fabricCanvas)

      return () => {
        // Clear all timeouts
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }
        
        // Remove all Fabric.js event listeners
        fabricCanvas.off('path:created')
        fabricCanvas.off('object:added')
        fabricCanvas.off('object:removed')
        fabricCanvas.off('object:modified')
        fabricCanvas.off('selection:created')
        fabricCanvas.off('selection:updated')
        fabricCanvas.off('selection:cleared')
        fabricCanvas.off('mouse:down')
        fabricCanvas.off('mouse:move')
        fabricCanvas.off('mouse:up')
        
        // Dispose of the canvas
        fabricCanvas.dispose()
      }
    } catch (error) {
      console.error('Error initializing canvas:', error)
    }
  }, [isCanvasReady]) // Only initialize when ready

  // Update canvas size when dimensions change
  useEffect(() => {
    if (canvas && canvasSize) {
      canvas.setDimensions({
        width: canvasSize.width,
        height: canvasSize.height
      })
      canvas.renderAll()
    }
  }, [canvas, canvasSize])



  useEffect(() => {
    if (!canvas) return

    // Clear any active selections when switching tools
    canvas.discardActiveObject()
    canvas.renderAll()

    // Handle tool changes
    switch (activeTool) {
      case 'pen':
        canvas.isDrawingMode = true
        canvas.selection = false
        canvas.evented = true
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
        canvas.freeDrawingBrush.width = brushSize
        canvas.freeDrawingBrush.color = brushColor
        canvas.defaultCursor = 'crosshair'
        canvas.hoverCursor = 'crosshair'
        setIsErasing(false)
        break
      case 'select':
        canvas.isDrawingMode = false
        canvas.selection = true
        canvas.evented = true
        canvas.defaultCursor = 'default'
        canvas.hoverCursor = 'move'
        setIsErasing(false)
        break
      case 'eraser':
        canvas.isDrawingMode = false
        canvas.selection = false
        canvas.evented = false // Disable all Fabric.js events for custom eraser
        canvas.defaultCursor = 'crosshair'
        canvas.hoverCursor = 'crosshair'
        setIsErasing(true)
        break
      case 'text':
        canvas.isDrawingMode = false
        canvas.selection = true
        canvas.evented = true
        canvas.defaultCursor = 'text'
        canvas.hoverCursor = 'text'
        setIsErasing(false)
        break
      case 'line':
        canvas.isDrawingMode = false
        canvas.selection = true
        canvas.evented = true
        canvas.defaultCursor = 'crosshair'
        canvas.hoverCursor = 'crosshair'
        setIsErasing(false)
        break
      default:
        canvas.isDrawingMode = true
        canvas.selection = false
        canvas.evented = true
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
        canvas.freeDrawingBrush.width = brushSize
        canvas.freeDrawingBrush.color = brushColor
        canvas.defaultCursor = 'crosshair'
        canvas.hoverCursor = 'crosshair'
        setIsErasing(false)
    }
  }, [canvas, activeTool, brushSize, brushColor])

  // Handle pixel-based eraser functionality using native DOM events
  useEffect(() => {
    if (!canvas || !isErasing || !canvas.upperCanvasEl) return

    const canvasElement = canvas.upperCanvasEl

    const getCanvasCoordinates = (e) => {
      const rect = canvasElement.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    const eraseAtPoint = (x, y) => {
      // Get the underlying HTML5 canvas context
      const ctx = canvas.getContext()
      
      // Save current state
      ctx.save()
      
      // Set composite operation to erase pixels
      ctx.globalCompositeOperation = 'destination-out'
      
      // Draw a circle at the pointer location to erase pixels
      ctx.beginPath()
      ctx.arc(x, y, Math.max(brushSize * 1.5, 10) / 2, 0, 2 * Math.PI)
      ctx.fill()
      
      // Restore state
      ctx.restore()
      
      // Re-render the canvas
      canvas.renderAll()
    }

    const handleMouseDown = (e) => {
      e.preventDefault()
      setIsMouseDown(true)
      const coords = getCanvasCoordinates(e)
      eraseAtPoint(coords.x, coords.y)
    }

    const handleMouseMove = (e) => {
      if (!isMouseDown) return
      e.preventDefault()
      const coords = getCanvasCoordinates(e)
      eraseAtPoint(coords.x, coords.y)
    }

    const handleMouseUp = (e) => {
      e.preventDefault()
      setIsMouseDown(false)
    }

    // Add native DOM event listeners
    canvasElement.addEventListener('mousedown', handleMouseDown)
    canvasElement.addEventListener('mousemove', handleMouseMove)
    canvasElement.addEventListener('mouseup', handleMouseUp)
    canvasElement.addEventListener('mouseleave', handleMouseUp) // Stop erasing when mouse leaves canvas

    return () => {
      canvasElement.removeEventListener('mousedown', handleMouseDown)
      canvasElement.removeEventListener('mousemove', handleMouseMove)
      canvasElement.removeEventListener('mouseup', handleMouseUp)
      canvasElement.removeEventListener('mouseleave', handleMouseUp)
    }
  }, [canvas, isErasing, isMouseDown, brushSize])



  // Enhanced Undo/Redo functionality - Captures ALL actions
  const saveState = (canvasInstance = canvas) => {
    if (!canvasInstance || canvasInstance._isUndoRedo) return
    
    // Clear any pending save to debounce rapid changes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      const currentState = JSON.stringify(canvasInstance.toJSON())
      
      // Don't save if state hasn't changed
      if (history.length > 0 && history[historyStep] === currentState) {
        return
      }
      
      // Remove any future history if we're not at the end (after undo)
      const newHistory = [...history.slice(0, historyStep + 1), currentState]
      
      // Limit history to 50 states for comprehensive undo
      if (newHistory.length > 50) {
        newHistory.shift()
        setHistory(newHistory)
        setHistoryStep(49)
      } else {
        setHistory(newHistory)
        setHistoryStep(newHistory.length - 1)
      }
      
      console.log(`State saved. History length: ${newHistory.length}, Current step: ${newHistory.length - 1}`)
    }, 100) // Debounce rapid changes
  }

  const undo = () => {
    if (historyStep > 0 && canvas && history.length > 0) {
      const newStep = historyStep - 1
      const previousState = history[newStep]
      
      if (previousState) {
        console.log(`Undoing to step ${newStep}`)
        
        // Set flag to prevent saving during undo
        canvas._isUndoRedo = true
        
        // Clear any pending saves
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }
        
        canvas.loadFromJSON(previousState, () => {
          canvas.renderAll()
          setHistoryStep(newStep)
          
          // Clear the flag after restoration is complete
          setTimeout(() => {
            canvas._isUndoRedo = false
          }, 100)
        })
      }
    }
  }

  const redo = () => {
    if (historyStep < history.length - 1 && canvas && history.length > 0) {
      const newStep = historyStep + 1
      const nextState = history[newStep]
      
      if (nextState) {
        console.log(`Redoing to step ${newStep}`)
        
        // Set flag to prevent saving during redo
        canvas._isUndoRedo = true
        
        // Clear any pending saves
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }
        
        canvas.loadFromJSON(nextState, () => {
          canvas.renderAll()
          setHistoryStep(newStep)
          
          // Clear the flag after restoration is complete
          setTimeout(() => {
            canvas._isUndoRedo = false
          }, 100)
        })
      }
    }
  }

  // Zoom functionality
  const handleMouseWheel = (opt) => {
    const delta = opt.e.deltaY
    let newZoom = canvas.getZoom()
    newZoom *= 0.999 ** delta
    
    if (newZoom > 20) newZoom = 20
    if (newZoom < 0.01) newZoom = 0.01
    
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom)
    setZoom(newZoom)
    opt.e.preventDefault()
    opt.e.stopPropagation()
  }

  const zoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 20)
    canvas.setZoom(newZoom)
    setZoom(newZoom)
    canvas.renderAll()
  }

  const zoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.01)
    canvas.setZoom(newZoom)
    setZoom(newZoom)
    canvas.renderAll()
  }

  const resetZoom = () => {
    canvas.setZoom(1)
    canvas.absolutePan({ x: 0, y: 0 })
    setZoom(1)
    setCanvasOffset({ x: 0, y: 0 })
    canvas.renderAll()
  }

  // Pan functionality
  const handleMouseDown = (opt) => {
    if (opt.e.altKey || (activeTool === 'pan')) {
      setIsPanning(true)
      setPanStart({ x: opt.e.clientX, y: opt.e.clientY })
      canvas.selection = false
      canvas.defaultCursor = 'grabbing'
    }
  }

  const handleMouseMove = (opt) => {
    if (isPanning) {
      const e = opt.e
      const vpt = canvas.viewportTransform
      vpt[4] += e.clientX - panStart.x
      vpt[5] += e.clientY - panStart.y
      canvas.requestRenderAll()
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false)
      canvas.selection = activeTool === 'select'
      canvas.defaultCursor = 'default'
    }
  }

  // Grid functionality
  const drawGrid = () => {
    if (!canvas || !showGrid) return

    const gridSize = 20 * zoom
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    const gridGroup = new fabric.Group([], {
      selectable: false,
      evented: false,
      excludeFromExport: true
    })

    // Vertical lines
    for (let i = 0; i <= canvasWidth; i += gridSize) {
      const line = new fabric.Line([i, 0, i, canvasHeight], {
        stroke: '#ddd',
        strokeWidth: 1,
        selectable: false,
        evented: false
      })
      gridGroup.addWithUpdate(line)
    }

    // Horizontal lines
    for (let i = 0; i <= canvasHeight; i += gridSize) {
      const line = new fabric.Line([0, i, canvasWidth, i], {
        stroke: '#ddd',
        strokeWidth: 1,
        selectable: false,
        evented: false
      })
      gridGroup.addWithUpdate(line)
    }

    canvas.add(gridGroup)
    canvas.sendToBack(gridGroup)
  }

  // Update grid when zoom or grid visibility changes
  useEffect(() => {
    if (!canvas) return
    
    // Remove existing grid
    const objects = canvas.getObjects()
    objects.forEach(obj => {
      if (obj.excludeFromExport) {
        canvas.remove(obj)
      }
    })

    if (showGrid) {
      drawGrid()
    }
    
    canvas.renderAll()
  }, [canvas, showGrid, zoom])

  const clearCanvas = () => {
    if (canvas) {
      canvas.clear()
      canvas.backgroundColor = 'white'
      canvas.renderAll()
      setTimeout(() => saveState(canvas), 50)
    }
  }

  const deleteSelectedObjects = () => {
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    
    if (activeObjects.length > 0) {
      // Remove all selected objects
      activeObjects.forEach(obj => {
        canvas.remove(obj)
      })
      
      // Clear the selection
      canvas.discardActiveObject()
      canvas.renderAll()
      
      // Save state immediately for delete action
      setTimeout(() => saveState(canvas), 50)
    }
  }

  const mergeSelectedObjects = () => {
    if (!canvas) return

    const activeSelection = canvas.getActiveObject()
    
    if (!activeSelection || activeSelection.type !== 'activeSelection') {
      console.log('Need at least 2 objects to group')
      return
    }

    // Use the built-in toGroup method which properly handles the conversion
    const group = activeSelection.toGroup()
    
    canvas.requestRenderAll()

    // Update selection states
    setHasMultipleSelection(false)
    setHasGroupSelected(true)

    // Save state
    setTimeout(() => saveState(canvas), 10)
    
    console.log(`Grouped ${group._objects.length} objects into a single group`)
  }

  const ungroupSelectedObject = () => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    
    // Check if the selected object is a group
    if (!activeObject || activeObject.type !== 'group') {
      console.log('Please select a grouped object to ungroup')
      return
    }

    // Use the built-in toActiveSelection method which properly handles ungrouping
    const items = activeObject.toActiveSelection()
    
    canvas.requestRenderAll()

    // Update selection states
    setHasMultipleSelection(true)
    setHasGroupSelected(false)

    // Save state
    setTimeout(() => saveState(canvas), 10)
    
    console.log(`Ungrouped into ${items._objects.length} objects`)
  }

  const addShape = (shapeType) => {
    if (!canvas) return

    let shape
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    switch (shapeType) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: centerX - 50,
          top: centerY - 30,
          width: 100,
          height: 60,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2
        })
        break
      case 'circle':
        shape = new fabric.Circle({
          left: centerX - 40,
          top: centerY - 40,
          radius: 40,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2
        })
        break
      case 'triangle':
        shape = new fabric.Triangle({
          left: centerX - 40,
          top: centerY - 40,
          width: 80,
          height: 80,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2
        })
        break
    }

    if (shape) {
      canvas.add(shape)
      canvas.setActiveObject(shape)
      canvas.renderAll()
      setTimeout(() => saveState(canvas), 10)
    }
  }



  // Handle tool-specific actions
  useEffect(() => {
    if (!canvas) return

    const handleCanvasClick = (e) => {
      // Only handle clicks if not panning and not clicking on an existing object
      if (!isPanning && !e.target) {
        if (activeTool === 'text') {
          // Position text at click location
          const pointer = canvas.getPointer(e.e)
          const text = new fabric.IText('Click to edit text', {
            left: pointer.x - 75,
            top: pointer.y - 10,
            fontFamily: 'Arial',
            fontSize: 20,
            fill: brushColor,
            editable: true
          })
          canvas.add(text)
          canvas.setActiveObject(text)
          text.enterEditing()
          canvas.renderAll()
          setTimeout(() => saveState(canvas), 10)
        } else if (activeTool === 'line') {
          // Position line at click location
          const pointer = canvas.getPointer(e.e)
          const line = new fabric.Line([
            pointer.x - 50,
            pointer.y,
            pointer.x + 50,
            pointer.y
          ], {
            stroke: brushColor,
            strokeWidth: brushSize,
            selectable: true
          })
          canvas.add(line)
          canvas.setActiveObject(line)
          canvas.renderAll()
          setTimeout(() => saveState(canvas), 10)
        }
      }
    }

    if (activeTool === 'text' || activeTool === 'line') {
      canvas.on('mouse:down', handleCanvasClick)
    }

    return () => {
      canvas.off('mouse:down', handleCanvasClick)
    }
  }, [canvas, activeTool, brushColor, brushSize, isPanning])

  const exportCanvas = () => {
    if (!canvas) return null
    return canvas.toDataURL({
      format: 'png',
      quality: 1
    })
  }

  const downloadCanvas = (format = 'png', quality = 1) => {
    if (!canvas) return

    let dataURL
    let filename
    let mimeType

    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        dataURL = canvas.toDataURL('image/jpeg', quality)
        filename = `paintweaver_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`
        mimeType = 'image/jpeg'
        break
      case 'svg':
        dataURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(canvas.toSVG())}`
        filename = `paintweaver_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.svg`
        mimeType = 'image/svg+xml'
        break
      case 'png':
      default:
        dataURL = canvas.toDataURL('image/png', quality)
        filename = `paintweaver_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`
        mimeType = 'image/png'
        break
    }

    // Create download link
    const link = document.createElement('a')
    link.download = filename
    link.href = dataURL
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const loadImageAsBackground = (file) => {
    if (!canvas || !file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imgUrl = e.target.result
      
      fabric.Image.fromURL(imgUrl, (img) => {
        // Calculate scaling to fit canvas while maintaining aspect ratio
        const canvasWidth = canvas.width
        const canvasHeight = canvas.height
        const imgWidth = img.width
        const imgHeight = img.height
        
        const scaleX = canvasWidth / imgWidth
        const scaleY = canvasHeight / imgHeight
        const scale = Math.min(scaleX, scaleY) // Fit image within canvas
        
        // Center the image
        const scaledWidth = imgWidth * scale
        const scaledHeight = imgHeight * scale
        const left = (canvasWidth - scaledWidth) / 2
        const top = (canvasHeight - scaledHeight) / 2
        
        img.set({
          left: left,
          top: top,
          scaleX: scale,
          scaleY: scale,
          selectable: false, // Make background image non-selectable
          evented: false,    // Make it non-interactive
          excludeFromExport: false
        })
        
        // Set as background image
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas))
      })
    }
    
    reader.readAsDataURL(file)
  }

  const loadImageAsObject = (file) => {
    if (!canvas || !file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imgUrl = e.target.result
      
      fabric.Image.fromURL(imgUrl, (img) => {
        // Scale image to reasonable size
        const maxSize = Math.min(canvas.width, canvas.height) * 0.5
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        
        img.set({
          left: canvas.width / 2 - (img.width * scale) / 2,
          top: canvas.height / 2 - (img.height * scale) / 2,
          scaleX: scale,
          scaleY: scale
        })
        
        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
      })
    }
    
    reader.readAsDataURL(file)
  }

  const removeBackground = () => {
    if (canvas) {
      canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas))
      canvas.backgroundColor = 'white'
      canvas.renderAll()
    }
  }

  const setCanvasDimensions = (width, height) => {
    // Check if canvas has content
    const hasContent = canvas && (canvas.getObjects().length > 0 || canvas.backgroundImage)
    
    if (hasContent) {
      const confirmed = window.confirm(
        'Changing canvas size may affect your current drawing. Continue?'
      )
      if (!confirmed) return
    }

    setCustomDimensions({ width, height })
    setUseCustomSize(true)
  }

  const setPresetSize = (preset) => {
    if (!preset) return

    // Check if canvas has content
    const hasContent = canvas && (canvas.getObjects().length > 0 || canvas.backgroundImage)
    
    if (hasContent) {
      const confirmed = window.confirm(
        'Changing canvas size may affect your current drawing. Continue?'
      )
      if (!confirmed) return
    }

    const presets = {
      'responsive': { responsive: true },
      'square-small': { width: 500, height: 500 },
      'square-medium': { width: 800, height: 800 },
      'square-large': { width: 1200, height: 1200 },
      'landscape-hd': { width: 1280, height: 720 },
      'landscape-fhd': { width: 1920, height: 1080 },
      'portrait-a4': { width: 595, height: 842 },
      'portrait-letter': { width: 612, height: 792 },
      'social-instagram': { width: 1080, height: 1080 },
      'social-facebook': { width: 1200, height: 630 },
      'social-twitter': { width: 1024, height: 512 }
    }

    const selectedPreset = presets[preset]
    if (selectedPreset) {
      if (selectedPreset.responsive) {
        setUseCustomSize(false)
      } else {
        setCustomDimensions({ width: selectedPreset.width, height: selectedPreset.height })
        setUseCustomSize(true)
      }
    }
  }

  const saveProject = () => {
    if (!canvas) return

    const projectData = {
      canvas: canvas.toJSON(),
      metadata: {
        name: `PaintWeaver_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`,
        created: new Date().toISOString(),
        canvasSize: canvasSize
      }
    }

    const dataStr = JSON.stringify(projectData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    const objectUrl = URL.createObjectURL(dataBlob)
    link.href = objectUrl
    link.download = `${projectData.metadata.name}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the blob URL to prevent memory leak
    setTimeout(() => URL.revokeObjectURL(objectUrl), 100)
    URL.revokeObjectURL(link.href)
  }

  const loadProject = (file) => {
    if (!canvas || !file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target.result)
        
        // Load canvas data
        canvas.loadFromJSON(projectData.canvas, () => {
          canvas.renderAll()
          setTimeout(() => saveState(canvas), 100)
          
          // Restore canvas size if different
          if (projectData.metadata?.canvasSize) {
            const { width, height } = projectData.metadata.canvasSize
            if (width !== canvasSize.width || height !== canvasSize.height) {
              setCustomDimensions({ width, height })
              setUseCustomSize(true)
            }
          }
        })
      } catch (error) {
        console.error('Error loading project:', error)
        alert('Failed to load project file. Please check the file format.')
      }
    }
    
    reader.readAsText(file)
  }

  const handleAIEdit = async (prompt, mode = 'replace') => {
    if (!canvas || !prompt.trim()) return

    // Validate selection mode
    if (mode === 'selection') {
      const activeObjects = canvas.getActiveObjects()
      if (activeObjects.length === 0) {
        alert('Selection mode requires an object to be selected. Please select an object first or choose a different processing mode.')
        return
      }
      if (activeObjects.length > 1) {
        alert('Selection mode works with single objects only. Please select one object or choose a different processing mode.')
        return
      }
    }

    setIsLoading(true)
    try {
      // Check if user has selected specific objects
      const activeObjects = canvas.getActiveObjects()
      const hasSelection = activeObjects.length > 0
      
      let imageDataUrl
      
      if (mode === 'selection' && hasSelection && activeObjects.length === 1) {
        // Process only the selected object
        const selectedObject = activeObjects[0]
        if (selectedObject.type === 'image') {
          // Export just the selected image
          let tempCanvas = null
          try {
            tempCanvas = new fabric.Canvas()
            tempCanvas.setDimensions({
              width: Math.max(selectedObject.width * selectedObject.scaleX, 1),
              height: Math.max(selectedObject.height * selectedObject.scaleY, 1)
            })
            
            const clonedObject = fabric.util.object.clone(selectedObject)
            clonedObject.set({ left: 0, top: 0, scaleX: 1, scaleY: 1 })
            tempCanvas.add(clonedObject)
            
            imageDataUrl = tempCanvas.toDataURL('image/png')
          } finally {
            if (tempCanvas) {
              tempCanvas.dispose()
            }
          }
        } else {
          // For non-image objects, export entire canvas
          imageDataUrl = exportCanvas()
        }
      } else {
        // Export entire canvas as usual
        imageDataUrl = exportCanvas()
      }
      
      // Convert data URL to blob
      const response = await fetch(imageDataUrl)
      const blob = await response.blob()
      
      // Create form data
      const formData = new FormData()
      formData.append('file', blob, 'drawing.png')
      formData.append('prompt', prompt)
      formData.append('format', 'png')
      formData.append('use_ai', 'true')

      // Send to backend (adjust URL to match your backend)
      const editResponse = await fetch('http://localhost:8000/edit', {
        method: 'POST',
        body: formData
      })

      if (editResponse.ok) {
        const editedImageBlob = await editResponse.blob()
        console.log('📦 Received AI-edited image blob:', {
          size: editedImageBlob.size,
          type: editedImageBlob.type
        })
        
        const editedImageUrl = URL.createObjectURL(editedImageBlob)
        console.log('🔗 Created blob URL:', editedImageUrl)
        
        // Get AI analysis from response headers if available
        const aiAnalysis = editResponse.headers.get('X-AI-Analysis')
        if (aiAnalysis) {
          console.log('🤖 Gemini Analysis:', aiAnalysis)
        }
        
        // Load edited image back to canvas with better error handling
        fabric.Image.fromURL(editedImageUrl, 
          // Success callback
          (img) => {
            console.log('📸 Loading AI-edited image...', { 
              originalSize: { width: img.width, height: img.height },
              canvasSize: { width: canvas.width, height: canvas.height }
            })
            
            // Scale image to fit canvas while maintaining aspect ratio
            const scaleX = img.width > 0 ? canvas.width / img.width : 1
            const scaleY = img.height > 0 ? canvas.height / img.height : 1
            const scale = Math.min(scaleX, scaleY, 1) // Don't scale up beyond original size
            
            // Center the image on canvas
            const scaledWidth = img.width * scale
            const scaledHeight = img.height * scale
            const left = (canvas.width - scaledWidth) / 2
            const top = (canvas.height - scaledHeight) / 2
            
            img.set({
              left: left,
              top: top,
              scaleX: scale,
              scaleY: scale,
              selectable: true,
              evented: true
            })
            
            // Apply based on selected processing mode
            if (mode === 'replace') {
              // Replace entire canvas
              canvas.clear()
              canvas.backgroundColor = 'white'
              canvas.add(img)
              canvas.setActiveObject(img)
            } else if (mode === 'layer') {
              // Keep original objects, add AI result as background
              canvas.add(img)
              canvas.sendToBack(img)
            } else if (mode === 'selection') {
              // For selection mode, replace only the selected object
              const activeObjects = canvas.getActiveObjects()
              if (activeObjects.length === 1) {
                const selectedObj = activeObjects[0]
                // Position new image where the selected object was
                img.set({
                  left: selectedObj.left,
                  top: selectedObj.top,
                  scaleX: selectedObj.scaleX,
                  scaleY: selectedObj.scaleY
                })
                canvas.remove(selectedObj)
              }
              canvas.add(img)
              canvas.setActiveObject(img)
            } else {
              // Default: just add the image
              canvas.add(img)
              canvas.setActiveObject(img)
            }
            
            canvas.renderAll()
            
            // Save state for undo
            setTimeout(() => saveState(canvas), 100)
            
            // Clean up the blob URL to prevent memory leaks
            setTimeout(() => URL.revokeObjectURL(editedImageUrl), 1000)
            
            console.log('✨ AI-edited image loaded and displayed successfully!')
            
            // Show user feedback based on mode
            const modeMessages = {
              'replace': 'Canvas replaced with AI-enhanced image',
              'layer': 'AI-enhanced image added as background layer',
              'selection': 'Selected object replaced with AI-enhanced version'
            }
            
            // Optional: Show a brief success message
            // You could add a toast notification here
            console.log(`🎨 ${modeMessages[mode] || 'AI enhancement completed'}`)
          },
          // Error callback
          (error) => {
            console.error('❌ Failed to load AI-edited image:', error)
            URL.revokeObjectURL(editedImageUrl)
            alert('Failed to display AI-edited image. The editing was completed but display failed.')
          },
          // Options
          {
            crossOrigin: 'anonymous'
          }
        )
      } else {
        const errorText = await editResponse.text()
        console.error('❌ Failed to edit image:', errorText)
        alert(`AI editing failed: ${errorText}`)
        throw new Error(`Server error: ${editResponse.status}`)
      }
    } catch (error) {
      console.error('❌ AI editing error:', error)
      
      // Show user-friendly error message
      let errorMessage = 'AI editing failed. Please try again.'
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to AI backend. Make sure the server is running on http://localhost:8000'
      } else if (error.message.includes('Server error')) {
        errorMessage = 'AI server error. Check your Gemini API key and try again.'
      }
      
      alert(errorMessage)
      console.error('🔧 Troubleshooting tips:')
      console.error('1. Make sure backend is running: python -m uvicorn main:app --reload --port 8000')
      console.error('2. Check your Gemini API key in Backend/app/.env')
      console.error('3. Test backend: http://localhost:8000/test-gemini')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        onClear={clearCanvas}
        onAddShape={addShape}
        onDownload={downloadCanvas}
        onLoadImageAsBackground={loadImageAsBackground}
        onLoadImageAsObject={loadImageAsObject}
        onRemoveBackground={removeBackground}
        onSetPresetSize={setPresetSize}
        onSetCanvasDimensions={setCanvasDimensions}
        canvasSize={canvasSize}
        useCustomSize={useCustomSize}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyStep > 0}
        canRedo={historyStep < history.length - 1}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onSaveProject={saveProject}
        onLoadProject={loadProject}
        onDeleteSelected={deleteSelectedObjects}
        hasSelection={hasSelection}
        onMergeObjects={mergeSelectedObjects}
        onUngroupObject={ungroupSelectedObject}
        hasMultipleSelection={hasMultipleSelection}
        hasGroupSelected={hasGroupSelected}
      />
      
      <div className="canvas-container">
        {!isCanvasReady ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px',
            color: '#666'
          }}>
            <div>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              Loading Canvas...
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <canvas 
              ref={canvasRef} 
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              opacity: 0.7,
              pointerEvents: 'none'
            }}>
              💡 Drag & drop images here
            </div>
          </div>
        )}
      </div>

      <AIPanel
        onAIEdit={handleAIEdit}
        isLoading={isLoading}
      />
    </>
  )
}

export default DrawingEditor