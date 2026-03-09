import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import { getAllJobs, getUserApplications, deleteJob, getJobApplications, updateJob } from '../services/api'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

const JOB_TYPES  = ['Full Time', 'Part Time', 'Internship', 'Remote', 'Contract']
const TYPE_ICONS = {
  'Full Time': 'bi-briefcase-fill', 'Part Time': 'bi-clock-fill',
  'Internship': 'bi-mortarboard-fill', 'Remote': 'bi-house-fill', 'Contract': 'bi-file-earmark-text-fill',
}
const STATUS_CONFIG = {
  APPLIED:             { label: 'Applied',             bg: 'rgba(108,99,255,0.12)', color: '#a29bfe', border: 'rgba(108,99,255,0.3)' },
  RESUME_VIEWED:       { label: 'Resume Viewed',       bg: 'rgba(247,183,49,0.12)', color: '#f7b731', border: 'rgba(247,183,49,0.3)' },
  SHORTLISTED:         { label: 'Shortlisted',         bg: 'rgba(67,233,123,0.12)', color: '#43e97b', border: 'rgba(67,233,123,0.3)' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', bg: 'rgba(0,210,255,0.12)',  color: '#00d2ff', border: 'rgba(0,210,255,0.3)'  },
  HIRED:               { label: 'Hired 🎉',            bg: 'rgba(67,233,123,0.15)', color: '#43e97b', border: 'rgba(67,233,123,0.4)' },
  REJECTED:            { label: 'Rejected',            bg: 'rgba(255,101,132,0.1)', color: '#ff6584', border: 'rgba(255,101,132,0.3)' },
}

// ── Deadline helpers ──────────────────────────────────────────────────────
// Returns true if deadline has passed (application closed)
const isExpiredJob = (job) => {
  if (!job.deadline) return false
  const today    = new Date(); today.setHours(0, 0, 0, 0)
  const deadline = new Date(job.deadline); deadline.setHours(0, 0, 0, 0)
  return deadline < today
}

// Days remaining until deadline  (negative = already expired)
const daysUntilDeadline = (deadline) => {
  if (!deadline) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const dl    = new Date(deadline); dl.setHours(0, 0, 0, 0)
  return Math.round((dl - today) / 86400000)
}

// Salary display helper
const formatSalary = (val) => {
  if (!val) return ''
  const n = parseFloat(val)
  if (isNaN(n)) return ''
  return n < 1000 ? `${n} LPA` : `₹${Number(n).toLocaleString('en-IN')}/yr`
}

// ── Edit Job Modal ────────────────────────────────────────────────────────
function EditJobModal({ job, onClose, onSaved }) {
  const todayStr = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    title:       job.title       || '',
    companyName: job.companyName || '',
    location:    job.location    || '',
    salary:      job.salary != null ? String(job.salary) : '',
    jobType:     job.jobType     || 'Full Time',
    description: job.description || '',
    deadline:    job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
  })
  const [salaryError, setSalaryError] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  const handleChange       = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handleSalaryChange = e => {
    const v = e.target.value
    if (v === '' || /^\d*\.?\d*$/.test(v)) { setForm(p => ({ ...p, salary: v })); setSalaryError('') }
  }
  const handleSalaryBlur = () => {
    if (!form.salary) return
    const n = parseFloat(form.salary)
    if (isNaN(n) || n <= 0) setSalaryError('Enter a valid salary e.g. 2.55, 12.5')
    else setSalaryError('')
  }

  const handleSave = async e => {
    e.preventDefault()
    if (salaryError) return
    setSaving(true); setError('')
    try {
      const res = await updateJob(job.jobId, {
        ...form,
        salary:   form.salary   ? parseFloat(form.salary) : null,
        deadline: form.deadline ? form.deadline           : null,
      })
      onSaved(res.data)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update. Try again.')
    } finally { setSaving(false) }
  }

  // Deadline preview in modal
  const dlDays  = form.deadline ? daysUntilDeadline(form.deadline) : null
  const dlColor = dlDays === null ? null : dlDays < 0 ? '#ff6584' : dlDays === 0 ? '#ff6584' : dlDays <= 7 ? '#f7b731' : '#43e97b'
  const dlLabel = dlDays === null ? null : dlDays < 0 ? 'Already expired' : dlDays === 0 ? 'Closes today' : `${dlDays} day${dlDays !== 1 ? 's' : ''} left`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Edit Listing</div>
            <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Update Job Details</h4>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>

        {error && <div className="alert-jp" style={{ margin: '0 0 16px' }}><i className="bi bi-exclamation-circle-fill" /> {error}</div>}

        <form onSubmit={handleSave}>

          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group-jp" style={{ margin: 0 }}>
              <label className="form-label-jp">Job Title</label>
              <input type="text" name="title" className="form-control-jp" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group-jp" style={{ margin: 0 }}>
              <label className="form-label-jp">Company Name</label>
              <input type="text" name="companyName" className="form-control-jp" value={form.companyName} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group-jp" style={{ margin: 0 }}>
              <label className="form-label-jp">Location</label>
              <input type="text" name="location" className="form-control-jp" value={form.location} onChange={handleChange} required />
            </div>
            <div className="form-group-jp" style={{ margin: 0 }}>
              <label className="form-label-jp">Salary — LPA or ₹/yr (optional)</label>
              <input type="text" inputMode="decimal" name="salary"
                className={`form-control-jp ${salaryError ? 'input-error' : ''}`}
                value={form.salary} onChange={handleSalaryChange} onBlur={handleSalaryBlur}
                placeholder="e.g. 2.55 or 1200000" />
              {salaryError && <div className="field-error"><i className="bi bi-exclamation-circle" /> {salaryError}</div>}
              {form.salary && !salaryError && (
                <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>
                  <i className="bi bi-tag-fill" style={{ marginRight: '4px' }} />Shows as: {formatSalary(form.salary)}
                </div>
              )}
            </div>
          </div>

          {/* Deadline field */}
          <div className="form-group-jp">
            <label className="form-label-jp">
              <i className="bi bi-calendar-x" style={{ marginRight: '6px', color: 'var(--accent-2)' }} />
              Application Deadline
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: '6px' }}>(optional)</span>
            </label>
            <input type="date" name="deadline" className="form-control-jp"
              value={form.deadline} onChange={handleChange} style={{ colorScheme: 'dark' }} />
            {dlLabel && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '0.78rem', fontWeight: 700, padding: '3px 12px', borderRadius: '100px',
                  background: `${dlColor}18`, border: `1px solid ${dlColor}35`, color: dlColor,
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                }}>
                  <i className="bi bi-hourglass-split" />{dlLabel}
                </span>
              </div>
            )}
          </div>

          <div className="form-group-jp">
            <label className="form-label-jp">Job Type</label>
            <div className="postjob-type-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {JOB_TYPES.map(type => (
                <button key={type} type="button"
                  onClick={() => setForm(p => ({ ...p, jobType: type }))}
                  className={`postjob-type-btn ${form.jobType === type ? 'postjob-type-btn-active' : ''}`}
                  style={{ padding: '8px 6px', fontSize: '0.75rem' }}>
                  <i className={`bi ${TYPE_ICONS[type]}`} />{type}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group-jp">
            <label className="form-label-jp">Job Description</label>
            <textarea name="description" className="form-control-jp" value={form.description} onChange={handleChange} rows={6} required />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn-secondary-jp" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-primary-jp" disabled={saving} style={{ flex: 2, justifyContent: 'center' }}>
              {saving ? <><span className="btn-spinner" /> Saving...</> : <><i className="bi bi-check-circle-fill" /> Save Changes</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const [jobs,            setJobs]            = useState([])
  const [applications,    setApplications]    = useState([])
  const [applicantCounts, setApplicantCounts] = useState({})
  const [loading,         setLoading]         = useState(true)
  const [deletingId,      setDeletingId]      = useState(null)
  const [editingJob,      setEditingJob]      = useState(null)
  const [filter,          setFilter]          = useState('all') // 'all' | 'live' | 'expired'

  if (!user) return <Navigate to="/login" replace />
  const isEmployer = isRole(user, 'employer')

  useEffect(() => {
    const load = async () => {
      try {
        if (isEmployer) {
          const res  = await getAllJobs()
          const all  = Array.isArray(res.data) ? res.data : []
          const mine = all.filter(j => j.employer?.userId === user.userId)
          setJobs(mine)
          const counts = await Promise.all(
            mine.map(async j => {
              try { const r = await getJobApplications(j.jobId); return [j.jobId, Array.isArray(r.data) ? r.data.length : 0] }
              catch { return [j.jobId, 0] }
            })
          )
          setApplicantCounts(Object.fromEntries(counts))
        } else {
          const res = await getUserApplications(user.userId)
          setApplications(Array.isArray(res.data) ? res.data : [])
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [user.userId, isEmployer])

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job listing? This will also remove all applications.')) return
    setDeletingId(jobId)
    try {
      await deleteJob(jobId)
      setJobs(prev => prev.filter(j => j.jobId !== jobId))
    } catch { alert('Failed to delete job. Please try again.') }
    finally { setDeletingId(null) }
  }

  const handleJobSaved = (updatedJob) =>
    setJobs(prev => prev.map(j => j.jobId === updatedJob.jobId ? updatedJob : j))

  const greeting = () => {
    const hr = new Date().getHours()
    return hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'
  }

  // ── Filter counts ─────────────────────────────────────────────
  const liveCount    = jobs.filter(j => !isExpiredJob(j)).length
  const expiredCount = jobs.filter(j =>  isExpiredJob(j)).length

  const visibleJobs = jobs.filter(j => {
    if (filter === 'live')    return !isExpiredJob(j)
    if (filter === 'expired') return  isExpiredJob(j)
    return true
  })

  return (
    <div className="app-wrapper">
      <Navbar />

      {editingJob && (
        <EditJobModal job={editingJob} onClose={() => setEditingJob(null)} onSaved={handleJobSaved} />
      )}

      <main className="page-content">
        <div className="container">

          {/* Welcome */}
          <div className="fade-in" style={{ marginBottom: '40px' }}>
            <span className="section-label">Dashboard</span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '10px' }}>
              {greeting()}, {user.name.split(' ')[0]}! 👋
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className={isEmployer ? 'badge-jp badge-employer' : 'badge-jp badge-jobseeker'}>
                <i className={`bi bi-${isEmployer ? 'building' : 'person'}`} />
                {isEmployer ? 'Employer' : 'Job Seeker'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row g-4 mb-5">
            {isEmployer ? (
              <>
                <div className="col-md-4"><Link to="/post-job" className="dashboard-action-card"><div className="dashboard-icon dashboard-icon-purple"><i className="bi bi-plus-circle-fill" /></div><div>Post a Job</div><small>Create a new listing</small></Link></div>
                <div className="col-md-4"><Link to="/jobs" className="dashboard-action-card"><div className="dashboard-icon dashboard-icon-pink"><i className="bi bi-briefcase-fill" /></div><div>Browse Jobs</div><small>See all listings</small></Link></div>
                <div className="col-md-4"><Link to="/profile" className="dashboard-action-card"><div className="dashboard-icon dashboard-icon-green"><i className="bi bi-person-fill" /></div><div>My Profile</div><small>Update settings</small></Link></div>
              </>
            ) : (
              <>
                <div className="col-md-4"><Link to="/jobs" className="dashboard-action-card"><div className="dashboard-icon dashboard-icon-purple"><i className="bi bi-search" /></div><div>Find Jobs</div><small>Browse open roles</small></Link></div>
                <div className="col-md-4"><Link to="/my-applications" className="dashboard-action-card"><div className="dashboard-icon dashboard-icon-green"><i className="bi bi-list-check" /></div><div>Applications</div><small>{applications.length} submitted</small></Link></div>
                <div className="col-md-4"><Link to="/profile" className="dashboard-action-card"><div className="dashboard-icon dashboard-icon-pink"><i className="bi bi-file-earmark-person-fill" /></div><div>My Profile</div><small>{user.cvFilename ? 'CV uploaded ✓' : 'Upload your CV'}</small></Link></div>
              </>
            )}
          </div>

          {/* ── Employer: My Jobs ────────────────────────────────── */}
          {isEmployer && (
            <div className="fade-in">

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>My Job Listings <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1rem' }}>({jobs.length})</span></h3>
                <Link to="/post-job" className="btn-primary-jp" style={{ fontSize: '0.88rem', padding: '8px 18px' }}>
                  <i className="bi bi-plus" /> Post New
                </Link>
              </div>

              {/* ── Filter Tabs ─────────────────────────────────── */}
              {!loading && jobs.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all',     label: 'All Jobs', count: jobs.length,   dot: null },
                    { key: 'live',    label: 'Live',     count: liveCount,     dot: '#43e97b' },
                    { key: 'expired', label: 'Expired',  count: expiredCount,  dot: '#ff6584' },
                  ].map(tab => {
                    const active = filter === tab.key
                    return (
                      <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '9px 20px', borderRadius: '100px', cursor: 'pointer',
                        fontWeight: 700, fontSize: '0.84rem', transition: 'all 0.2s',
                        border: active ? 'none' : '1px solid var(--border)',
                        background: active ? 'var(--accent)' : 'var(--bg-card)',
                        color: active ? '#fff' : 'var(--text-secondary)',
                        boxShadow: active ? '0 4px 14px rgba(108,99,255,0.3)' : 'none',
                      }}>
                        {/* Colored dot for Live / Expired */}
                        {tab.dot && (
                          <span style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            background: active ? '#fff' : tab.dot,
                            flexShrink: 0,
                          }} />
                        )}
                        {tab.label}
                        {/* Count pill */}
                        <span style={{
                          background: active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)',
                          color: active ? '#fff' : 'var(--text-muted)',
                          padding: '1px 9px', borderRadius: '100px', fontSize: '0.76rem', fontWeight: 700,
                        }}>
                          {tab.count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* ── Job Cards ────────────────────────────────────── */}
              {loading ? <Spinner message="Loading your jobs..." /> :
               jobs.length === 0 ? (
                <div className="empty-state" style={{ padding: '48px' }}>
                  <div className="empty-icon"><i className="bi bi-briefcase" style={{ fontSize: '2.5rem', opacity: 0.2 }} /></div>
                  <h4>No jobs posted yet</h4>
                  <p>Post your first job to start receiving applications.</p>
                  <Link to="/post-job" className="btn-primary-jp" style={{ marginTop: '16px', justifyContent: 'center' }}>
                    <i className="bi bi-plus" /> Post a Job
                  </Link>
                </div>
               ) : visibleJobs.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <div className="empty-icon">
                    <i className={`bi ${filter === 'expired' ? 'bi-calendar-x' : 'bi-check-circle'}`} style={{ fontSize: '2.5rem', opacity: 0.2 }} />
                  </div>
                  <h4>{filter === 'expired' ? 'No expired listings' : 'No live listings'}</h4>
                  <p style={{ color: 'var(--text-muted)' }}>
                    {filter === 'expired' ? 'None of your jobs have passed their deadline yet.' : 'All your jobs have expired. Post a new one or extend a deadline.'}
                  </p>
                  <button onClick={() => setFilter('all')} className="btn-secondary-jp" style={{ marginTop: '12px' }}>
                    Show all listings
                  </button>
                </div>
               ) : (
                <div className="row g-4">
                  {visibleJobs.map((job, i) => {
                    const count    = applicantCounts[job.jobId] ?? '...'
                    const expired  = isExpiredJob(job)
                    const days     = daysUntilDeadline(job.deadline)

                    // Deadline pill styling
                    const pillColor = days === null   ? null
                      : days < 0   ? '#ff6584'
                      : days === 0 ? '#ff6584'
                      : days <= 3  ? '#ff6584'
                      : days <= 7  ? '#f7b731'
                      : '#43e97b'

                    const pillLabel = days === null   ? null
                      : days < 0   ? `Closed ${Math.abs(days)}d ago`
                      : days === 0 ? 'Closes today'
                      : days === 1 ? '1 day left'
                      : `${days} days left`

                    return (
                      <div key={job.jobId} className={`col-md-6 fade-in fade-in-delay-${Math.min(i+1,4)}`}>
                        <div className={`employer-job-card ${expired ? 'employer-job-card-expired' : ''}`}>

                          {/* ── Top accent bar ── */}
                          <div className={`employer-job-top-bar ${expired ? 'employer-job-top-bar-expired' : ''}`} />

                          {/* ── Card Body ── */}
                          <div className="employer-job-body">

                            {/* Title + Badges */}
                            <div className="employer-job-header">
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="employer-job-title">{job.title}</div>
                                <div className="employer-job-company">{job.companyName}</div>
                              </div>
                              <div className="employer-job-badges">
                                {expired ? (
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                    fontSize: '0.7rem', fontWeight: 800, padding: '4px 11px',
                                    borderRadius: '100px', whiteSpace: 'nowrap', letterSpacing: '0.4px',
                                    background: 'rgba(255,101,132,0.1)', color: '#ff6584',
                                    border: '1px solid rgba(255,101,132,0.25)',
                                  }}>
                                    <i className="bi bi-x-circle-fill" style={{ fontSize: '0.6rem' }} />
                                    Closed
                                  </span>
                                ) : (
                                  <span className="employer-job-live-badge">
                                    <i className="bi bi-circle-fill" style={{ fontSize: '0.42rem' }} />
                                    Live
                                  </span>
                                )}
                                {job.jobType && (
                                  <span style={{
                                    fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px',
                                    borderRadius: '100px', whiteSpace: 'nowrap',
                                    background: 'rgba(108,99,255,0.1)', color: '#a29bfe',
                                    border: '1px solid rgba(108,99,255,0.2)',
                                  }}>
                                    {job.jobType}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Meta tags */}
                            <div className="employer-job-meta">
                              {job.location   && <span className="job-tag"><i className="bi bi-geo-alt" /> {job.location}</span>}
                              {job.salary     && <span className="job-tag"><i className="bi bi-currency-rupee" /> {formatSalary(job.salary)}</span>}
                              {job.postedDate && <span className="job-tag"><i className="bi bi-calendar3" /> {new Date(job.postedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>}
                            </div>

                            {/* Deadline pill — only if deadline is set */}
                            {pillLabel && (
                              <div style={{ marginBottom: '14px' }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  fontSize: '0.75rem', fontWeight: 700, padding: '5px 13px',
                                  borderRadius: '100px',
                                  background: `${pillColor}12`,
                                  border: `1px solid ${pillColor}28`,
                                  color: pillColor,
                                }}>
                                  <i className={`bi ${expired ? 'bi-calendar-x-fill' : days !== null && days <= 3 ? 'bi-alarm-fill' : 'bi-hourglass-split'}`} style={{ fontSize: '0.7rem' }} />
                                  {pillLabel}
                                </span>
                              </div>
                            )}

                            {/* Applicants */}
                            <div className="employer-job-stats">
                              <Link to={`/jobs/${job.jobId}/applicants`} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px', borderRadius: '10px', textDecoration: 'none',
                                background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)',
                                color: '#a29bfe', fontSize: '0.83rem', fontWeight: 600,
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.16)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.2)' }}
                              >
                                <i className="bi bi-people-fill" />
                                <span>{count} {count === 1 ? 'Applicant' : 'Applicants'}</span>
                                <i className="bi bi-arrow-right" style={{ fontSize: '0.72rem', marginLeft: '2px' }} />
                              </Link>
                            </div>

                            {/* Expired info bar */}
                            {expired && (
                              <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                flexWrap: 'wrap', gap: '8px', marginTop: '12px',
                                background: 'rgba(255,101,132,0.06)',
                                border: '1px solid rgba(255,101,132,0.15)',
                                borderRadius: '10px', padding: '10px 14px',
                              }}>
                                <span style={{ fontSize: '0.79rem', color: 'rgba(255,101,132,0.85)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                                  <i className="bi bi-info-circle-fill" />
                                  No new applicants can apply.
                                </span>
                                <button onClick={() => setEditingJob(job)} style={{
                                  background: 'none',
                                  border: '1px solid rgba(255,101,132,0.3)',
                                  color: '#ff6584', borderRadius: '8px',
                                  padding: '4px 12px', fontSize: '0.77rem',
                                  fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                                }}>
                                  <i className="bi bi-calendar-plus" />
                                  Extend Deadline
                                </button>
                              </div>
                            )}

                          </div>

                          {/* ── Card Footer: action buttons ── */}
                          <div className="employer-job-footer">
                            <div className="employer-job-actions">
                              <Link to={`/jobs/${job.jobId}`} className="btn-secondary-jp" style={{ fontSize: '0.81rem', padding: '7px 13px' }}>
                                <i className="bi bi-eye" /> View
                              </Link>
                              <button onClick={() => setEditingJob(job)} className="btn-secondary-jp"
                                style={{ fontSize: '0.81rem', padding: '7px 13px', background: 'rgba(247,183,49,0.08)', borderColor: 'rgb(220, 177, 34)', color: '#60502d' }}>
                                <i className="bi bi-pencil-fill" /> Edit
                              </button>
                              <Link to={`/jobs/${job.jobId}/applicants`} className="btn-secondary-jp" style={{ fontSize: '0.81rem', padding: '7px 13px' }}>
                                <i className="bi bi-people" /> Applicants
                              </Link>
                              <button onClick={() => handleDelete(job.jobId)} disabled={deletingId === job.jobId}
                                className="btn-danger-jp" style={{ fontSize: '0.81rem', padding: '7px 13px', marginLeft: 'auto' }}>
                                {deletingId === job.jobId
                                  ? <><span className="btn-spinner" /> Deleting...</>
                                  : <><i className="bi bi-trash" /> Delete</>}
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    )
                  })}
                </div>
               )}
            </div>
          )}

          {/* ── Jobseeker: Recent Applications ───────────────────── */}
          {!isEmployer && !loading && applications.length > 0 && (
            <div className="fade-in fade-in-delay-2">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3>Recent Applications</h3>
                <Link to="/my-applications" style={{ color: 'var(--accent)', fontSize: '0.88rem' }}>View all →</Link>
              </div>
              <div className="row g-4">
                {applications.slice(0, 4).map((app, i) => {
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED
                  return (
                    <div key={app.applicationId} className={`col-md-6 fade-in fade-in-delay-${i+1}`}>
                      <div className="application-card">
                        <div className="application-card-top">
                          <div>
                            <h5 className="application-title">{app.job?.title}</h5>
                            <div className="application-company">{app.job?.companyName}</div>
                          </div>
                          <span className="status-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="application-meta">
                          {app.job?.location && <span className="job-tag"><i className="bi bi-geo-alt" /> {app.job.location}</span>}
                          <span className="job-tag"><i className="bi bi-calendar3" /> {new Date(app.applyDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}