import { useState, useEffect, useCallback } from 'react'
import { fabric } from 'fabric'

/**
 * Manages tool switching (pen, select, eraser, text, line, shapes)
 * and the pixel-level eraser logic.
 */
export function useCanvasTools(canvas, brushColor, brushSize, saveState, ensureBackgroundImagesAtBack) {
  const [activeTool, setActiveTool] = useState('pen')
  const [isErasing, setIsErasing] = useState(false)

  // Apply tool settings whenever tool, color, or size changes
  useEffect(() => {
    if (!canvas) return

    canvas.discardActiveObject()
    canvas.renderAll()

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
        canvas.evented = false
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

  // Pixel-level eraser
  useEffect(() => {
    if (!canvas || !isErasing) return

    let isDrawing = false
    let lastX = 0
    let lastY = 0

    const erasePixels = (x, y) => {
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const eraseLine = (x1, y1, x2, y2) => {
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.restore()
    }

    const onDown = (opt) => {
      isDrawing = true
      const p = canvas.getPointer(opt.e)
      lastX = p.x; lastY = p.y
      erasePixels(p.x, p.y)
      canvas.renderAll()
    }

    const onMove = (opt) => {
      if (!isDrawing) return
      const p = canvas.getPointer(opt.e)
      eraseLine(lastX, lastY, p.x, p.y)
      lastX = p.x; lastY = p.y
      canvas.renderAll()
    }

    const onUp = () => {
      if (isDrawing) {
        isDrawing = false
        setTimeout(() => saveState(canvas), 50)
      }
    }

    canvas.on('mouse:down', onDown)
    canvas.on('mouse:move', onMove)
    canvas.on('mouse:up', onUp)

    return () => {
      canvas.off('mouse:down', onDown)
      canvas.off('mouse:move', onMove)
      canvas.off('mouse:up', onUp)
    }
  }, [canvas, isErasing, brushSize, saveState])

  // Text and line placement on click
  useEffect(() => {
    if (!canvas) return

    const handleClick = (e) => {
      if (e.target) return // clicked on existing object

      if (activeTool === 'text') {
        const pointer = canvas.getPointer(e.e)
        const text = new fabric.IText('Click to edit text', {
          left: pointer.x - 75,
          top: pointer.y - 10,
          fontFamily: 'Arial',
          fontSize: 20,
          fill: brushColor,
          editable: true,
        })
        canvas.add(text)
        ensureBackgroundImagesAtBack()
        canvas.setActiveObject(text)
        text.enterEditing()
        canvas.renderAll()
        setTimeout(() => saveState(canvas), 10)
      } else if (activeTool === 'line') {
        const pointer = canvas.getPointer(e.e)
        const line = new fabric.Line(
          [pointer.x - 50, pointer.y, pointer.x + 50, pointer.y],
          { stroke: brushColor, strokeWidth: brushSize, selectable: true }
        )
        canvas.add(line)
        ensureBackgroundImagesAtBack()
        canvas.setActiveObject(line)
        canvas.renderAll()
        setTimeout(() => saveState(canvas), 10)
      }
    }

    if (activeTool === 'text' || activeTool === 'line') {
      canvas.on('mouse:down', handleClick)
    }

    return () => canvas.off('mouse:down', handleClick)
  }, [canvas, activeTool, brushColor, brushSize, saveState, ensureBackgroundImagesAtBack])

  const addShape = useCallback((shapeType) => {
    if (!canvas) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    let shape

    switch (shapeType) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: centerX - 50, top: centerY - 30,
          width: 100, height: 60,
          fill: 'transparent', stroke: brushColor, strokeWidth: 2,
        })
        break
      case 'circle':
        shape = new fabric.Circle({
          left: centerX - 40, top: centerY - 40,
          radius: 40,
          fill: 'transparent', stroke: brushColor, strokeWidth: 2,
        })
        break
      case 'triangle':
        shape = new fabric.Triangle({
          left: centerX - 40, top: centerY - 40,
          width: 80, height: 80,
          fill: 'transparent', stroke: brushColor, strokeWidth: 2,
        })
        break
      default:
        return
    }

    canvas.add(shape)
    ensureBackgroundImagesAtBack()
    canvas.setActiveObject(shape)
    canvas.renderAll()
    setTimeout(() => saveState(canvas), 10)
  }, [canvas, brushColor, saveState, ensureBackgroundImagesAtBack])

  return { activeTool, setActiveTool, isErasing, addShape }
}
