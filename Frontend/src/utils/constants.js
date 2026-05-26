/**
 * App-wide constants
 */

export const BACKEND_URL = 'http://localhost:8000'

export const CANVAS_PRESETS = {
  'responsive':        null,
  'square-small':      { width: 500,  height: 500  },
  'square-medium':     { width: 800,  height: 800  },
  'square-large':      { width: 1200, height: 1200 },
  'landscape-hd':      { width: 1280, height: 720  },
  'landscape-fhd':     { width: 1920, height: 1080 },
  'portrait-a4':       { width: 595,  height: 842  },
  'portrait-letter':   { width: 612,  height: 792  },
  'social-instagram':  { width: 1080, height: 1080 },
  'social-facebook':   { width: 1200, height: 630  },
  'social-twitter':    { width: 1024, height: 512  },
}

export const TOOLS = {
  PEN:    'pen',
  SELECT: 'select',
  ERASER: 'eraser',
  TEXT:   'text',
  LINE:   'line',
}

export const HISTORY_LIMIT = 50

export const LAYER_TYPE_ICONS = {
  path:    '✏️',
  rect:    '⬜',
  circle:  '⭕',
  triangle:'🔺',
  line:    '📏',
  'i-text':'📝',
  image:   '🖼️',
  group:   '📁',
}

export const LAYER_TYPE_NAMES = {
  path:    'Drawing',
  rect:    'Rectangle',
  circle:  'Circle',
  triangle:'Triangle',
  line:    'Line',
  'i-text':'Text',
  image:   'Image',
  group:   'Group',
}
