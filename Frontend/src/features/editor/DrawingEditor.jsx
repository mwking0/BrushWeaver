import React, { useState, useCallback } from 'react'
import { fabric } from 'fabric'
import Toolbar from './Toolbar'
import AIPanel from './AIPanel'
import { useCanvas } from '../../hooks/useCanvas'
import { useHistory } from '../../hooks/useHistory'
import { useCanvasTools } from '../../hooks/useCanvasTools'
import { useCanvasObjects } from '../../hooks/useCanvasObjects'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { editImageRequest, removeBackgroundRequest } from '../../services/aiService'

const DrawingEditor = ({ onCreditUsed }) => {
  const [brushColor, setBrushColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [isLoading, setIsLoading] = useState(false)

  // ── History ──────────────────────────────────────────────────────────────
  const {
    history, historyStep,
    saveState, undo, redo, initHistory, clearSaveTimeout,
    canUndo, canRedo,
  } = useHistory()

  // ── Canvas objects / layers ───────────────────────────────────────────────
  const {
    canvasObjects, selectedObjectId, setSelectedObjectId,
    updateCanvasObjects, renameLayer,
    bringToFront, sendToBack, bringForward, sendBackward,
    selectObjectById, reorderLayers,
    lockObject, unlockObject, toggleObjectLock, toggleObjectVisibility,
  } = useCanvasObjects()

  // ── Canvas core ───────────────────────────────────────────────────────────
  const {
    canvasRef, canvas, canvasSize, isCanvasReady, useCustomSize,
    zoom, showGrid, setShowGrid, hasSelection, hasMultipleSelection, hasGroupSelected,
    blobUrlsRef, zoomIn, zoomOut, resetZoom, setPresetSize, setCanvasDimensions,
  } = useCanvas({
    brushColor,
    brushSize,
    onReady: (fabricCanvas) => {
      initHistory(fabricCanvas)
      updateCanvasObjects(fabricCanvas)
    },
    onObjectEvent: (fabricCanvas, eventName) => {
      if (!fabricCanvas._isUndoRedo) {
        setTimeout(() => saveState(fabricCanvas), 50)
      }
      updateCanvasObjects(fabricCanvas)

      // Track selected object for layers panel
      const active = fabricCanvas.getActiveObject()
      if (active && eventName === 'selection:created') {
        const idx = fabricCanvas.getObjects().indexOf(active)
        setSelectedObjectId(active.id || `obj-${idx}`)
      }
    },
  })

  // ── Background image helpers ──────────────────────────────────────────────
  const ensureBackgroundImagesAtBack = useCallback(() => {
    if (!canvas) return
    canvas.getObjects()
      .filter(o => o.name === 'background-image')
      .forEach(o => canvas.sendToBack(o))
  }, [canvas])

  // ── Tools ─────────────────────────────────────────────────────────────────
  const { activeTool, setActiveTool, addShape } = useCanvasTools(
    canvas, brushColor, brushSize, saveState, ensureBackgroundImagesAtBack
  )

  // ── Canvas actions ────────────────────────────────────────────────────────
  const clearCanvas = useCallback(() => {
    if (!canvas) return
    canvas.clear()
    canvas.backgroundColor = 'white'
    canvas.renderAll()
    setTimeout(() => saveState(canvas), 50)
  }, [canvas, saveState])

  const deleteSelectedObjects = useCallback(() => {
    if (!canvas) return
    canvas.getActiveObjects().forEach(o => canvas.remove(o))
    canvas.discardActiveObject()
    canvas.renderAll()
    updateCanvasObjects(canvas)
    setTimeout(() => saveState(canvas), 50)
  }, [canvas, saveState, updateCanvasObjects])

  const mergeSelectedObjects = useCallback(() => {
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (active?.type !== 'activeSelection') return
    active.toGroup()
    canvas.requestRenderAll()
    updateCanvasObjects(canvas)
    setTimeout(() => saveState(canvas), 10)
  }, [canvas, saveState, updateCanvasObjects])

  const ungroupSelectedObject = useCallback(() => {
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (active?.type !== 'group') return
    active.toActiveSelection()
    canvas.requestRenderAll()
    updateCanvasObjects(canvas)
    setTimeout(() => saveState(canvas), 10)
  }, [canvas, saveState, updateCanvasObjects])

  // ── Export / Import ───────────────────────────────────────────────────────
  const exportCanvas = useCallback(() => {
    if (!canvas) return null
    return canvas.toDataURL({ format: 'png', quality: 1 })
  }, [canvas])

  const downloadCanvas = useCallback((format = 'png', quality = 1) => {
    if (!canvas) return
    let dataURL, filename
    if (format === 'svg') {
      dataURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(canvas.toSVG())}`
      filename = `brushweaver_${Date.now()}.svg`
    } else if (format === 'jpeg' || format === 'jpg') {
      dataURL = canvas.toDataURL('image/jpeg', quality)
      filename = `brushweaver_${Date.now()}.jpg`
    } else {
      dataURL = canvas.toDataURL('image/png', quality)
      filename = `brushweaver_${Date.now()}.png`
    }
    const a = document.createElement('a')
    a.href = dataURL; a.download = filename
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }, [canvas])

  const saveProject = useCallback(() => {
    if (!canvas) return
    const data = JSON.stringify({ canvas: canvas.toJSON(), metadata: { canvasSize } }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `brushweaver_${Date.now()}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }, [canvas, canvasSize])

  const loadProject = useCallback((file) => {
    if (!canvas || !file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const { canvas: canvasData, metadata } = JSON.parse(e.target.result)
        canvas.loadFromJSON(canvasData, () => {
          canvas.renderAll()
          setTimeout(() => saveState(canvas), 100)
          if (metadata?.canvasSize) {
            const { width, height } = metadata.canvasSize
            if (width !== canvasSize.width || height !== canvasSize.height) {
              setCanvasDimensions(width, height)
            }
          }
        })
      } catch {
        alert('Failed to load project file.')
      }
    }
    reader.readAsText(file)
  }, [canvas, canvasSize, saveState, setCanvasDimensions])

  // ── Image loading ─────────────────────────────────────────────────────────
  const loadImageAsBackground = useCallback((file) => {
    if (!canvas || !file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
        img.set({
          left: (canvas.width - img.width * scale) / 2,
          top: (canvas.height - img.height * scale) / 2,
          scaleX: scale, scaleY: scale,
          selectable: true, evented: true,
          name: 'background-image', opacity: 0.95,
          borderColor: '#007bff', cornerColor: '#007bff',
        })
        canvas.add(img)
        canvas.sendToBack(img)
        canvas.backgroundColor = 'transparent'
        canvas.renderAll()
        setTimeout(() => saveState(canvas), 100)
      })
    }
    reader.readAsDataURL(file)
  }, [canvas, saveState])

  const loadImageAsObject = useCallback((file) => {
    if (!canvas || !file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        const maxSize = Math.min(canvas.width, canvas.height) * 0.5
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        img.set({
          left: canvas.width / 2 - (img.width * scale) / 2,
          top: canvas.height / 2 - (img.height * scale) / 2,
          scaleX: scale, scaleY: scale,
        })
        canvas.add(img)
        ensureBackgroundImagesAtBack()
        canvas.setActiveObject(img)
        canvas.renderAll()
      })
    }
    reader.readAsDataURL(file)
  }, [canvas, ensureBackgroundImagesAtBack])

  const removeBackground = useCallback(() => {
    if (!canvas) return
    canvas.getObjects()
      .filter(o => o.name === 'background-image')
      .forEach(o => canvas.remove(o))
    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas))
    canvas.backgroundColor = 'white'
    canvas.renderAll()
    setTimeout(() => saveState(canvas), 100)
  }, [canvas, saveState])

  // ── AI Edit ───────────────────────────────────────────────────────────────
  const handleAIEdit = useCallback(async (prompt, mode = 'replace') => {
    if (!canvas || !prompt.trim()) return

    const activeObjects = canvas.getActiveObjects()
    if (mode === 'selection' && activeObjects.length === 0) {
      alert('Selection mode requires an object to be selected.')
      return
    }

    setIsLoading(true)
    try {
      let imageDataUrl = exportCanvas()

      if (mode === 'selection' && activeObjects.length === 1 && activeObjects[0].type === 'image') {
        const sel = activeObjects[0]
        const tmp = new fabric.Canvas()
        tmp.setDimensions({ width: sel.width * sel.scaleX, height: sel.height * sel.scaleY })
        const clone = fabric.util.object.clone(sel)
        clone.set({ left: 0, top: 0, scaleX: 1, scaleY: 1 })
        tmp.add(clone)
        imageDataUrl = tmp.toDataURL('image/png')
        tmp.dispose()
      }

      const blob = await (await fetch(imageDataUrl)).blob()
      const res = await editImageRequest(blob, prompt)
      const editedBlob = await res.blob()
      const editedUrl = URL.createObjectURL(editedBlob)
      blobUrlsRef.current.push(editedUrl)

      fabric.Image.fromURL(editedUrl, (img) => {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height, 1)
        img.set({
          left: (canvas.width - img.width * scale) / 2,
          top: (canvas.height - img.height * scale) / 2,
          scaleX: scale, scaleY: scale,
          selectable: true, evented: true,
        })

        if (mode === 'replace') {
          canvas.clear(); canvas.backgroundColor = 'white'
          canvas.add(img); canvas.setActiveObject(img)
        } else if (mode === 'layer') {
          canvas.add(img); canvas.sendToBack(img)
          ensureBackgroundImagesAtBack()
        } else if (mode === 'selection' && activeObjects.length === 1) {
          const sel = activeObjects[0]
          img.set({ left: sel.left, top: sel.top, scaleX: sel.scaleX, scaleY: sel.scaleY })
          canvas.remove(sel); canvas.add(img)
          ensureBackgroundImagesAtBack(); canvas.setActiveObject(img)
        } else {
          canvas.add(img); ensureBackgroundImagesAtBack()
        }

        canvas.renderAll()
        setTimeout(() => saveState(canvas), 100)
        setTimeout(() => {
          URL.revokeObjectURL(editedUrl)
          blobUrlsRef.current = blobUrlsRef.current.filter(u => u !== editedUrl)
        }, 1000)
        // Refresh credit balance in header
        onCreditUsed?.()
      }, (err) => {
        console.error('Failed to load AI image:', err)
        URL.revokeObjectURL(editedUrl)
        alert('AI editing completed but failed to display result.')
      }, { crossOrigin: 'anonymous' })

    } catch (err) {
      console.error('AI editing error:', err)
      const msg = err.message.includes('Failed to fetch')
        ? 'Cannot connect to backend at http://localhost:8000'
        : `AI editing failed: ${err.message}`
      alert(msg)
    } finally {
      setIsLoading(false)
    }
  }, [canvas, exportCanvas, saveState, ensureBackgroundImagesAtBack, blobUrlsRef])

  // ── Background Removal ────────────────────────────────────────────────────
  const handleRemoveBackground = useCallback(async (model = 'u2net', alphaMatting = false) => {
    if (!canvas) return
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length === 0) { alert('Please select an image to remove its background.'); return }
    if (activeObjects.length > 1) { alert('Background removal works with one object at a time.'); return }

    const sel = activeObjects[0]
    setIsLoading(true)
    try {
      let imageDataUrl
      const tmp = new fabric.Canvas()
      const bounds = sel.getBoundingRect()
      tmp.setDimensions({
        width: Math.max(sel.type === 'image' ? sel.width * sel.scaleX : bounds.width, 1),
        height: Math.max(sel.type === 'image' ? sel.height * sel.scaleY : bounds.height, 1),
      })
      const clone = fabric.util.object.clone(sel)
      clone.set(sel.type === 'image'
        ? { left: 0, top: 0, scaleX: 1, scaleY: 1 }
        : { left: -bounds.left, top: -bounds.top }
      )
      tmp.add(clone)
      imageDataUrl = tmp.toDataURL('image/png')
      tmp.dispose()

      const blob = await (await fetch(imageDataUrl)).blob()
      const res = await removeBackgroundRequest(blob, model, alphaMatting)
      const processedBlob = await res.blob()
      const processedUrl = URL.createObjectURL(processedBlob)
      blobUrlsRef.current.push(processedUrl)

      fabric.Image.fromURL(processedUrl, (img) => {
        img.set({
          left: sel.left, top: sel.top,
          scaleX: sel.scaleX, scaleY: sel.scaleY,
          selectable: true, evented: true,
        })
        canvas.remove(sel)
        canvas.add(img)
        ensureBackgroundImagesAtBack()
        canvas.setActiveObject(img)
        canvas.renderAll()
        setTimeout(() => saveState(canvas), 100)
        setTimeout(() => {
          URL.revokeObjectURL(processedUrl)
          blobUrlsRef.current = blobUrlsRef.current.filter(u => u !== processedUrl)
        }, 1000)
        // Refresh credit balance in header
        onCreditUsed?.()
      }, (err) => {
        console.error('Failed to load processed image:', err)
        URL.revokeObjectURL(processedUrl)
        alert('Background removal completed but failed to display result.')
      }, { crossOrigin: 'anonymous' })

    } catch (err) {
      console.error('Background removal error:', err)
      alert(err.message.includes('Failed to fetch')
        ? 'Cannot connect to backend at http://localhost:8000'
        : `Background removal failed: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [canvas, saveState, ensureBackgroundImagesAtBack, blobUrlsRef])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useKeyboardShortcuts({
    canvas,
    showGrid,
    setShowGrid,
    setActiveTool,
    undo: () => undo(canvas, () => updateCanvasObjects(canvas)),
    redo: () => redo(canvas, () => updateCanvasObjects(canvas)),
    resetZoom,
    deleteSelectedObjects,
    mergeSelectedObjects,
    ungroupSelectedObject,
    saveProject,
    downloadCanvas,
  })

  // ── Drag & drop ───────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!canvas) return
    const el = canvas.upperCanvasEl || canvas.lowerCanvasEl
    if (!el) return

    const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; el.style.border = '2px dashed #007bff' }
    const onDragLeave = (e) => { e.preventDefault(); el.style.border = '1px solid #ddd' }
    const onDrop = (e) => {
      e.preventDefault(); el.style.border = '1px solid #ddd'
      const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'))
      if (file) e.shiftKey ? loadImageAsObject(file) : loadImageAsBackground(file)
    }

    el.addEventListener('dragover', onDragOver)
    el.addEventListener('dragleave', onDragLeave)
    el.addEventListener('drop', onDrop)
    return () => {
      el.removeEventListener('dragover', onDragOver)
      el.removeEventListener('dragleave', onDragLeave)
      el.removeEventListener('drop', onDrop)
    }
  }, [canvas, loadImageAsBackground, loadImageAsObject])

  // ── Render ────────────────────────────────────────────────────────────────
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
        onRemoveObjectBackground={handleRemoveBackground}
        onSetPresetSize={setPresetSize}
        onSetCanvasDimensions={setCanvasDimensions}
        canvasSize={canvasSize}
        useCustomSize={useCustomSize}
        onUndo={() => undo(canvas, () => updateCanvasObjects(canvas))}
        onRedo={() => redo(canvas, () => updateCanvasObjects(canvas))}
        canUndo={canUndo}
        canRedo={canRedo}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(prev => !prev)}
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: '#666' }}>
            <div>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              Loading Canvas...
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%' }}>
            <div style={{ position: 'relative', display: 'inline-block', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', borderRadius: '4px' }}>
              <canvas
                ref={canvasRef}
                style={{ display: 'block', borderRadius: '4px' }}
              />
              <div style={{
                position: 'absolute', bottom: 10, right: 10,
                background: 'rgba(0,0,0,0.7)', color: 'white',
                padding: '0.4rem 0.75rem', borderRadius: '4px',
                fontSize: '0.75rem', opacity: 0.7, pointerEvents: 'none',
              }}>
                💡 Drag & drop images here
              </div>
            </div>
          </div>
        )}
      </div>

      <AIPanel
        onAIEdit={handleAIEdit}
        isLoading={isLoading}
        canvasObjects={canvasObjects}
        onBringToFront={(id) => bringToFront(canvas, id, saveState)}
        onSendToBack={(id) => sendToBack(canvas, id, saveState)}
        onBringForward={(id) => bringForward(canvas, id, saveState)}
        onSendBackward={(id) => sendBackward(canvas, id, saveState)}
        onSelectObject={(id) => selectObjectById(canvas, id)}
        selectedObjectId={selectedObjectId}
        onReorderLayers={(from, to) => reorderLayers(canvas, from, to, saveState)}
        onRenameLayer={(id, name) => renameLayer(canvas, id, name, saveState)}
        onLockObject={(id) => lockObject(canvas, id, saveState)}
        onUnlockObject={(id) => unlockObject(canvas, id, saveState)}
        onToggleObjectLock={(id) => toggleObjectLock(canvas, id, saveState)}
        onToggleObjectVisibility={(id) => toggleObjectVisibility(canvas, id, saveState)}
      />
    </>
  )
}

export default DrawingEditor
