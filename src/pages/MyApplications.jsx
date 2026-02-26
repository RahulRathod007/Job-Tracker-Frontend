import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import { getUserApplications } from '../services/api'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

const TIMELINE_STEPS = [
  { status: 'APPLIED',             label: 'Applied',             icon: 'bi-send-fill',             color: '#a29bfe' },
  { status: 'RESUME_VIEWED',       label: 'Resume Viewed',       icon: 'bi-eye-fill',              color: '#f7b731' },
  { status: 'SHORTLISTED',         label: 'Shortlisted',         icon: 'bi-star-fill',             color: '#43e97b' },
  { status: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', icon: 'bi-calendar-check-fill',   color: '#00d2ff' },
]

const FINAL_STEPS = {
  HIRED:    { label: 'Hired 🎉',   icon: 'bi-trophy-fill',   color: '#43e97b' },
  REJECTED: { label: 'Rejected',   icon: 'bi-x-circle-fill', color: '#ff6584' },
}

const STATUS_CONFIG = {
  APPLIED:             { label: 'Applied',             bg: 'rgba(108,99,255,0.12)', color: '#a29bfe', border: 'rgba(108,99,255,0.3)' },
  RESUME_VIEWED:       { label: 'Resume Viewed',       bg: 'rgba(247,183,49,0.12)', color: '#f7b731', border: 'rgba(247,183,49,0.3)' },
  SHORTLISTED:         { label: 'Shortlisted',         bg: 'rgba(67,233,123,0.12)', color: '#43e97b', border: 'rgba(67,233,123,0.3)' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', bg: 'rgba(0,210,255,0.12)',  color: '#00d2ff', border: 'rgba(0,210,255,0.3)'  },
  HIRED:               { label: 'Hired 🎉',            bg: 'rgba(67,233,123,0.15)', color: '#43e97b', border: 'rgba(67,233,123,0.4)' },
  REJECTED:            { label: 'Rejected',            bg: 'rgba(255,101,132,0.1)', color: '#ff6584', border: 'rgba(255,101,132,0.3)' },
}

function getStepIndex(status) {
  const idx = TIMELINE_STEPS.findIndex(s => s.status === status)
  if (idx !== -1) return idx
  if (status === 'HIRED' || status === 'REJECTED') return TIMELINE_STEPS.length 
  return 0
}

function ApplicationTimeline({ status }) {
  const isFinal   = status === 'HIRED' || status === 'REJECTED'
  const activeIdx = getStepIndex(status)
  const finalCfg  = FINAL_STEPS[status]

  return (
    <div style={{ margin: '20px 0 4px', position: 'relative' }}>
      {/* connecting line */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: isFinal ? '16px' : `calc(${((TIMELINE_STEPS.length - 1 - Math.min(activeIdx, TIMELINE_STEPS.length - 1)) / (TIMELINE_STEPS.length)) * 100}% + 16px)`,
        height: '2px',
        background: 'var(--accent)',
        transition: 'right 0.5s ease',
        zIndex: 0,
      }} />
      {/* background line */}
      <div style={{
        position: 'absolute', top: '16px', left: '16px', right: '16px',
        height: '2px', background: 'var(--border)', zIndex: 0,
      }} />

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        position: 'relative', zIndex: 1,
        gap: '4px',
      }}>
        {TIMELINE_STEPS.map((step, i) => {
          const done    = i < activeIdx
          const current = i === activeIdx && !isFinal
          const future  = i > activeIdx && !isFinal || (isFinal && i >= TIMELINE_STEPS.length)
          const color   = done || current ? step.color : 'var(--border)'

          return (
            <div key={step.status} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              flex: 1, gap: '8px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: done || current ? `${step.color}22` : 'var(--bg-card)',
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem',
                boxShadow: current ? `0 0 12px ${step.color}66` : 'none',
                transition: 'all 0.3s',
              }}>
                {done ? (
                  <i className="bi bi-check-lg" style={{ color: step.color, fontWeight: 800 }} />
                ) : (
                  <i className={`bi ${step.icon}`} style={{ color: current ? step.color : 'var(--text-muted)', fontSize: '0.75rem' }} />
                )}
              </div>
              <div style={{
                fontSize: '0.68rem', textAlign: 'center', lineHeight: 1.3,
                color: done || current ? 'var(--text-secondary)' : 'var(--text-muted)',
                fontWeight: current ? 700 : 400,
                maxWidth: '70px',
              }}>
                {step.label}
              </div>
            </div>
          )
        })}

        {/* Final step: Hired or Rejected */}
        {isFinal && finalCfg ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: `${finalCfg.color}22`,
              border: `2px solid ${finalCfg.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem',
              boxShadow: `0 0 12px ${finalCfg.color}66`,
            }}>
              <i className={`bi ${finalCfg.icon}`} style={{ color: finalCfg.color, fontSize: '0.75rem' }} />
            </div>
            <div style={{
              fontSize: '0.68rem', textAlign: 'center', lineHeight: 1.3,
              color: finalCfg.color, fontWeight: 700, maxWidth: '70px',
            }}>
              {finalCfg.label}
            </div>
          </div>
        ) : (
          // placeholder to keep spacing
          <div style={{ flex: 1 }} />
        )}
      </div>
    </div>
  )
}

function statusMessage(status) {
  switch (status) {
    case 'APPLIED':             return 'Your application is with the employer. Hang tight!'
    case 'RESUME_VIEWED':       return 'Great news — the employer has reviewed your resume.'
    case 'SHORTLISTED':         return "You've been shortlisted! The employer is very interested."
    case 'INTERVIEW_SCHEDULED': return 'Interview scheduled! Check your email for details.'
    case 'HIRED':               return 'Congratulations! You got the job! 🎉'
    case 'REJECTED':            return 'Unfortunately this application was not successful. Keep going!'
    default:                    return ''
  }
}

export default function MyApplications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [expanded, setExpanded]         = useState(null)

  if (!user) return <Navigate to="/login" replace />
  if (!isRole(user, 'jobseeker')) return <Navigate to="/dashboard" replace />

  useEffect(() => {
    getUserApplications(user.userId)
      .then(res => setApplications(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load applications. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [user.userId])

  const stats = {
    total:     applications.length,
    active:    applications.filter(a => !['HIRED', 'REJECTED'].includes(a.status)).length,
    shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
    interviews:  applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
  }

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="page-content">
        <div className="container">

          <div className="page-header fade-in">
            <span className="section-label">Job Seeker</span>
            <h1>My Applications</h1>
            <p>Track every application and see where you stand in real time</p>
          </div>

          {/* Stats */}
          {!loading && applications.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '36px' }} className="fade-in">
              {[
                { label: 'Total Applied',     value: stats.total,       icon: 'bi-briefcase-fill',    color: '#a29bfe' },
                { label: 'Active',            value: stats.active,      icon: 'bi-hourglass-split',   color: '#f7b731' },
                { label: 'Shortlisted',       value: stats.shortlisted, icon: 'bi-star-fill',         color: '#43e97b' },
                { label: 'Interview Pending', value: stats.interviews,  icon: 'bi-calendar-check-fill', color: '#00d2ff' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '14px', padding: '14px 20px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  minWidth: '140px',
                }}>
                  <i className={`bi ${s.icon}`} style={{ fontSize: '1.3rem', color: s.color }} />
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <Spinner message="Loading your applications..." />
          ) : error ? (
            <div className="alert-jp">{error}</div>
          ) : applications.length === 0 ? (
            <div className="empty-state fade-in">
              <div className="empty-icon">
                <i className="bi bi-briefcase" style={{ fontSize: '3rem', opacity: 0.2 }} />
              </div>
              <h3>No applications yet</h3>
              <p>You haven't applied to any jobs. Start browsing open positions!</p>
              <Link to="/jobs" className="btn-primary-jp" style={{ marginTop: '20px', justifyContent: 'center' }}>
                <i className="bi bi-search" /> Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {applications.map((app, i) => {
                const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED
                const isOpen = expanded === app.applicationId
                const applyDate = app.applyDate
                  ? new Date(app.applyDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'
                const msg = statusMessage(app.status)

                return (
                  <div key={app.applicationId} className={`col-12 fade-in fade-in-delay-${Math.min(i + 1, 4)}`}>
                    <div
                      className="application-card"
                      style={{
                        border: `1px solid ${cfg.border}`,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpanded(isOpen ? null : app.applicationId)}
                    >
                      {/* Top row */}
                      <div className="application-card-top">
                        <div style={{ flex: 1 }}>
                          <h5 className="application-title">{app.job?.title || 'Job Title'}</h5>
                          <div className="application-company">{app.job?.companyName}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="status-badge" style={{
                            background: cfg.bg, color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                          }}>
                            {cfg.label}
                          </span>
                          <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} />
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="application-meta">
                        {app.job?.location && (
                          <span className="job-tag">
                            <i className="bi bi-geo-alt" /> {app.job.location}
                          </span>
                        )}
                        <span className="job-tag">
                          <i className="bi bi-calendar3" /> Applied {applyDate}
                        </span>
                        {app.job?.salary && (
                          <span className="job-tag" style={{ color: 'var(--accent-3)', fontWeight: 600 }}>
                            <i className="bi bi-currency-rupee" />
                            {Number(app.job.salary).toLocaleString()}  LPA
                          </span>
                        )}
                      </div>

                      {/* Expanded: Timeline */}
                      {isOpen && (
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}
                          onClick={e => e.stopPropagation()}>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 600 }}>
                            APPLICATION TRACKER
                          </div>

                          <ApplicationTimeline status={app.status} />

                          {/* Status message */}
                          {msg && (
                            <div style={{
                              marginTop: '20px', padding: '14px 18px', borderRadius: '12px',
                              background: `${cfg.bg}`, border: `1px solid ${cfg.border}`,
                              fontSize: '0.85rem', color: cfg.color, display: 'flex', gap: '10px',
                            }}>
                              <i className="bi bi-info-circle-fill" style={{ marginTop: '1px', flexShrink: 0 }} />
                              {msg}
                            </div>
                          )}

                          {/* View job link */}
                          <div style={{ marginTop: '16px' }}>
                            <Link
                              to={`/jobs/${app.job?.jobId}`}
                              className="btn-view-job"
                              style={{ display: 'inline-flex' }}
                            >
                              View Job <i className="bi bi-arrow-right" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}