import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import { getAllJobs, getUserApplications, deleteJob, getJobApplications } from '../services/api'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

export default function Dashboard() {
  const { user } = useAuth()
  const [jobs, setJobs]                   = useState([])
  const [applications, setApplications]   = useState([])
  const [applicantCounts, setApplicantCounts] = useState({})
  const [loading, setLoading]             = useState(true)
  const [deletingId, setDeletingId]       = useState(null)

  if (!user) return <Navigate to="/login" replace />

  const isEmployer = isRole(user, 'employer')

  useEffect(() => {
    const load = async () => {
      try {
        if (isEmployer) {
          const res = await getAllJobs()
          const all = Array.isArray(res.data) ? res.data : []
          const myJobs = all.filter(j => j.employer?.userId === user.userId)
          setJobs(myJobs)

          // Fetch applicant counts for each job in parallel
          const countEntries = await Promise.all(
            myJobs.map(async (job) => {
              try {
                const r = await getJobApplications(job.jobId)
                return [job.jobId, Array.isArray(r.data) ? r.data.length : 0]
              } catch {
                return [job.jobId, 0]
              }
            })
          )
          setApplicantCounts(Object.fromEntries(countEntries))
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
    if (!window.confirm('Delete this job listing?')) return
    setDeletingId(jobId)
    try {
      await deleteJob(jobId)
      setJobs(prev => prev.filter(j => j.jobId !== jobId))
    } catch {
      alert('Failed to delete job. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const greeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good morning'
    if (hr < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="app-wrapper">
      <Navbar />
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
                <i className={`bi bi-${isEmployer ? 'building' : 'person'}`}></i>
                {isEmployer ? 'Employer' : 'Job Seeker'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row g-4 mb-5">
            {isEmployer ? (
              <>
                <div className="col-md-4">
                  <Link to="/post-job" className="dashboard-action-card">
                    <div className="dashboard-icon dashboard-icon-purple">
                      <i className="bi bi-plus-circle-fill"></i>
                    </div>
                    <div>Post a Job</div>
                    <small>Create a new listing</small>
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/jobs" className="dashboard-action-card">
                    <div className="dashboard-icon dashboard-icon-pink">
                      <i className="bi bi-briefcase-fill"></i>
                    </div>
                    <div>Browse Jobs</div>
                    <small>See all listings</small>
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/profile" className="dashboard-action-card">
                    <div className="dashboard-icon dashboard-icon-green">
                      <i className="bi bi-person-fill"></i>
                    </div>
                    <div>My Profile</div>
                    <small>Update settings</small>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="col-md-4">
                  <Link to="/jobs" className="dashboard-action-card">
                    <div className="dashboard-icon dashboard-icon-purple">
                      <i className="bi bi-search"></i>
                    </div>
                    <div>Find Jobs</div>
                    <small>Browse open roles</small>
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/my-applications" className="dashboard-action-card">
                    <div className="dashboard-icon dashboard-icon-green">
                      <i className="bi bi-list-check"></i>
                    </div>
                    <div>Applications</div>
                    <small>{applications.length} submitted</small>
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/profile" className="dashboard-action-card">
                    <div className="dashboard-icon dashboard-icon-pink">
                      <i className="bi bi-file-earmark-person-fill"></i>
                    </div>
                    <div>My Profile</div>
                    <small>{user.cvFilename ? 'CV uploaded ✓' : 'Upload your CV'}</small>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Employer: My Jobs */}
          {isEmployer && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3>My Job Listings <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1rem' }}>({jobs.length})</span></h3>
                <Link to="/post-job" className="btn-primary-jp" style={{ fontSize: '0.88rem', padding: '8px 18px' }}>
                  <i className="bi bi-plus"></i> Post New
                </Link>
              </div>

              {loading ? <Spinner message="Loading your jobs..." /> : jobs.length === 0 ? (
                <div className="empty-state" style={{ padding: '48px' }}>
                  <div className="empty-icon"><i className="bi bi-briefcase" style={{ fontSize: '2.5rem', opacity: 0.2 }}></i></div>
                  <h4>No jobs posted yet</h4>
                  <p>Post your first job to start receiving applications.</p>
                  <Link to="/post-job" className="btn-primary-jp" style={{ marginTop: '16px', justifyContent: 'center' }}>
                    <i className="bi bi-plus"></i> Post a Job
                  </Link>
                </div>
              ) : (
                <div className="row g-4">
                  {jobs.map((job, i) => {
                    const count = applicantCounts[job.jobId] ?? '...'
                    return (
                      <div key={job.jobId} className={`col-md-6 fade-in fade-in-delay-${Math.min(i+1,4)}`}>
                        <div className="employer-job-card">
                          <div className="employer-job-header">
                            <div>
                              <div className="employer-job-title">{job.title}</div>
                              <div className="employer-job-company">{job.companyName}</div>
                            </div>
                            <span className="employer-job-live-badge">Live</span>
                          </div>

                          <div className="employer-job-meta">
                            {job.location && <span className="job-tag"><i className="bi bi-geo-alt"></i> {job.location}</span>}
                            {job.salary && <span className="job-tag"><i className="bi bi-currency-rupee"></i> {Number(job.salary).toLocaleString()} / yr</span>}
                            {job.postedDate && <span className="job-tag"><i className="bi bi-calendar3"></i> {new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                          </div>

                          {/* Applicant count badge */}
                          <div style={{ margin: '12px 0 16px' }}>
                            <Link
                              to={`/jobs/${job.jobId}/applicants`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px', borderRadius: '10px', textDecoration: 'none',
                                background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)',
                                color: '#a29bfe', fontSize: '0.84rem', fontWeight: 600,
                                transition: 'all 0.2s',
                              }}
                            >
                              <i className="bi bi-people-fill" />
                              {count} Applicant{count !== 1 ? 's' : ''}
                              <i className="bi bi-arrow-right" style={{ fontSize: '0.75rem' }} />
                            </Link>
                          </div>

                          <div className="employer-job-actions">
                            <Link to={`/jobs/${job.jobId}`} className="btn-secondary-jp" style={{ fontSize: '0.82rem', padding: '7px 14px' }}>
                              <i className="bi bi-eye"></i> View
                            </Link>
                            <Link to={`/jobs/${job.jobId}/applicants`} className="btn-secondary-jp" style={{ fontSize: '0.82rem', padding: '7px 14px' }}>
                              <i className="bi bi-people"></i> Applicants
                            </Link>
                            <button
                              onClick={() => handleDelete(job.jobId)}
                              disabled={deletingId === job.jobId}
                              className="btn-danger-jp"
                              style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                            >
                              {deletingId === job.jobId ? <><span className="btn-spinner"></span> Deleting...</> : <><i className="bi bi-trash"></i> Delete</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Job Seeker: Recent Applications */}
          {!isEmployer && !loading && applications.length > 0 && (
            <div className="fade-in fade-in-delay-2">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3>Recent Applications</h3>
                <Link to="/my-applications" style={{ color: 'var(--accent)', fontSize: '0.88rem' }}>View all →</Link>
              </div>
              <div className="row g-4">
                {applications.slice(0, 4).map((app, i) => {
                  const STATUS_CONFIG = {
                    APPLIED:             { label: 'Applied',             bg: 'rgba(108,99,255,0.12)', color: '#a29bfe', border: 'rgba(108,99,255,0.3)' },
                    RESUME_VIEWED:       { label: 'Resume Viewed',       bg: 'rgba(247,183,49,0.12)', color: '#f7b731', border: 'rgba(247,183,49,0.3)' },
                    SHORTLISTED:         { label: 'Shortlisted',         bg: 'rgba(67,233,123,0.12)', color: '#43e97b', border: 'rgba(67,233,123,0.3)' },
                    INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', bg: 'rgba(0,210,255,0.12)',  color: '#00d2ff', border: 'rgba(0,210,255,0.3)'  },
                    HIRED:               { label: 'Hired 🎉',            bg: 'rgba(67,233,123,0.15)', color: '#43e97b', border: 'rgba(67,233,123,0.4)' },
                    REJECTED:            { label: 'Rejected',            bg: 'rgba(255,101,132,0.1)', color: '#ff6584', border: 'rgba(255,101,132,0.3)' },
                  }
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED
                  return (
                    <div key={app.applicationId} className={`col-md-6 fade-in fade-in-delay-${i+1}`}>
                      <div className="application-card">
                        <div className="application-card-top">
                          <div>
                            <h5 className="application-title">{app.job?.title}</h5>
                            <div className="application-company">{app.job?.companyName}</div>
                          </div>
                          <span className="status-badge" style={{
                            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                          }}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="application-meta">
                          {app.job?.location && <span className="job-tag"><i className="bi bi-geo-alt"></i> {app.job.location}</span>}
                          <span className="job-tag"><i className="bi bi-calendar3"></i> {new Date(app.applyDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
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