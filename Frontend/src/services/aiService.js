/**
 * AI service — image editing and background removal API calls.
 */

const BASE_URL = 'http://localhost:8000'

export async function editImageRequest(imageBlob, prompt, style = 'none') {
  const formData = new FormData()
  formData.append('file', imageBlob, 'drawing.png')
  formData.append('prompt', prompt)
  formData.append('style', style)
  formData.append('format', 'png')
  formData.append('use_ai', 'true')

  const res = await fetch(`${BASE_URL}/edit`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`Server error: ${res.status}`)
  return res
}

export async function removeBackgroundRequest(imageBlob, model = 'u2net', alphaMatting = false) {
  const formData = new FormData()
  formData.append('file', imageBlob, 'object.png')
  formData.append('model', model)
  formData.append('alpha_matting', alphaMatting.toString())
  formData.append('format', 'png')

  const res = await fetch(`${BASE_URL}/edit/remove-background`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`Server error: ${res.status}`)
  return res
}

export async function getAvailableModels() {
  const res = await fetch(`${BASE_URL}/edit/background-removal/models`)
  if (!res.ok) throw new Error('Failed to fetch models')
  return res.json()
}

export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/healthz`)
  if (!res.ok) throw new Error('Backend not available')
  return res.json()
}
