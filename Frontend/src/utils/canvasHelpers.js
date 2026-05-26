/**
 * Pure helper functions for canvas operations.
 * No React, no Fabric imports — just data transformations.
 */

/**
 * Generate a timestamped filename for exports.
 */
export function generateFilename(ext) {
  const ts = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  return `brushweaver_${ts}.${ext}`
}

/**
 * Convert a data URL to a Blob.
 */
export async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  return res.blob()
}

/**
 * Get the display name for a canvas object type.
 */
export function getLayerName(obj) {
  if (obj.name) return obj.name
  const names = {
    path:    'Drawing',
    rect:    'Rectangle',
    circle:  'Circle',
    triangle:'Triangle',
    line:    'Line',
    'i-text':'Text',
    image:   'Image',
    group:   'Group',
  }
  return names[obj.type] || obj.type
}

/**
 * Build a stable ID for a canvas object.
 */
export function getObjectId(obj, index) {
  return obj.id || `obj-${index}`
}

/**
 * Serialize canvas objects for the layers panel.
 */
export function serializeCanvasObjects(canvas) {
  return canvas.getObjects().map((obj, index) => ({
    id:       getObjectId(obj, index),
    type:     obj.type,
    name:     obj.name || null,
    index,
    isLocked: obj.isLocked || false,
  }))
}
