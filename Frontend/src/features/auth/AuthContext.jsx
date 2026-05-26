import { createContext, useContext, useState, useEffect } from 'react'
import {
  loginRequest,
  signupRequest,
  getMeRequest,
  getGoogleAuthUrl as fetchGoogleAuthUrl,
  getGitHubAuthUrl as fetchGitHubAuthUrl,
  oauthCallbackRequest,
} from '../../services/authService'
import { apiRequest } from '../../services/apiClient'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

const storeTokens = (data) => {
  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)
}

const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)

  // Verify token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token')
      if (accessToken) {
        try {
          const userData = await getMeRequest(accessToken)
          setUser(userData)
          setCredits(userData.credits ?? 0)
        } catch {
          clearTokens()
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const data = await loginRequest(email, password)
      storeTokens(data)
      setUser(data.user)
      setCredits(data.user.credits ?? 0)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signup = async (email, password, fullName) => {
    try {
      const data = await signupRequest(email, password, fullName)
      storeTokens(data)
      setUser(data.user)
      setCredits(data.user.credits ?? 0)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    clearTokens()
    setUser(null)
    setCredits(0)
  }

  const refreshCredits = async () => {
    try {
      const res = await apiRequest('/auth/credits')
      if (res.ok) {
        const data = await res.json()
        setCredits(data.credits)
        return data.credits
      }
    } catch {}
    return credits
  }

  const getGoogleAuthUrl = async () => {
    try { return await fetchGoogleAuthUrl() }
    catch { return null }
  }

  const getGitHubAuthUrl = async () => {
    try { return await fetchGitHubAuthUrl() }
    catch { return null }
  }

  const handleOAuthCallback = async (provider, code) => {
    try {
      const data = await oauthCallbackRequest(provider, code)
      storeTokens(data)
      setUser(data.user)
      setCredits(data.user.credits ?? 0)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    credits,
    loading,
    login,
    signup,
    logout,
    refreshCredits,
    getGoogleAuthUrl,
    getGitHubAuthUrl,
    handleOAuthCallback,
    apiCall: apiRequest,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
