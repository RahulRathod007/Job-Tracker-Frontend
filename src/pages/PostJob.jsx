import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { postJob } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()
const JOB_TYPES = ['Full Time', 'Part Time', 'Internship', 'Remote', 'Contract']
const TYPE_ICONS = {
  'Full Time':  'bi-briefcase-fill',
  'Part Time':  'bi-clock-fill',
  'Internship': 'bi-mortarboard-fill',
  'Remote':     'bi-house-fill',
  'Contract':   'bi-file-earmark-text-fill',
}
const todayStr = () => new Date().toISOString().split('T')[0]

const formatSalary = (val) => {
  if (!val) return ''
  const num = parseFloat(val)
  if (isNaN(num)) return ''
  if (num < 1000) return `${num} LPA`
  return `₹${Number(num).toLocaleString('en-IN')}/yr`
}

export default function PostJob() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [formData, setFormData] = useState({
    title: '', description: '', salary: '',
    location: '', companyName: '', jobType: 'Full Time', deadline: '',
  })
  const [salaryError, setSalaryError] = useState('')
  const [errors,  setErrors]  = useState({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!user) return <Navigate to="/login" replace />
  if (!isRole(user, 'employer')) return <Navigate to="/dashboard" replace />

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

  // Salary: allow typing freely — only validate on blur
  const handleSalaryChange = (e) => {
    const val = e.target.value
    // Allow digits, one dot, nothing else
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setFormData(p => ({ ...p, salary: val }))
      setSalaryError('')
    }
  }

  const handleSalaryBlur = () => {
    if (!formData.salary) return
    const num = parseFloat(formData.salary)
    if (isNaN(num) || num <= 0) {
      setSalaryError('Please enter a valid salary (e.g. 2.55, 12.5, 1200000)')
    } else {
      setSalaryError('')
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (salaryError) return
    setErrors({})
    setLoading(true)
    try {
      await postJob(
        {
          ...formData,
          salary:   formData.salary   ? parseFloat(formData.salary) : null,
          deadline: formData.deadline ? formData.deadline            : null,
        },
        user.userId
      )
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

  const deadlineLabel = () => {
    if (!formData.deadline) return null
    const days = Math.ceil((new Date(formData.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 0)   return { text: 'Expired',       color: '#ff6584' }
    if (days === 0) return { text: 'Closes today!', color: '#ff6584' }
    if (days <= 7)  return { text: `${days}d left`, color: '#f7b731' }
    return { text: new Date(formData.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), color: '#43e97b' }
  }
  const dl = deadlineLabel()

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="page-content">
        <div className="container" style={{ maxWidth: '760px' }}>

          <div className="page-header fade-in">
            <span className="section-label">Employer</span>
            <h1>Post a new job</h1>
            <p>Fill in the details below to attract the right candidates</p>
          </div>

          {success && (
            <div className="alert-jp alert-jp-success fade-in" style={{ marginBottom: '28px', fontSize: '1rem' }}>
              <i className="bi bi-check-circle-fill" /> Job posted! Redirecting to dashboard...
            </div>
          )}
          {errors._global && (
            <div className="alert-jp fade-in" style={{ marginBottom: '20px' }}>
              <i className="bi bi-exclamation-circle-fill" /> {errors._global}
            </div>
          )}

          <div className="jp-form-card fade-in fade-in-delay-1">
            <form onSubmit={handleSubmit}>

              {[
                { name: 'title',       label: 'Job Title',    placeholder: 'e.g. Senior Frontend Engineer' },
                { name: 'companyName', label: 'Company Name', placeholder: 'e.g. Acme Corp' },
              ].map(f => (
                <div key={f.name} className="form-group-jp">
                  <label className="form-label-jp">{f.label}</label>
                  <input type="text" name={f.name}
                    className={`form-control-jp ${errors[f.name] ? 'input-error' : ''}`}
                    value={formData[f.name]} onChange={handleChange}
                    placeholder={f.placeholder} required />
                  {errors[f.name] && <div className="field-error">{errors[f.name]}</div>}
                </div>
              ))}

              <div className="form-row">
                <div className="form-group-jp" style={{ margin: 0 }}>
                  <label className="form-label-jp">Location</label>
                  <input type="text" name="location"
                    className={`form-control-jp ${errors.location ? 'input-error' : ''}`}
                    value={formData.location} onChange={handleChange}
                    placeholder="e.g. Remote, Pune, Mumbai" required />
                  {errors.location && <div className="field-error">{errors.location}</div>}
                </div>

                <div className="form-group-jp" style={{ margin: 0 }}>
                  <label className="form-label-jp">Salary — LPA (optional)</label>
                  {/* type="text" so browser never rounds or rejects decimal values */}
                  <input
                    type="text"
                    name="salary"
                    inputMode="decimal"
                    className={`form-control-jp ${salaryError ? 'input-error' : ''}`}
                    value={formData.salary}
                    onChange={handleSalaryChange}
                    onBlur={handleSalaryBlur}
                    placeholder="e.g. 2.55 or 12.5 or 1200000"
                  />
                  {salaryError && (
                    <div className="field-error"><i className="bi bi-exclamation-circle" /> {salaryError}</div>
                  )}
                  {formData.salary && !salaryError && (
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                      <i className="bi bi-tag-fill" style={{ marginRight: '4px' }} />
                      Shows as: {formatSalary(formData.salary)}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group-jp" style={{ marginTop: '20px' }}>
                <label className="form-label-jp">Job Type</label>
                <div className="postjob-type-grid">
                  {JOB_TYPES.map(type => (
                    <button key={type} type="button"
                      onClick={() => setFormData(p => ({ ...p, jobType: type }))}
                      className={`postjob-type-btn ${formData.jobType === type ? 'postjob-type-btn-active' : ''}`}>
                      <i className={`bi ${TYPE_ICONS[type]}`} />
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group-jp" style={{ marginTop: '20px' }}>
                <label className="form-label-jp">
                  <i className="bi bi-calendar-x" style={{ marginRight: '6px', color: 'var(--accent-2)' }} />
                  Application Deadline
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <input type="date" name="deadline" className="form-control-jp"
                  value={formData.deadline} onChange={handleChange}
                  min={todayStr()} style={{ colorScheme: 'dark' }} />
                {formData.deadline && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 600, padding: '3px 12px',
                      borderRadius: '100px', background: 'rgba(255,101,132,0.1)',
                      border: '1px solid rgba(255,101,132,0.25)', color: dl?.color || '#ff6584',
                    }}>
                      <i className="bi bi-hourglass-split" style={{ marginRight: '4px' }} />
                      {dl?.text}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Deadline visible to applicants on the job card
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group-jp" style={{ marginTop: '20px' }}>
                <label className="form-label-jp">Job Description</label>
                <textarea name="description" className="form-control-jp"
                  value={formData.description} onChange={handleChange} rows={10}
                  placeholder="Describe responsibilities, requirements, skills needed, benefits..."
                  required />
              </div>

              {(formData.title || formData.companyName) && (
                <div className="post-job-preview">
                  <strong style={{ color: 'var(--text-secondary)' }}>Preview: </strong>
                  {formData.title || '-'} at {formData.companyName || '-'}
                  {formData.location && ` · ${formData.location}`}
                  {formData.jobType  && ` · ${formData.jobType}`}
                  {formData.salary   && ` · ${formatSalary(formData.salary)}`}
                  {formData.deadline && ` · Deadline: ${new Date(formData.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </div>
              )}

              <button type="submit" className="btn-primary-jp" disabled={loading || success}
                style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '15px', marginTop: '8px' }}>
                {loading
                  ? <><span className="btn-spinner" /> Posting...</>
                  : <><i className="bi bi-send-fill" /> Publish Job Listing</>}
              </button>

            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}