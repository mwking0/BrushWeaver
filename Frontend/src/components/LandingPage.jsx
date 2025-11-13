import React from 'react'
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>AI-Powered Creative Studio</span>
          </div>
          
          <h1 className="hero-title">
            Create Stunning Art with
            <span className="gradient-text"> AI Magic</span>
          </h1>
          
          <p className="hero-description">
            Draw, design, and transform your ideas into reality with the power of artificial intelligence. 
            BrushWeaver combines intuitive drawing tools with cutting-edge AI to bring your creativity to life.
          </p>
          
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>
              Get Started Free
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"/>
              </svg>
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">∞</div>
              <div className="stat-label">Possibilities</div>
            </div>
            <div className="stat">
              <div className="stat-number">AI</div>
              <div className="stat-label">Powered</div>
            </div>
            <div className="stat">
              <div className="stat-number">Free</div>
              <div className="stat-label">To Start</div>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="visual-card card-1">
            <div className="card-icon">🎨</div>
            <div className="card-title">Draw</div>
          </div>
          <div className="visual-card card-2">
            <div className="card-icon">✨</div>
            <div className="card-title">AI Transform</div>
          </div>
          <div className="visual-card card-3">
            <div className="card-icon">🖼️</div>
            <div className="card-title">Export</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-description">Everything you need to create amazing artwork</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🖌️</div>
            <h3 className="feature-title">Professional Drawing Tools</h3>
            <p className="feature-description">
              Pen, eraser, shapes, text, and more. Everything you need to bring your ideas to life.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3 className="feature-title">AI-Powered Editing</h3>
            <p className="feature-description">
              Transform your drawings with AI. Just describe what you want and watch the magic happen.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎭</div>
            <h3 className="feature-title">Style Presets</h3>
            <p className="feature-description">
              Apply artistic styles instantly. Watercolor, oil painting, anime, and more.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📐</div>
            <h3 className="feature-title">Layer Management</h3>
            <p className="feature-description">
              Organize your work with layers. Rename, reorder, and manage with ease.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Real-time Preview</h3>
            <p className="feature-description">
              See your changes instantly. No waiting, no loading screens.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h3 className="feature-title">Export Anywhere</h3>
            <p className="feature-description">
              Save in multiple formats: PNG, JPEG, SVG. Perfect for any use case.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Create?</h2>
          <p className="cta-description">
            Join thousands of artists and designers using BrushWeaver to bring their ideas to life.
          </p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/signup')}>
            Start Creating Now
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="footer-logo">BrushWeaver</h3>
            <p className="footer-tagline">AI-Powered Creative Studio</p>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Features</a>
            <a href="#" className="footer-link">Pricing</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 BrushWeaver. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
