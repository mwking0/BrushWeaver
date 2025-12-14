import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tokens, setTokens] = useState({
    access_token: localStorage.getItem('access_token'),
    refresh_token: localStorage.getItem('refresh_token')
  })

  const API_BASE = 'http://localhost:8000'

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token')
      if (accessToken) {
        try {
          const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            // Token might be expired, try to refresh
            await refreshToken()
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          logout()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Login failed')
      }

      const data = await response.json()
      
      // Store tokens
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      
      setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      })
      setUser(data.user)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signup = async (email, password, fullName) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: fullName 
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Signup failed')
      }

      const data = await response.json()
      
      // Store tokens
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      
      setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      })
      setUser(data.user)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      
      // Store new tokens
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      
      setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      })
      setUser(data.user)
      
      return data.access_token
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return null
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setTokens({ access_token: null, refresh_token: null })
    setUser(null)
  }

  const getGoogleAuthUrl = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/google`)
      const data = await response.json()
      return data.auth_url
    } catch (error) {
      console.error('Failed to get Google auth URL:', error)
      return null
    }
  }

  const getGitHubAuthUrl = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/github`)
      const data = await response.json()
      return data.auth_url
    } catch (error) {
      console.error('Failed to get GitHub auth URL:', error)
      return null
    }
  }

  const handleOAuthCallback = async (provider, code) => {
    try {
      const response = await fetch(`${API_BASE}/auth/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'OAuth callback failed')
      }

      const data = await response.json()
      
      // Store tokens
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      
      setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      })
      setUser(data.user)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // API helper with automatic token refresh
  const apiCall = async (url, options = {}) => {
    let accessToken = tokens.access_token

    const makeRequest = async (token) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      })
    }

    let response = await makeRequest(accessToken)

    // If unauthorized, try to refresh token
    if (response.status === 401) {
      const newToken = await refreshToken()
      if (newToken) {
        response = await makeRequest(newToken)
      }
    }

    return response
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshToken,
    getGoogleAuthUrl,
    getGitHubAuthUrl,
    handleOAuthCallback,
    apiCall,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}