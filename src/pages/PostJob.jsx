import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { postJob } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

export default function PostJob() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ title: '', description: '', salary: '', location: '', companyName: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!user) return <Navigate to="/login" replace />
  if (!isRole(user, 'employer')) return <Navigate to="/dashboard" replace />

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await postJob({ ...formData, salary: formData.salary ? Number(formData.salary) : null }, user.userId)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      const data = err?.response?.data
      if (typeof data === 'object') setErrors(data)
      else setErrors({ _global: data?.error || 'Failed to post job. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="page-content">
        <div className="container" style={{ maxWidth: '740px' }}>
          <div className="page-header fade-in">
            <span className="section-label">Employer</span>
            <h1>Post a new job</h1>
            <p>Fill in the details below to attract the right candidates</p>
          </div>

          {success && (
            <div className="alert-jp alert-jp-success fade-in" style={{ marginBottom: '28px', fontSize: '1rem' }}>
              <i className="bi bi-check-circle-fill"></i> Job posted! Redirecting to dashboard...
            </div>
          )}
          {errors._global && (
            <div className="alert-jp fade-in" style={{ marginBottom: '20px' }}>
              <i className="bi bi-exclamation-circle-fill"></i> {errors._global}
            </div>
          )}

          <div className="jp-form-card fade-in fade-in-delay-1">
            <form onSubmit={handleSubmit}>
              {[
                { name: 'title', label: 'Job Title', placeholder: 'e.g. Senior Frontend Engineer', required: true },
                { name: 'companyName', label: 'Company Name', placeholder: 'e.g. Acme Corp', required: true },
              ].map(f => (
                <div key={f.name} className="form-group-jp">
                  <label className="form-label-jp">{f.label}</label>
                  <input type="text" name={f.name} className={`form-control-jp ${errors[f.name] ? 'input-error' : ''}`}
                    value={formData[f.name]} onChange={handleChange} placeholder={f.placeholder} required={f.required} />
                  {errors[f.name] && <div className="field-error">{errors[f.name]}</div>}
                </div>
              ))}

              <div className="form-row">
                <div className="form-group-jp" style={{ margin: 0 }}>
                  <label className="form-label-jp">Location</label>
                  <input type="text" name="location" className={`form-control-jp ${errors.location ? 'input-error' : ''}`}
                    value={formData.location} onChange={handleChange} placeholder="e.g. Remote, Pune, Mumbai" required />
                  {errors.location && <div className="field-error">{errors.location}</div>}
                </div>
                <div className="form-group-jp" style={{ margin: 0 }}>
                  <label className="form-label-jp">Annual Salary (₹, optional)</label>
                  <input type="number" name="salary" className="form-control-jp"
                    value={formData.salary} onChange={handleChange} placeholder="e.g. 1200000" min="0" />
                </div>
              </div>

              <div className="form-group-jp" style={{ marginTop: '20px' }}>
                <label className="form-label-jp">Job Description</label>
                <textarea name="description" className="form-control-jp" value={formData.description}
                  onChange={handleChange} rows={10}
                  placeholder="Describe responsibilities, requirements, benefits, work culture..." required />
              </div>

              {/* Live preview */}
              {(formData.title || formData.companyName) && (
                <div className="post-job-preview">
                  <strong style={{ color: 'var(--text-secondary)' }}>Preview: </strong>
                  {formData.title || '-'} at {formData.companyName || '-'}
                  {formData.location && ` · ${formData.location}`}
                  {formData.salary && ` · ₹${Number(formData.salary).toLocaleString()}/yr`}
                </div>
              )}

              <button type="submit" className="btn-primary-jp" disabled={loading || success}
                style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '15px' }}>
                {loading ? <><span className="btn-spinner"></span> Posting...</> : <><i className="bi bi-send-fill"></i> Publish Job Listing</>}
              </button>
            </form>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
