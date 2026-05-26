import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './AuthContext'

const OAuthCallback = ({ provider }) => {
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { handleOAuthCallback } = useAuth()

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          setError(`OAuth error: ${error}`)
          setStatus('error')
          return
        }

        if (!code) {
          setError('No authorization code received')
          setStatus('error')
          return
        }

        setStatus('processing')
        const result = await handleOAuthCallback(provider, code)

        if (result.success) {
          setStatus('success')
          // Redirect to editor after a brief success message
          setTimeout(() => {
            navigate('/editor')
          }, 1500)
        } else {
          setError(result.error || 'OAuth authentication failed')
          setStatus('error')
        }
      } catch (err) {
        setError('An unexpected error occurred')
        setStatus('error')
      }
    }

    processCallback()
  }, [searchParams, provider, handleOAuthCallback, navigate])

  const getProviderName = () => {
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  const getProviderIcon = () => {
    if (provider === 'google') {
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )
    } else if (provider === 'github') {
      return (
        <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.165 20 14.418 20 10c0-5.523-4.477-10-10-10z"/>
        </svg>
      )
    }
    return null
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              {getProviderIcon()}
            </div>
            <h1 className="auth-title">
              {status === 'processing' && `Connecting to ${getProviderName()}...`}
              {status === 'success' && `Welcome to BrushWeaver!`}
              {status === 'error' && `Authentication Failed`}
            </h1>
            <p className="auth-subtitle">
              {status === 'processing' && 'Please wait while we complete your authentication'}
              {status === 'success' && 'Redirecting you to the editor...'}
              {status === 'error' && 'There was a problem with your authentication'}
            </p>
          </div>

          {status === 'processing' && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
              <p style={{ marginTop: '1rem', color: '#666' }}>
                Authenticating with {getProviderName()}...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <svg width="30" height="30" viewBox="0 0 20 20" fill="white">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <p style={{ color: '#10b981', fontWeight: '500' }}>
                Successfully authenticated with {getProviderName()}!
              </p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="auth-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/login')}
                  style={{ marginRight: '1rem' }}
                >
                  Try Again
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('/')}
                >
                  Go Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default OAuthCallback