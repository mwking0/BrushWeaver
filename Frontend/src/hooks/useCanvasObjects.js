import { useState, useCallback } from 'react'

/**
 * Manages canvas objects: layers list, lock/unlock, reorder, rename, z-order.
 */
export function useCanvasObjects() {
  const [canvasObjects, setCanvasObjects] = useState([])
  const [selectedObjectId, setSelectedObjectId] = useState(null)

  const getObjId = (obj, canvas) =>
    obj.id || `obj-${canvas.getObjects().indexOf(obj)}`

  const findObj = (canvas, objectId) =>
    canvas.getObjects().find(o => getObjId(o, canvas) === objectId)

  const updateCanvasObjects = useCallback((canvas) => {
    if (!canvas) return
    const objects = canvas.getObjects().map((obj, index) => ({
      id: obj.id || `obj-${index}`,
      type: obj.type,
      name: obj.name || null,
      index,
      isLocked: obj.isLocked || false,
      isVisible: obj.visible !== false,
    }))
    setCanvasObjects(objects)
  }, [])

  const renameLayer = useCallback((canvas, objectId, newName, saveState) => {
    if (!canvas) return
    const obj = findObj(canvas, objectId)
    if (obj) {
      obj.name = newName
      canvas.renderAll()
      updateCanvasObjects(canvas)
      setTimeout(() => saveState(canvas), 10)
    }
  }, [updateCanvasObjects])

  const bringToFront = useCallback((canvas, objectId, saveState) => {
    const obj = findObj(canvas, objectId)
    if (obj) { canvas.bringToFront(obj); canvas.renderAll(); updateCanvasObjects(canvas); setTimeout(() => saveState(canvas), 10) }
  }, [updateCanvasObjects])

  const sendToBack = useCallback((canvas, objectId, saveState) => {
    const obj = findObj(canvas, objectId)
    if (obj) { canvas.sendToBack(obj); canvas.renderAll(); updateCanvasObjects(canvas); setTimeout(() => saveState(canvas), 10) }
  }, [updateCanvasObjects])

  const bringForward = useCallback((canvas, objectId, saveState) => {
    const obj = findObj(canvas, objectId)
    if (obj) { canvas.bringForward(obj); canvas.renderAll(); updateCanvasObjects(canvas); setTimeout(() => saveState(canvas), 10) }
  }, [updateCanvasObjects])

  const sendBackward = useCallback((canvas, objectId, saveState) => {
    const obj = findObj(canvas, objectId)
    if (obj) { canvas.sendBackward(obj); canvas.renderAll(); updateCanvasObjects(canvas); setTimeout(() => saveState(canvas), 10) }
  }, [updateCanvasObjects])

  const selectObjectById = useCallback((canvas, objectId) => {
    if (!canvas) return
    const obj = findObj(canvas, objectId)
    if (obj) { canvas.setActiveObject(obj); canvas.renderAll() }
  }, [])

  const reorderLayers = useCallback((canvas, fromIndex, toIndex, saveState) => {
    if (!canvas) return
    const obj = canvas.getObjects()[fromIndex]
    if (!obj) return
    canvas.moveTo(obj, toIndex)
    canvas.renderAll()
    updateCanvasObjects(canvas)
    setTimeout(() => saveState(canvas), 10)
  }, [updateCanvasObjects])

  const lockObject = useCallback((canvas, objectId, saveState) => {
    if (!canvas) return
    const obj = findObj(canvas, objectId)
    if (obj) {
      obj.set({
        selectable: false, evented: false,
        lockMovementX: true, lockMovementY: true,
        lockRotation: true, lockScalingX: true, lockScalingY: true,
        lockUniScaling: true, hasControls: false, hasBorders: false,
        isLocked: true,
      })
      canvas.renderAll()
      updateCanvasObjects(canvas)
      setTimeout(() => saveState(canvas), 100)
    }
  }, [updateCanvasObjects])

  const unlockObject = useCallback((canvas, objectId, saveState) => {
    if (!canvas) return
    const obj = findObj(canvas, objectId)
    if (obj) {
      obj.set({
        selectable: true, evented: true,
        lockMovementX: false, lockMovementY: false,
        lockRotation: false, lockScalingX: false, lockScalingY: false,
        lockUniScaling: false, hasControls: true, hasBorders: true,
        isLocked: false,
      })
      canvas.renderAll()
      updateCanvasObjects(canvas)
      setTimeout(() => saveState(canvas), 100)
    }
  }, [updateCanvasObjects])

  const toggleObjectLock = useCallback((canvas, objectId, saveState) => {
    if (!canvas) return
    const obj = findObj(canvas, objectId)
    if (!obj) return
    if (obj.isLocked) {
      unlockObject(canvas, objectId, saveState)
    } else {
      lockObject(canvas, objectId, saveState)
    }
  }, [lockObject, unlockObject])

  const toggleObjectVisibility = useCallback((canvas, objectId, saveState) => {
    if (!canvas) return
    const obj = findObj(canvas, objectId)
    if (!obj) return
    obj.set('visible', !obj.visible)
    // Deselect if hiding the active object
    if (!obj.visible && canvas.getActiveObject() === obj) {
      canvas.discardActiveObject()
    }
    canvas.renderAll()
    updateCanvasObjects(canvas)
    setTimeout(() => saveState(canvas), 100)
  }, [updateCanvasObjects])

  return {
    canvasObjects,
    selectedObjectId,
    setSelectedObjectId,
    updateCanvasObjects,
    renameLayer,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    selectObjectById,
    reorderLayers,
    lockObject,
    unlockObject,
    toggleObjectLock,
    toggleObjectVisibility,
  }
}
