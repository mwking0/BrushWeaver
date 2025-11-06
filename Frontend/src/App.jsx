import DrawingEditor from './components/DrawingEditor'

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-background"></div>
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <img src="/logo.png" alt="PaintWeaver Logo" className="logo" />
              <div className="logo-glow"></div>
            </div>
            <div className="header-text">
              <h1 className="brand-title">
                <span className="brand-paint">
                  <span className="letter">P</span>
                  <span className="letter">a</span>
                  <span className="letter">i</span>
                  <span className="letter">n</span>
                  <span className="letter">t</span>
                </span>
                <span className="brand-weaver">
                  <span className="letter">W</span>
                  <span className="letter">e</span>
                  <span className="letter">a</span>
                  <span className="letter">v</span>
                  <span className="letter">e</span>
                  <span className="letter">r</span>
                </span>
              </h1>
              <div className="tagline-container">
                <span className="tagline">
                  <span className="tagline-word">Create</span>
                  <span className="tagline-separator">•</span>
                  <span className="tagline-word">Draw</span>
                  <span className="tagline-separator">•</span>
                  <span className="tagline-word">Weave</span>
                  <span className="tagline-word">with</span>
                  <span className="tagline-word ai-highlight">AI</span>
                </span>
                <div className="tagline-underline"></div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <div className="infinity-symbol">
                    <div className="infinity-loop"></div>
                  </div>
                </div>
                <span className="stat-number">∞</span>
                <span className="stat-label">Possibilities</span>
              </div>
              <div className="stat-divider">
                <div className="divider-pulse"></div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <div className="ai-brain">
                    <div className="brain-pulse"></div>
                    <div className="brain-spark spark-1"></div>
                    <div className="brain-spark spark-2"></div>
                    <div className="brain-spark spark-3"></div>
                  </div>
                </div>
                <span className="stat-number">AI</span>
                <span className="stat-label">Powered</span>
              </div>
            </div>
          </div>
        </div>
        <div className="header-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
          <div className="particle particle-6"></div>
          <div className="particle particle-7"></div>
          <div className="particle particle-8"></div>
        </div>
        <div className="header-waves">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>
        <div className="header-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <div className="header-grid"></div>
      </header>
      <main className="main-content">
        <DrawingEditor />
      </main>
    </div>
  )
}

export default App