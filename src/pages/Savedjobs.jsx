import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import JobCard from '../components/JobCard'
import Spinner from '../components/Spinner'
import { getAllJobs, getUserApplications } from '../services/api'
import { useAuth } from '../context/AuthContext'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

const SAVE_KEY = 'jp_saved_jobs'
function getSaved() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]') } catch { return [] }
}

export default function SavedJobs() {
  const { user } = useAuth()
  const [allJobs, setAllJobs]             = useState([])
  const [savedIds, setSavedIds]           = useState(getSaved)
  const [appliedJobIds, setAppliedJobIds] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')

  // Fetch all jobs to match against saved IDs
  useEffect(() => {
    setLoading(true)
    getAllJobs()
      .then(res => {
        setAllJobs(Array.isArray(res.data) ? res.data : [])
      })
      .catch(() => setError('Could not load jobs. Check backend connection.'))
      .finally(() => setLoading(false))
  }, [])

  // Fetch applied IDs for jobseeker
  useEffect(() => {
    if (!user || !isRole(user, 'jobseeker')) { setAppliedJobIds([]); return }
    getUserApplications(user.userId)
      .then(res => {
        const ids = (Array.isArray(res.data) ? res.data : []).map(a => a.job?.jobId).filter(Boolean)
        setAppliedJobIds(ids)
      })
      .catch(() => {})
  }, [user])

  // Listen for bookmark changes from JobCard (same tab)
  useEffect(() => {
    const refresh = () => setSavedIds(getSaved())
    window.addEventListener('savedJobsChanged', refresh)
    return () => window.removeEventListener('savedJobsChanged', refresh)
  }, [])

  const handleApplied = (jobId) => {
    setAppliedJobIds(prev => prev.includes(jobId) ? prev : [...prev, jobId])
  }

  const savedJobs = allJobs.filter(j => savedIds.includes(j.jobId))

  const clearAll = () => {
    localStorage.setItem(SAVE_KEY, '[]')
    setSavedIds([])
    window.dispatchEvent(new Event('savedJobsChanged'))
  }

  return (
    <div className="app-wrapper">
      <Navbar />

      <main className="page-content">
        <div className="container">

          {/* Header */}
          <div className="page-header fade-in" style={{ marginBottom: '36px' }}>
            <span className="section-label">Bookmarks</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1>Saved Jobs</h1>
                <p>Jobs you've bookmarked for later</p>
              </div>
              {savedJobs.length > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    background: 'rgba(255,101,132,0.08)', border: '1px solid rgba(255,101,132,0.25)',
                    borderRadius: '10px', padding: '10px 20px', color: '#ff6584',
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <i className="bi bi-trash" /> Clear All
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <Spinner message="Loading saved jobs..." />

          ) : error ? (
            <div style={{
              background: 'rgba(255,101,132,0.06)', border: '1px solid rgba(255,101,132,0.25)',
              borderRadius: '16px', padding: '40px', textAlign: 'center',
            }}>
              <i className="bi bi-wifi-off" style={{ fontSize: '2rem', color: 'var(--accent-2)', display: 'block', marginBottom: '12px' }} />
              <h4 style={{ color: 'var(--accent-2)' }}>Could not load jobs</h4>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{error}</p>
            </div>

          ) : savedJobs.length === 0 ? (
            <div className="empty-state" style={{ padding: '80px 20px' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '20px',
                background: 'rgba(108,99,255,0.08)', border: '1px solid var(--border-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', margin: '0 auto 20px',
              }}>
                <i className="bi bi-bookmark" style={{ color: 'var(--accent)', opacity: 0.5 }} />
              </div>
              <h3>No saved jobs yet</h3>
              <p style={{ marginBottom: '28px' }}>
                Browse jobs and click the <i className="bi bi-bookmark" /> bookmark icon to save them here.
              </p>
              <Link to="/jobs" className="btn-primary-jp" style={{ justifyContent: 'center' }}>
                <i className="bi bi-briefcase" /> Browse Jobs
              </Link>
            </div>

          ) : (
            <>
              <div className="jobs-count-badge" style={{ marginBottom: '28px' }}>
                <i className="bi bi-bookmark-fill" style={{ color: 'var(--accent)' }} />
                {savedJobs.length} saved {savedJobs.length === 1 ? 'job' : 'jobs'}
              </div>

              <div className="row g-4">
                {savedJobs.map(job => (
                  <div key={job.jobId} className="col-md-6 col-lg-4">
                    <JobCard job={job} appliedJobIds={appliedJobIds} onApplied={handleApplied} />
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}