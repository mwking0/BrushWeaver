/**
 * Base API client — handles auth headers and token refresh automatically.
 * All service modules should use this instead of raw fetch.
 */

const BASE_URL = 'http://localhost:8000'

/**
 * Make an authenticated request. Automatically attaches the Bearer token.
 * If the response is 401, attempts a token refresh and retries once.
 */
export async function apiRequest(path, options = {}) {
  const accessToken = localStorage.getItem('access_token')

  const makeRequest = (token) =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

  let response = await makeRequest(accessToken)

  // Attempt token refresh on 401
  if (response.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      response = await makeRequest(newToken)
    }
  }

  return response
}

/**
 * Make an unauthenticated request (login, signup, OAuth).
 */
export async function publicRequest(path, options = {}) {
  return fetch(`${BASE_URL}${path}`, options)
}

/**
 * Refresh the access token using the stored refresh token.
 * Returns the new access token or null on failure.
 */
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return null

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!res.ok) throw new Error('Refresh failed')

    const data = await res.json()
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    return data.access_token
  } catch {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    return null
  }
}

export { BASE_URL }
