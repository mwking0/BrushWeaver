import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Palette,
  Sparkles,
  Image as ImageIcon,
  Layers,
  Zap,
  Download,
  ArrowRight,
  Brush,
  Wand2,
  Share2
} from 'lucide-react'

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
            Draw, design, and transform your ideas into reality.
            BrushWeaver combines professional drawing tools with cutting-edge local AI to bring your creativity to life instantly.
          </p>

          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>
              Get Started Free
              <ArrowRight size={20} />
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
              <div className="stat-number">100%</div>
              <div className="stat-label">Local AI</div>
            </div>
            <div className="stat">
              <div className="stat-number">Free</div>
              <div className="stat-label">Forever</div>
            </div>
          </div>
        </div>

        {/* New Structure: App Interface Preview */}
        <div className="hero-visual">
          <div className="hero-visual-wrapper">
            <div className="app-preview-card">
              <div className="app-header">
                <div className="app-dots">
                  <div className="dot red"></div>
                  <div className="dot yellow"></div>
                  <div className="dot green"></div>
                </div>
                <div className="app-search">brushweaver.app</div>
              </div>
              <div className="app-body">
                <div className="app-sidebar">
                  <div className="app-tool active"><Brush size={16} /></div>
                  <div className="app-tool"><Wand2 size={16} /></div>
                  <div className="app-tool"><Layers size={16} /></div>
                </div>
                <div className="app-canvas">
                  <div className="floating-element circle"></div>
                  <div className="floating-element square"></div>
                  <div className="ai-processing-badge">
                    <Sparkles size={14} className="spin" />
                    Generating...
                  </div>
                </div>
                <div className="app-panels">
                  <div className="panel-item"></div>
                  <div className="panel-item"></div>
                  <div className="panel-item short"></div>
                </div>
              </div>
            </div>

            {/* Floating Feature Cards */}
            <div className="visual-card-floating card-tools">
              <div className="card-icon"><Palette size={20} /></div>
              <div className="card-text">
                <span className="card-label">Tools</span>
                <span className="card-value">Professional</span>
              </div>
            </div>
            <div className="visual-card-floating card-ai">
              <div className="card-icon"><Sparkles size={20} /></div>
              <div className="card-text">
                <span className="card-label">AI Model</span>
                <span className="card-value">Qwen Edit</span>
              </div>
            </div>
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
            <div className="feature-icon">
              <Brush size={40} strokeWidth={1.5} />
            </div>
            <h3 className="feature-title">Professional Tools</h3>
            <p className="feature-description">
              Pen, eraser, shapes, text, and more. Everything you need to bring your ideas to life.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Wand2 size={40} strokeWidth={1.5} />
            </div>
            <h3 className="feature-title">AI-Powered Editing</h3>
            <p className="feature-description">
              Transform your drawings with AI. Just describe what you want and watch the magic happen.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Palette size={40} strokeWidth={1.5} />
            </div>
            <h3 className="feature-title">Style Presets</h3>
            <p className="feature-description">
              Apply artistic styles instantly. Watercolor, oil painting, anime, and more.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Layers size={40} strokeWidth={1.5} />
            </div>
            <h3 className="feature-title">Layer Management</h3>
            <p className="feature-description">
              Organize your work with layers. Rename, reorder, and manage with ease.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={40} strokeWidth={1.5} />
            </div>
            <h3 className="feature-title">Real-time Preview</h3>
            <p className="feature-description">
              See your changes instantly using local acceleration. No waiting, no loading screens.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Download size={40} strokeWidth={1.5} />
            </div>
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
          <button className="btn btn-large" onClick={() => navigate('/signup')}>
            Start Creating Now
            <ArrowRight size={24} />
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
