/**
 * AI service — image editing, text-to-image generation, and background removal.
 * Auth headers and 401 refresh are handled by apiRequest.
 */

import { apiRequest, BASE_URL } from './apiClient'

function ensureOk(res) {
  if (!res.ok) {
    const err = new Error(`Server error: ${res.status}`)
    err.status = res.status
    throw err
  }
  return res
}

export async function editImageRequest(imageBlob, prompt, style = 'none') {
  const formData = new FormData()
  formData.append('file', imageBlob, 'drawing.png')
  formData.append('prompt', prompt)
  formData.append('style', style)
  formData.append('format', 'png')
  formData.append('use_ai', 'true')

  const res = await apiRequest('/edit', { method: 'POST', body: formData })
  return ensureOk(res)
}

export async function generateImageRequest(prompt, style = 'none') {
  const formData = new FormData()
  formData.append('prompt', prompt)
  formData.append('style', style)
  formData.append('format', 'png')
  formData.append('use_ai', 'true')

  const res = await apiRequest('/edit', { method: 'POST', body: formData })
  return ensureOk(res)
}

export async function removeBackgroundRequest(imageBlob, model = 'u2net', alphaMatting = false) {
  const formData = new FormData()
  formData.append('file', imageBlob, 'object.png')
  formData.append('model', model)
  formData.append('alpha_matting', alphaMatting.toString())
  formData.append('format', 'png')

  const res = await apiRequest('/edit/remove-background', { method: 'POST', body: formData })
  return ensureOk(res)
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
