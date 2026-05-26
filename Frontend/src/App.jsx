import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import LandingPage from './features/landing/LandingPage'
import Login from './features/auth/Login'
import Signup from './features/auth/Signup'
import OAuthCallback from './features/auth/OAuthCallback'
import DrawingEditor from './features/editor/DrawingEditor'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <p>Loading...</p>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Editor Page with Header
const EditorPage = () => {
  const { user, logout, credits, refreshCredits } = useAuth()
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
            {/* Credits badge */}
            {user && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.3rem 0.75rem',
                background: credits <= 2 ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.15)',
                border: `1px solid ${credits <= 2 ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.3)'}`,
                borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                color: credits <= 2 ? '#f87171' : '#c4b5fd', cursor: 'default',
              }} title="Available AI credits">
                <span>⚡</span>
                <span>{credits} credit{credits !== 1 ? 's' : ''}</span>
              </div>
            )}

            {user && (
              <div className="user-menu">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar"
                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(139,92,246,0.5)' }}
                  />
                ) : (
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>
                    {(user.full_name || user.email || '?')[0].toUpperCase()}
                  </div>
                )}
                <span className="user-name" style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.full_name || user.email}
                </span>
                <button className="header-btn" onClick={logout} title="Logout" style={{ flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="main-content">
        <DrawingEditor onCreditUsed={refreshCredits} />
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/google/callback" element={<OAuthCallback provider="google" />} />
          <Route path="/auth/github/callback" element={<OAuthCallback provider="github" />} />
          <Route 
            path="/editor" 
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AuthProvider>
  )
}

export default App