import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const features = [
  {
    icon: '🔍',
    title: 'Smart Location Search',
    desc: 'Find jobs by city, country, or "Remote". Our search understands context.',
  },
  {
    icon: '⚡',
    title: 'One-Click Apply',
    desc: 'Apply instantly to any job once your profile is set up. No lengthy forms.',
  },
  {
    icon: '🏢',
    title: 'Post Jobs Effortlessly',
    desc: 'Employers can post, edit, and manage listings from a dedicated dashboard.',
  },
  {
    icon: '📊',
    title: 'Track Applications',
    desc: 'Job seekers can monitor every applications status in real time.',
  },
  {
    icon: '🔒',
    title: 'Role-Based Access',
    desc: 'Employers and job seekers get separate, tailored experiences.',
  },
  {
    icon: '🌍',
    title: 'Global Reach',
    desc: 'Browse thousands of opportunities spanning every industry and location.',
  },
]

export default function Home() {
  return (
    <div className="app-wrapper">
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>

        <div className="container hero-content">
          <div className="hero-tag">
            <i className="bi bi-lightning-fill"></i>
            Your career, accelerated
          </div>

          <h1 className="hero-title">
            Find work that<br />
            <span className="accent-word">actually excites</span><br />
            you
          </h1>

          <p className="hero-subtitle">
            JobPortal connects ambitious professionals with companies
            building the future. Browse thousands of roles — remote, hybrid, on-site.
          </p>

          <div className="hero-actions">
            <Link to="/jobs" className="btn-primary-jp">
              Browse all jobs <i className="bi bi-arrow-right"></i>
            </Link>
            <Link to="/register" className="btn-secondary-jp">
              Post a job
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Jobs</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5K+</div>
              <div className="stat-label">Companies</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Job Seekers</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-label">Platform Features</span>
            <h2 className="section-title">Everything you need to<br />land your dream job</h2>
            <p style={{ maxWidth: '480px', margin: '0 auto', color: 'var(--text-muted)' }}>
              Built for speed, designed for clarity. JobPortal strips away the noise
              so you can focus on what matters.
            </p>
          </div>

          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className={`col-md-6 col-lg-4 fade-in fade-in-delay-${Math.min(i + 1, 4)}`}>
                <div className="feature-card">
                  <div className="feature-icon-wrap">{f.icon}</div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '0 0 100px' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(255,101,132,0.1) 100%)',
            border: '1px solid var(--border-accent)',
            borderRadius: '24px',
            padding: '70px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(108,99,255,0.2), transparent 70%)',
              borderRadius: '50%',
            }}></div>

            <h2 className="section-title" style={{ marginBottom: '14px' }}>
              Ready to make your move?
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '36px', maxWidth: '440px', margin: '0 auto 36px' }}>
              Join thousands of professionals who found their next opportunity through JobPortal.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary-jp">
                Create free account
              </Link>
              <Link to="/jobs" className="btn-secondary-jp">
                Browse open roles
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
