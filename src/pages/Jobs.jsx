import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import JobCard from '../components/JobCard'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { getAllJobs, searchByLocation, getUserApplications } from '../services/api'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

export default function Jobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [appliedJobIds, setAppliedJobIds] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load all jobs
  const fetchJobs = useCallback(async (location = '') => {
    setLoading(true)
    setError('')
    try {
      const response = location.trim()
        ? await searchByLocation(location.trim())
        : await getAllJobs()
      const data = response?.data
      if (Array.isArray(data)) {
        setJobs(data)
      } else {
        setJobs([])
        setError('Unexpected response from server.')
      }
    } catch (err) {
      setJobs([])
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach backend. Is Spring Boot running on http://localhost:8080?')
      } else if (err.response?.status === 404) {
        setError('API endpoint not found. Check your backend is running.')
      } else {
        setError(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Load applied job IDs for logged-in job seekers
  useEffect(() => {
    if (!user || !isRole(user, 'jobseeker')) { setAppliedJobIds([]); return }
    getUserApplications(user.userId)
      .then(res => {
        const ids = (Array.isArray(res.data) ? res.data : [])
          .map(a => a.job?.jobId)
          .filter(Boolean)
        setAppliedJobIds(ids)
      })
      .catch(() => {})
  }, [user])

  useEffect(() => { fetchJobs('') }, [fetchJobs])

  const handleSearch = (e) => {
    e.preventDefault()
    setActiveSearch(searchInput)
    fetchJobs(searchInput)
  }

  const handleReset = () => {
    setSearchInput('')
    setActiveSearch('')
    fetchJobs('')
  }

  // Called by JobCard when user quick-applies on the list
  const handleApplied = (jobId) => {
    setAppliedJobIds(prev => prev.includes(jobId) ? prev : [...prev, jobId])
  }

  return (
    <div className="app-wrapper">
      <Navbar />

      <main className="page-content">
        <div className="container">

          {/* Header + search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end', marginBottom: '48px' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div className="page-header" style={{ marginBottom: 0 }}>
                <span className="section-label">Opportunities</span>
                <h1>Browse open roles</h1>
                <p>Discover positions matching your skills &amp; ambitions</p>
              </div>
            </div>
            <div style={{ flex: '0 0 auto' }}>
              <form onSubmit={handleSearch}>
                <div className="search-bar">
                  <i className="bi bi-geo-alt" style={{ color: 'var(--text-muted)', padding: '0 4px 0 10px', alignSelf: 'center' }} />
                  <input
                    type="text"
                    placeholder="Search by location e.g. Remote, Pune"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                  />
                  <button type="submit">
                    <i className="bi bi-search" /> Search
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Active filter pill */}
          {activeSearch && !loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <div className="jobs-count-badge">
                <i className="bi bi-geo-alt-fill" /> Results for "{activeSearch}"
              </div>
              <button
                onClick={handleReset}
                style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
                  padding: '5px 12px', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer',
                }}
              >
                Clear <i className="bi bi-x" />
              </button>
            </div>
          )}

          {/* Job seeker applied banner */}
          {user && isRole(user, 'jobseeker') && appliedJobIds.length > 0 && !loading && (
            <div className="applied-banner">
              <i className="bi bi-check-circle-fill" style={{ color: 'var(--accent-3)' }} />
              <span>
                You've applied to <strong>{appliedJobIds.length}</strong> job{appliedJobIds.length > 1 ? 's' : ''}.{' '}
                <a href="/my-applications" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  Track applications →
                </a>
              </span>
            </div>
          )}

          {/* Job count */}
          {!loading && !error && jobs.length > 0 && (
            <div className="jobs-count-badge" style={{ marginBottom: '28px' }}>
              <i className="bi bi-briefcase" />
              {jobs.length} {jobs.length === 1 ? 'position' : 'positions'} found
            </div>
          )}

          {/* States */}
          {error ? (
            <div style={{
              background: 'rgba(255,101,132,0.06)', border: '1px solid rgba(255,101,132,0.25)',
              borderRadius: '16px', padding: '32px', textAlign: 'center',
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', margin: '0 auto 16px',
              }}>
                <i className="bi bi-wifi-off" style={{ color: 'var(--accent-2)' }} />
              </div>
              <h4 style={{ color: 'var(--accent-2)', marginBottom: '10px' }}>Could not load jobs</h4>
              <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px', fontSize: '0.92rem' }}>
                {error}
              </p>
              <button className="btn-primary-jp" onClick={handleReset} style={{ margin: '0 auto', justifyContent: 'center' }}>
                <i className="bi bi-arrow-clockwise" /> Retry
              </button>
            </div>

          ) : loading ? (
            <Spinner message="Loading jobs..." />

          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="bi bi-briefcase" style={{ fontSize: '3rem', opacity: 0.2 }} />
              </div>
              <h3>No jobs found</h3>
              <p>
                {activeSearch
                  ? `No positions in "${activeSearch}". Try a different location.`
                  : 'No jobs posted yet. An employer needs to post jobs first.'}
              </p>
              {activeSearch && (
                <button className="btn-secondary-jp" onClick={handleReset} style={{ marginTop: '20px' }}>
                  Show all jobs
                </button>
              )}
            </div>

          ) : (
            <div className="row g-4">
              {jobs.map(job => (
                <div key={job.jobId} className="col-md-6 col-lg-4">
                  <JobCard
                    job={job}
                    appliedJobIds={appliedJobIds}
                    onApplied={handleApplied}
                  />
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}