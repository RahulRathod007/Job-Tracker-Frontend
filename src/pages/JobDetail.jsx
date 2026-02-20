import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { getAllJobs, applyJob, getUserApplications } from '../services/api'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [error, setError] = useState('')
  const [justApplied, setJustApplied] = useState(false)

  useEffect(() => {
    getAllJobs()
      .then(res => {
        const all = Array.isArray(res?.data) ? res.data : []
        const found = all.find(j => String(j.jobId) === String(id))
        found ? setJob(found) : setError('Job not found.')
      })
      .catch(() => setError('Could not load job. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [id])

  // Check if user already applied
  useEffect(() => {
    if (!user || !isRole(user, 'jobseeker')) return
    getUserApplications(user.userId)
      .then(res => {
        const apps = Array.isArray(res.data) ? res.data : []
        setHasApplied(apps.some(a => String(a.job?.jobId) === String(id)))
      })
      .catch(() => {})
  }, [user, id])

  const handleApply = async () => {
    if (!user) { navigate('/login'); return }
    if (!isRole(user, 'jobseeker')) { setApplyError('Only job seekers can apply.'); return }
    if (hasApplied) return

    setApplying(true)
    setApplyError('')
    try {
      await applyJob(id, user.userId)
      setHasApplied(true)
      setJustApplied(true)
    } catch (err) {
      const status = err?.response?.status
      const msg = err?.response?.data?.error || ''
      if (status === 409 || (status === 500 && !msg)) {
        setHasApplied(true)
        setApplyError('You have already applied to this job.')
      } else {
        setApplyError(msg || 'Application failed. Please try again.')
      }
    } finally {
      setApplying(false)
    }
  }

  if (loading) return (
    <div className="app-wrapper"><Navbar />
      <main className="page-content"><Spinner message="Loading job..." /></main>
    <Footer /></div>
  )

  if (error || !job) return (
    <div className="app-wrapper"><Navbar />
      <main className="page-content">
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon"><i className="bi bi-emoji-frown" style={{ fontSize: '3rem', opacity: 0.3 }}></i></div>
            <h3>{error || 'Job not found'}</h3>
            <Link to="/jobs" className="btn-secondary-jp" style={{ marginTop: '20px' }}>← Back to Jobs</Link>
          </div>
        </div>
      </main>
    <Footer /></div>
  )

  const formattedSalary = job.salary ? `₹${Number(job.salary).toLocaleString()} / yr` : 'Not disclosed'
  const postedDate = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown'

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="page-content">
        <div className="container" style={{ maxWidth: '860px' }}>

          <div style={{ marginBottom: '28px' }}>
            <Link to="/jobs" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <i className="bi bi-arrow-left"></i> All Jobs
            </Link>
          </div>

          {/* Header */}
          <div className="job-detail-header fade-in">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
              <div className="jd-company-logo">
                {(job.companyName || 'JP').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', marginBottom: '6px' }}>{job.title}</h1>
                <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '1rem' }}>{job.companyName}</div>
              </div>
              <div>
                <span className="salary-badge">{formattedSalary}</span>
              </div>
            </div>

            <div className="job-detail-meta">
              {[
                { icon: 'bi-geo-alt-fill', label: 'Location', value: job.location || 'Not specified' },
                { icon: 'bi-calendar3', label: 'Posted On', value: postedDate },
                ...(job.employer?.name ? [{ icon: 'bi-person-fill', label: 'Posted By', value: job.employer.name }] : []),
              ].map(m => (
                <div key={m.label} className="meta-item">
                  <span className="meta-icon"><i className={`bi ${m.icon}`}></i></span>
                  <div>
                    <div className="meta-label">{m.label}</div>
                    <div className="meta-value">{m.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="fade-in fade-in-delay-1" style={{ marginBottom: '28px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.15rem' }}>Job Description</h3>
            <div className="job-description-box">
              {job.description || 'No description provided.'}
            </div>
          </div>

          {/* Apply card */}
          <div className="apply-card fade-in fade-in-delay-2">
            {applyError && (
              <div className="alert-jp" style={{ marginBottom: '20px', textAlign: 'left' }}>
                <i className="bi bi-exclamation-circle-fill"></i> {applyError}
              </div>
            )}

            {hasApplied ? (
              <>
                <div className="apply-success-icon">
                  <i className="bi bi-check-lg" style={{ fontSize: '1.8rem', color: 'var(--accent-3)' }}></i>
                </div>
                <h3 style={{ color: 'var(--accent-3)' }}>
                  {justApplied ? 'Application Submitted! 🎉' : 'Already Applied'}
                </h3>
                <p>{justApplied ? "Great choice! You've successfully applied." : "You've already applied for this position."}</p>
                <Link to="/my-applications" className="btn-primary-jp" style={{ marginTop: '8px', justifyContent: 'center' }}>
                  <i className="bi bi-list-check"></i> Track Applications
                </Link>
              </>
            ) : user && isRole(user, 'jobseeker') ? (
              <>
                <h3>Interested in this role?</h3>
                <p>Apply now and take the next step in your career journey.</p>
                <button
                  className="btn-primary-jp"
                  onClick={handleApply}
                  disabled={applying}
                  style={{ fontSize: '1rem', padding: '15px 40px', justifyContent: 'center' }}
                >
                  {applying ? (
                    <><span className="btn-spinner"></span> Applying...</>
                  ) : (
                    <><i className="bi bi-send-fill"></i> Apply Now</>
                  )}
                </button>
              </>
            ) : user && isRole(user, 'employer') ? (
              <>
                <h3>Your listing is live</h3>
                <p>Candidates can see and apply to this job. Manage it from your dashboard.</p>
                <Link to="/dashboard" className="btn-secondary-jp">Go to Dashboard</Link>
              </>
            ) : (
              <>
                <h3>Ready to apply?</h3>
                <p>Sign in to apply for this position in one click.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="btn-primary-jp" onClick={() => navigate('/login')} style={{ fontSize: '1rem', padding: '14px 36px' }}>
                    <i className="bi bi-box-arrow-in-right"></i> Sign in to Apply
                  </button>
                  <Link to="/register" className="btn-secondary-jp">Create account</Link>
                </div>
              </>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
