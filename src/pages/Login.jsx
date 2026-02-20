import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/api'
import Navbar from '../components/Navbar'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registered = location.state?.registered

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(formData)
      loginUser(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="page-content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-5">
              <div className="jp-form-card fade-in" style={{ maxWidth: '480px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                  <div className="form-icon-wrap">🔑</div>
                  <h2 className="jp-form-title">Welcome back</h2>
                  <p className="jp-form-subtitle">Sign in to your JobPortal account</p>
                </div>

                {registered && (
                  <div className="alert-jp alert-jp-success" style={{ marginBottom: '20px' }}>
                    <i className="bi bi-check-circle-fill"></i> Account created! Please sign in.
                  </div>
                )}

                {error && (
                  <div className="alert-jp" style={{ marginBottom: '20px' }}>
                    <i className="bi bi-exclamation-circle-fill"></i> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group-jp">
                    <label className="form-label-jp">Email Address</label>
                    <input type="email" name="email" className="form-control-jp"
                      value={formData.email} onChange={handleChange}
                      placeholder="you@example.com" required />
                  </div>
                  <div className="form-group-jp">
                    <label className="form-label-jp">Password</label>
                    <input type="password" name="password" className="form-control-jp"
                      value={formData.password} onChange={handleChange}
                      placeholder="••••••••" required />
                  </div>
                  <button type="submit" className="btn-primary-jp" disabled={loading}
                    style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '14px', marginTop: '8px' }}>
                    {loading ? <><span className="btn-spinner"></span> Signing in...</> : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '28px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one →</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
