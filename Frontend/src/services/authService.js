/**
 * Auth service — all authentication API calls.
 * Used by AuthContext and auth feature components.
 */
import { publicRequest, BASE_URL } from './apiClient'

export async function loginRequest(email, password) {
  const res = await publicRequest('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Login failed')
  }
  return res.json()
}

export async function signupRequest(email, password, fullName) {
  const res = await publicRequest('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Signup failed')
  }
  return res.json()
}

export async function getMeRequest(accessToken) {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Not authenticated')
  return res.json()
}

export async function getGoogleAuthUrl() {
  const res = await publicRequest('/auth/google')
  const data = await res.json()
  return data.auth_url
}

export async function getGitHubAuthUrl() {
  const res = await publicRequest('/auth/github')
  const data = await res.json()
  return data.auth_url
}

export async function oauthCallbackRequest(provider, code) {
  const res = await publicRequest(`/auth/${provider}/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'OAuth callback failed')
  }
  return res.json()
}
