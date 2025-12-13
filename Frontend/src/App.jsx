import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import DrawingEditor from './components/DrawingEditor'

// Protected Route Component
const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Editor Page with Header
const EditorPage = ({ user, onLogout }) => {
  const navigate = useNavigate()

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div className="logo-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="brushGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <path d="M20 5 L35 15 L35 25 L20 35 L5 25 L5 15 Z" fill="url(#brushGradient)" opacity="0.2" />
                  <path d="M10 12 Q15 8 20 12 T30 12" stroke="url(#brushGradient)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M8 18 Q13 14 18 18 T28 18" stroke="url(#brushGradient)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M10 24 Q15 20 20 24 T30 24" stroke="url(#brushGradient)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <circle cx="32" cy="10" r="3" fill="#8b5cf6" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
              <div className="brand-info">
                <h1 className="brand-name">BrushWeaver</h1>
                <p className="brand-tagline">AI-Powered Creative Studio</p>
              </div>
            </div>
          </div>

          <div className="header-center">
            <div className="feature-badges">
              <div className="badge">
                <span className="badge-icon">🎨</span>
                <span className="badge-text">Draw</span>
              </div>
              <div className="badge">
                <span className="badge-icon">✨</span>
                <span className="badge-text">AI Edit</span>
              </div>
              <div className="badge">
                <span className="badge-icon">🖼️</span>
                <span className="badge-text">Export</span>
              </div>
            </div>
          </div>

          <div className="header-right">
            {user && (
              <div className="user-menu">
                <span className="user-name">👋 {user.name}</span>
                <button className="header-btn" onClick={onLogout} title="Logout">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L4 7.414 5.414 6l3.293 3.293L13.586 6 15 7.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            <button className="header-btn help-btn" title="Help & Shortcuts">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z" />
              </svg>
            </button>
            <button className="header-btn github-btn" title="View on GitHub">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.165 20 14.418 20 10c0-5.523-4.477-10-10-10z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">
        <DrawingEditor />
      </main>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
        <Route
          path="/editor"
          element={
            <ProtectedRoute user={user}>
              <EditorPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App