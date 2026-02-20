import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import Navbar from '../components/Navbar'

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'JOBSEEKER' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))
  const selectRole = role => setFormData(p => ({ ...p, role }))

  const handleSubmit = async e => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(formData)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      const data = err?.response?.data
      if (typeof data === 'object' && data !== null) {
        // Field validation errors (e.g. { name: 'required', email: 'invalid' })
        setErrors(data)
      } else {
        setErrors({ _global: data?.error || 'Registration failed. Please try again.' })
      }
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
            <div className="col-md-8 col-lg-6">
              <div className="jp-form-card fade-in" style={{ maxWidth: '520px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                  <div className="form-icon-wrap">✨</div>
                  <h2 className="jp-form-title">Create your account</h2>
                  <p className="jp-form-subtitle">Join thousands of professionals on JobPortal</p>
                </div>

                {errors._global && (
                  <div className="alert-jp" style={{ marginBottom: '20px' }}>
                    <i className="bi bi-exclamation-circle-fill"></i> {errors._global}
                  </div>
                )}

                {/* Role toggle */}
                <div style={{ marginBottom: '24px' }}>
                  <label className="form-label-jp" style={{ marginBottom: '12px' }}>I want to</label>
                  <div className="role-toggle">
                    {[
                      { value: 'JOBSEEKER', icon: '🎯', label: 'Find a Job', desc: 'Browse & apply to roles' },
                      { value: 'EMPLOYER',  icon: '🏢', label: 'Hire Talent', desc: 'Post & manage jobs' },
                    ].map(r => (
                      <div key={r.value}
                        className={`role-option ${formData.role === r.value ? 'selected' : ''}`}
                        onClick={() => selectRole(r.value)}>
                        <span className="role-icon">{r.icon}</span>
                        <div className="role-label">{r.label}</div>
                        <div className="role-desc">{r.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {[
                    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                    { name: 'password', label: 'Password', type: 'password', placeholder: 'Minimum 6 characters', minLength: 6 },
                  ].map(f => (
                    <div key={f.name} className="form-group-jp">
                      <label className="form-label-jp">{f.label}</label>
                      <input
                        type={f.type} name={f.name} className={`form-control-jp ${errors[f.name] ? 'input-error' : ''}`}
                        value={formData[f.name]} onChange={handleChange}
                        placeholder={f.placeholder} required minLength={f.minLength}
                      />
                      {errors[f.name] && <div className="field-error"><i className="bi bi-exclamation-circle"></i> {errors[f.name]}</div>}
                    </div>
                  ))}

                  <button type="submit" className="btn-primary-jp" disabled={loading}
                    style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '14px', marginTop: '8px' }}>
                    {loading ? <><span className="btn-spinner"></span> Creating account...</> : <><i className="bi bi-person-plus-fill"></i> Create Account</>}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '28px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in →</Link>
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
