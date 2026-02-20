import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import { getJobApplications, updateApplicationStatus, getAllJobs, getFileUrl } from '../services/api'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

const STATUS_CONFIG = {
  APPLIED:            { label: 'Applied',             bg: 'rgba(108,99,255,0.12)', color: '#a29bfe', border: 'rgba(108,99,255,0.3)',  icon: 'bi-send-fill' },
  RESUME_VIEWED:      { label: 'Resume Viewed',       bg: 'rgba(247,183,49,0.12)', color: '#f7b731', border: 'rgba(247,183,49,0.3)',  icon: 'bi-eye-fill' },
  SHORTLISTED:        { label: 'Shortlisted',         bg: 'rgba(67,233,123,0.12)', color: '#43e97b', border: 'rgba(67,233,123,0.3)',  icon: 'bi-star-fill' },
  INTERVIEW_SCHEDULED:{ label: 'Interview Scheduled', bg: 'rgba(0,210,255,0.12)',  color: '#00d2ff', border: 'rgba(0,210,255,0.3)',   icon: 'bi-calendar-check-fill' },
  REJECTED:           { label: 'Rejected',            bg: 'rgba(255,101,132,0.1)', color: '#ff6584', border: 'rgba(255,101,132,0.3)', icon: 'bi-x-circle-fill' },
}

const ACTIONS = [
  { status: 'RESUME_VIEWED',       label: 'Mark Resume Viewed',    icon: 'bi-eye',             color: '#f7b731' },
  { status: 'SHORTLISTED',         label: 'Shortlist',             icon: 'bi-star',            color: '#43e97b' },
  { status: 'INTERVIEW_SCHEDULED', label: 'Schedule Interview',    icon: 'bi-calendar-check',  color: '#00d2ff' },
  { status: 'REJECTED',            label: 'Reject',                icon: 'bi-x-circle',        color: '#ff6584' },
]

function ApplicantCard({ app, onStatusChange }) {
  const [updating, setUpdating] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const applicant = app.jobSeeker || app.user || {}
  const name      = applicant.name  || 'Unknown Applicant'
  const email     = applicant.email || '—'
  const cvFile    = applicant.cvFilename
  const picFile   = applicant.profilePicture
  const cvUrl     = cvFile ? getFileUrl(cvFile) : null
  const picUrl    = picFile ? getFileUrl(picFile) : null
  const initials  = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const cfg       = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED
  const applyDate = app.applyDate
    ? new Date(app.applyDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  const handleAction = async (status) => {
    setUpdating(status)
    try {
      await updateApplicationStatus(app.applicationId, status)
      onStatusChange(app.applicationId, status)
    } catch {
      alert('Failed to update status. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="jp-form-card fade-in" style={{
      marginBottom: '16px',
      border: `1px solid ${cfg.border}`,
      padding: '24px',
      transition: 'all 0.3s ease',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>

        {/* Avatar */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
          background: picUrl ? `url(${picUrl}) center/cover` : 'linear-gradient(135deg,#6c63ff,#00f5a0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1.1rem', color: '#fff',
          border: '2px solid var(--border-accent)',
        }}>
          {!picUrl && initials}
        </div>

        {/* Name + email */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
            {name}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <i className="bi bi-envelope" style={{ marginRight: '5px' }} />{email}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            <i className="bi bi-calendar3" style={{ marginRight: '5px' }} />Applied {applyDate}
          </div>
        </div>

        {/* Status badge */}
        <span style={{
          padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
          whiteSpace: 'nowrap',
        }}>
          <i className={`bi ${cfg.icon}`} style={{ marginRight: '5px' }} />
          {cfg.label}
        </span>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
            padding: '6px 14px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem',
          }}
        >
          {expanded ? 'Hide' : 'Actions'} <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`} />
        </button>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{
          marginTop: '20px', paddingTop: '20px',
          borderTop: '1px solid var(--border)',
          display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
        }}>

          {/* CV button */}
          {cvUrl ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-jp"
              style={{ fontSize: '0.85rem', padding: '8px 18px', textDecoration: 'none' }}
              onClick={() => {
                if (app.status === 'APPLIED') handleAction('RESUME_VIEWED')
              }}
            >
              <i className="bi bi-file-earmark-pdf-fill" style={{ color: '#ff6584' }} /> View CV / Resume
            </a>
          ) : (
            <span style={{
              fontSize: '0.82rem', color: 'var(--text-muted)',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '8px 16px',
            }}>
              <i className="bi bi-file-earmark-x" /> No CV uploaded
            </span>
          )}

          {/* Action buttons */}
          {ACTIONS.map(action => (
            <button
              key={action.status}
              disabled={app.status === action.status || !!updating}
              onClick={() => handleAction(action.status)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '8px 18px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 600,
                border: `1px solid ${action.color}44`,
                background: app.status === action.status ? `${action.color}22` : 'transparent',
                color: app.status === action.status ? action.color : 'var(--text-muted)',
                cursor: app.status === action.status ? 'default' : 'pointer',
                opacity: updating && updating !== action.status ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              {updating === action.status
                ? <><span className="btn-spinner" /> Updating...</>
                : <><i className={`bi ${action.icon}`} /> {action.label}</>
              }
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function JobApplicants() {
  const { id } = useParams()
  const { user } = useAuth()

  const [job, setJob]               = useState(null)
  const [applications, setApps]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [filterStatus, setFilter]   = useState('ALL')

  if (!user) return <Navigate to="/login" replace />
  if (!isRole(user, 'employer')) return <Navigate to="/dashboard" replace />

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          getAllJobs(),
          getJobApplications(id),
        ])
        const allJobs = Array.isArray(jobsRes.data) ? jobsRes.data : []
        const found   = allJobs.find(j => String(j.jobId) === String(id))
        setJob(found || null)
        setApps(Array.isArray(appsRes.data) ? appsRes.data : [])
      } catch {
        setError('Failed to load applicants. Make sure your backend is running.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleStatusChange = (applicationId, newStatus) => {
    setApps(prev => prev.map(a =>
      a.applicationId === applicationId ? { ...a, status: newStatus } : a
    ))
  }

  const filtered = filterStatus === 'ALL'
    ? applications
    : applications.filter(a => a.status === filterStatus)

  const counts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = applications.filter(a => a.status === key).length
    return acc
  }, {})

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="page-content">
        <div className="container" style={{ maxWidth: '900px' }}>

          {/* Back link */}
          <div style={{ marginBottom: '20px' }}>
            <Link to="/dashboard" style={{
              color: 'var(--text-muted)', fontSize: '0.88rem',
              display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none',
            }}>
              <i className="bi bi-arrow-left" /> Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="page-header fade-in">
            <span className="section-label">Employer</span>
            <h1>
              {job ? job.title : 'Job Applicants'}
            </h1>
            {job && (
              <p>
                <i className="bi bi-building" style={{ marginRight: '6px' }} />{job.companyName}
                {job.location && <><span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
                  <i className="bi bi-geo-alt" style={{ marginRight: '4px' }} />{job.location}</>}
              </p>
            )}
          </div>

          {loading ? (
            <Spinner message="Loading applicants..." />
          ) : error ? (
            <div className="alert-jp">{error}</div>
          ) : (
            <>
              {/* Stats row */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px',
              }}>
                <div style={{
                  background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)',
                  borderRadius: '12px', padding: '14px 22px', minWidth: '120px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a29bfe' }}>
                    {applications.length}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Total Applicants
                  </div>
                </div>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) =>
                  counts[key] > 0 ? (
                    <div key={key} style={{
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      borderRadius: '12px', padding: '14px 22px', minWidth: '110px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: cfg.color }}>
                        {counts[key]}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {cfg.label}
                      </div>
                    </div>
                  ) : null
                )}
              </div>

              {/* Filter tabs */}
              {applications.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {[{ key: 'ALL', label: `All (${applications.length})` },
                    ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
                      key, label: `${cfg.label} (${counts[key]})`,
                    }))
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      style={{
                        padding: '7px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600,
                        border: '1px solid var(--border)',
                        background: filterStatus === tab.key ? 'var(--accent)' : 'transparent',
                        color: filterStatus === tab.key ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Applicant list */}
              {applications.length === 0 ? (
                <div className="empty-state fade-in">
                  <div className="empty-icon">
                    <i className="bi bi-people" style={{ fontSize: '3rem', opacity: 0.2 }} />
                  </div>
                  <h3>No applicants yet</h3>
                  <p>No one has applied to this job yet. Share the listing to attract candidates.</p>
                  <Link to="/jobs" className="btn-secondary-jp" style={{ marginTop: '20px' }}>
                    View Job Listing
                  </Link>
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state fade-in">
                  <div className="empty-icon">
                    <i className="bi bi-funnel" style={{ fontSize: '2.5rem', opacity: 0.2 }} />
                  </div>
                  <h4>No applicants with this status</h4>
                  <button className="btn-secondary-jp" onClick={() => setFilter('ALL')} style={{ marginTop: '16px' }}>
                    Show All
                  </button>
                </div>
              ) : (
                <div>
                  {filtered.map(app => (
                    <ApplicantCard
                      key={app.applicationId}
                      app={app}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}