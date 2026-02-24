// import { useState, useEffect, useCallback } from 'react'
// import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'
// import JobCard from '../components/JobCard'
// import Spinner from '../components/Spinner'
// import { useAuth } from '../context/AuthContext'
// import { getAllJobs, searchByLocation, getUserApplications } from '../services/api'

// const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

// export default function Jobs() {
//   const { user } = useAuth()
//   const [jobs, setJobs] = useState([])
//   const [appliedJobIds, setAppliedJobIds] = useState([])
//   const [searchInput, setSearchInput] = useState('')
//   const [activeSearch, setActiveSearch] = useState('')
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')

//   // Load all jobs
//   const fetchJobs = useCallback(async (location = '') => {
//     setLoading(true)
//     setError('')
//     try {
//       const response = location.trim()
//         ? await searchByLocation(location.trim())
//         : await getAllJobs()
//       const data = response?.data
//       if (Array.isArray(data)) {
//         setJobs(data)
//       } else {
//         setJobs([])
//         setError('Unexpected response from server.')
//       }
//     } catch (err) {
//       setJobs([])
//       if (err.code === 'ERR_NETWORK') {
//         setError('Cannot reach backend. Is Spring Boot running on http://localhost:8080?')
//       } else if (err.response?.status === 404) {
//         setError('API endpoint not found. Check your backend is running.')
//       } else {
//         setError(`Error: ${err.message}`)
//       }
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   // Load applied job IDs for logged-in job seekers
//   useEffect(() => {
//     if (!user || !isRole(user, 'jobseeker')) { setAppliedJobIds([]); return }
//     getUserApplications(user.userId)
//       .then(res => {
//         const ids = (Array.isArray(res.data) ? res.data : [])
//           .map(a => a.job?.jobId)
//           .filter(Boolean)
//         setAppliedJobIds(ids)
//       })
//       .catch(() => {})
//   }, [user])

//   useEffect(() => { fetchJobs('') }, [fetchJobs])

//   const handleSearch = (e) => {
//     e.preventDefault()
//     setActiveSearch(searchInput)
//     fetchJobs(searchInput)
//   }

//   const handleReset = () => {
//     setSearchInput('')
//     setActiveSearch('')
//     fetchJobs('')
//   }

//   // Called by JobCard when user quick-applies on the list
//   const handleApplied = (jobId) => {
//     setAppliedJobIds(prev => prev.includes(jobId) ? prev : [...prev, jobId])
//   }

//   return (
//     <div className="app-wrapper">
//       <Navbar />

//       <main className="page-content">
//         <div className="container">

//           {/* Header + search */}
//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end', marginBottom: '48px' }}>
//             <div style={{ flex: 1, minWidth: '260px' }}>
//               <div className="page-header" style={{ marginBottom: 0 }}>
//                 <span className="section-label">Opportunities</span>
//                 <h1>Browse open roles</h1>
//                 <p>Discover positions matching your skills &amp; ambitions</p>
//               </div>
//             </div>
//             <div style={{ flex: '0 0 auto' }}>
//               <form onSubmit={handleSearch}>
//                 <div className="search-bar">
//                   <i className="bi bi-geo-alt" style={{ color: 'var(--text-muted)', padding: '0 4px 0 10px', alignSelf: 'center' }} />
//                   <input
//                     type="text"
//                     placeholder="Search by location e.g. Remote, Pune"
//                     value={searchInput}
//                     onChange={e => setSearchInput(e.target.value)}
//                   />
//                   <button type="submit">
//                     <i className="bi bi-search" /> Search
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>

//           {/* Active filter pill */}
//           {activeSearch && !loading && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
//               <div className="jobs-count-badge">
//                 <i className="bi bi-geo-alt-fill" /> Results for "{activeSearch}"
//               </div>
//               <button
//                 onClick={handleReset}
//                 style={{
//                   background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
//                   padding: '5px 12px', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer',
//                 }}
//               >
//                 Clear <i className="bi bi-x" />
//               </button>
//             </div>
//           )}

//           {/* Job seeker applied banner */}
//           {user && isRole(user, 'jobseeker') && appliedJobIds.length > 0 && !loading && (
//             <div className="applied-banner">
//               <i className="bi bi-check-circle-fill" style={{ color: 'var(--accent-3)' }} />
//               <span>
//                 You've applied to <strong>{appliedJobIds.length}</strong> job{appliedJobIds.length > 1 ? 's' : ''}.{' '}
//                 <a href="/my-applications" style={{ color: 'var(--accent)', fontWeight: 600 }}>
//                   Track applications →
//                 </a>
//               </span>
//             </div>
//           )}

//           {/* Job count */}
//           {!loading && !error && jobs.length > 0 && (
//             <div className="jobs-count-badge" style={{ marginBottom: '28px' }}>
//               <i className="bi bi-briefcase" />
//               {jobs.length} {jobs.length === 1 ? 'position' : 'positions'} found
//             </div>
//           )}

//           {/* States */}
//           {error ? (
//             <div style={{
//               background: 'rgba(255,101,132,0.06)', border: '1px solid rgba(255,101,132,0.25)',
//               borderRadius: '16px', padding: '32px', textAlign: 'center',
//             }}>
//               <div style={{
//                 width: '52px', height: '52px', borderRadius: '14px',
//                 background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 fontSize: '1.3rem', margin: '0 auto 16px',
//               }}>
//                 <i className="bi bi-wifi-off" style={{ color: 'var(--accent-2)' }} />
//               </div>
//               <h4 style={{ color: 'var(--accent-2)', marginBottom: '10px' }}>Could not load jobs</h4>
//               <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px', fontSize: '0.92rem' }}>
//                 {error}
//               </p>
//               <button className="btn-primary-jp" onClick={handleReset} style={{ margin: '0 auto', justifyContent: 'center' }}>
//                 <i className="bi bi-arrow-clockwise" /> Retry
//               </button>
//             </div>

//           ) : loading ? (
//             <Spinner message="Loading jobs..." />

//           ) : jobs.length === 0 ? (
//             <div className="empty-state">
//               <div className="empty-icon">
//                 <i className="bi bi-briefcase" style={{ fontSize: '3rem', opacity: 0.2 }} />
//               </div>
//               <h3>No jobs found</h3>
//               <p>
//                 {activeSearch
//                   ? `No positions in "${activeSearch}". Try a different location.`
//                   : 'No jobs posted yet. An employer needs to post jobs first.'}
//               </p>
//               {activeSearch && (
//                 <button className="btn-secondary-jp" onClick={handleReset} style={{ marginTop: '20px' }}>
//                   Show all jobs
//                 </button>
//               )}
//             </div>

//           ) : (
//             <div className="row g-4">
//               {jobs.map(job => (
//                 <div key={job.jobId} className="col-md-6 col-lg-4">
//                   <JobCard
//                     job={job}
//                     appliedJobIds={appliedJobIds}
//                     onApplied={handleApplied}
//                   />
//                 </div>
//               ))}
//             </div>
//           )}

//         </div>
//       </main>

//       <Footer />
//     </div>
//   )
// }


// import { useState, useEffect, useCallback } from 'react'
// import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'
// import JobCard from '../components/JobCard'
// import Spinner from '../components/Spinner'
// import { useAuth } from '../context/AuthContext'
// import { filterJobs, getUserApplications } from '../services/api'

// const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

// // NEW — job type options for filter pills
// const JOB_TYPES = ['All', 'Full Time', 'Part Time', 'Internship', 'Remote', 'Contract']

// const TYPE_COLORS = {
//   'Full Time':  { bg: 'rgba(108,99,255,0.12)', color: '#a29bfe', border: 'rgba(108,99,255,0.3)'  },
//   'Part Time':  { bg: 'rgba(247,183,49,0.12)',  color: '#f7b731', border: 'rgba(247,183,49,0.3)'  },
//   'Internship': { bg: 'rgba(255,101,132,0.12)', color: '#ff6584', border: 'rgba(255,101,132,0.3)' },
//   'Remote':     { bg: 'rgba(67,233,123,0.12)',  color: '#43e97b', border: 'rgba(67,233,123,0.3)'  },
//   'Contract':   { bg: 'rgba(0,210,255,0.12)',   color: '#00d2ff', border: 'rgba(0,210,255,0.3)'   },
// }

// export default function Jobs() {
//   const { user } = useAuth()
//   const [jobs, setJobs]                   = useState([])
//   const [appliedJobIds, setAppliedJobIds] = useState([])
//   const [keyword, setKeyword]             = useState('')        // NEW — replaces searchInput
//   const [activeKeyword, setActiveKeyword] = useState('')        // NEW — replaces activeSearch
//   const [selectedType, setSelectedType]   = useState('All')    // NEW — job type filter
//   const [loading, setLoading]             = useState(true)
//   const [error, setError]                 = useState('')

//   // NEW — uses filterJobs instead of getAllJobs / searchByLocation
//   const fetchJobs = useCallback(async (kw = '', type = 'All') => {
//     setLoading(true)
//     setError('')
//     try {
//       const res = await filterJobs(kw, type === 'All' ? '' : type)
//       const data = res?.data
//       if (Array.isArray(data)) {
//         setJobs(data)
//       } else {
//         setJobs([])
//         setError('Unexpected response from server.')
//       }
//     } catch (err) {
//       setJobs([])
//       if (err.code === 'ERR_NETWORK') {
//         setError('Cannot reach backend. Is Spring Boot running on http://localhost:8080?')
//       } else if (err.response?.status === 404) {
//         setError('API endpoint not found. Check your backend is running.')
//       } else {
//         setError(`Error: ${err.message}`)
//       }
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   // Load applied job IDs for logged-in job seekers
//   useEffect(() => {
//     if (!user || !isRole(user, 'jobseeker')) { setAppliedJobIds([]); return }
//     getUserApplications(user.userId)
//       .then(res => {
//         const ids = (Array.isArray(res.data) ? res.data : [])
//           .map(a => a.job?.jobId)
//           .filter(Boolean)
//         setAppliedJobIds(ids)
//       })
//       .catch(() => {})
//   }, [user])

//   useEffect(() => { fetchJobs('', 'All') }, [fetchJobs])

//   const handleSearch = (e) => {
//     e.preventDefault()
//     setActiveKeyword(keyword)
//     fetchJobs(keyword, selectedType)
//   }

//   // NEW — clicking a type pill instantly re-fetches
//   const handleTypeFilter = (type) => {
//     setSelectedType(type)
//     fetchJobs(activeKeyword, type)
//   }

//   const handleReset = () => {
//     setKeyword('')
//     setActiveKeyword('')
//     setSelectedType('All')
//     fetchJobs('', 'All')
//   }

//   const handleApplied = (jobId) => {
//     setAppliedJobIds(prev => prev.includes(jobId) ? prev : [...prev, jobId])
//   }

//   const hasActiveFilter = activeKeyword || selectedType !== 'All'

//   return (
//     <div className="app-wrapper">
//       <Navbar />

//       <main className="page-content">
//         <div className="container">

//           {/* Header */}
//           <div className="page-header fade-in">
//             <span className="section-label">Opportunities</span>
//             <h1>Browse open roles</h1>
//             <p>Discover positions matching your skills &amp; ambitions</p>
//           </div>

//           {/* NEW — Search bar now searches title, company, location */}
//           <div className="jobs-search-wrap fade-in fade-in-delay-1">
//             <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1 }}>
//               <div className="search-bar" style={{ flex: 1, maxWidth: '100%' }}>
//                 <i className="bi bi-search" style={{ color: 'var(--text-muted)', padding: '0 4px 0 10px', alignSelf: 'center' }} />
//                 <input
//                   type="text"
//                   placeholder="Search by title, company or location..."
//                   value={keyword}
//                   onChange={e => setKeyword(e.target.value)}
//                 />
//                 <button type="submit">
//                   <i className="bi bi-search" /> Search
//                 </button>
//               </div>
//             </form>
//             {hasActiveFilter && (
//               <button onClick={handleReset} className="jobs-reset-btn">
//                 <i className="bi bi-x-circle" /> Clear All
//               </button>
//             )}
//           </div>

//           {/* NEW — Job Type Filter Pills */}
//           <div className="jobs-type-filters fade-in fade-in-delay-2">
//             {JOB_TYPES.map(type => (
//               <button
//                 key={type}
//                 onClick={() => handleTypeFilter(type)}
//                 className={`jobs-type-pill ${selectedType === type ? 'jobs-type-pill-active' : ''}`}
//                 style={selectedType === type && TYPE_COLORS[type] ? {
//                   background: TYPE_COLORS[type].bg,
//                   color: TYPE_COLORS[type].color,
//                   borderColor: TYPE_COLORS[type].border,
//                 } : {}}
//               >
//                 {type === 'All'        && <i className="bi bi-grid-fill" />}
//                 {type === 'Full Time'  && <i className="bi bi-briefcase-fill" />}
//                 {type === 'Part Time'  && <i className="bi bi-clock-fill" />}
//                 {type === 'Internship' && <i className="bi bi-mortarboard-fill" />}
//                 {type === 'Remote'     && <i className="bi bi-house-fill" />}
//                 {type === 'Contract'   && <i className="bi bi-file-earmark-text-fill" />}
//                 {type}
//               </button>
//             ))}
//           </div>

//           {/* Active filter + count row */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
//             {activeKeyword && (
//               <div className="jobs-count-badge">
//                 <i className="bi bi-search" /> Results for "{activeKeyword}"
//               </div>
//             )}
//             {!loading && !error && jobs.length > 0 && (
//               <div className="jobs-count-badge">
//                 <i className="bi bi-briefcase" />
//                 {jobs.length} {jobs.length === 1 ? 'position' : 'positions'} found
//               </div>
//             )}
//             {user && isRole(user, 'jobseeker') && appliedJobIds.length > 0 && !loading && (
//               <div className="applied-banner" style={{ margin: 0 }}>
//                 <i className="bi bi-check-circle-fill" style={{ color: 'var(--accent-3)' }} />
//                 <span>
//                   You've applied to <strong>{appliedJobIds.length}</strong> job{appliedJobIds.length > 1 ? 's' : ''}.{' '}
//                   <a href="/my-applications" style={{ color: 'var(--accent)', fontWeight: 600 }}>
//                     Track applications →
//                   </a>
//                 </span>
//               </div>
//             )}
//           </div>

//           {/* States */}
//           {error ? (
//             <div style={{
//               background: 'rgba(255,101,132,0.06)', border: '1px solid rgba(255,101,132,0.25)',
//               borderRadius: '16px', padding: '32px', textAlign: 'center',
//             }}>
//               <div style={{
//                 width: '52px', height: '52px', borderRadius: '14px',
//                 background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 fontSize: '1.3rem', margin: '0 auto 16px',
//               }}>
//                 <i className="bi bi-wifi-off" style={{ color: 'var(--accent-2)' }} />
//               </div>
//               <h4 style={{ color: 'var(--accent-2)', marginBottom: '10px' }}>Could not load jobs</h4>
//               <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px', fontSize: '0.92rem' }}>
//                 {error}
//               </p>
//               <button className="btn-primary-jp" onClick={handleReset} style={{ margin: '0 auto', justifyContent: 'center' }}>
//                 <i className="bi bi-arrow-clockwise" /> Retry
//               </button>
//             </div>

//           ) : loading ? (
//             <Spinner message="Loading jobs..." />

//           ) : jobs.length === 0 ? (
//             <div className="empty-state">
//               <div className="empty-icon">
//                 <i className="bi bi-briefcase" style={{ fontSize: '3rem', opacity: 0.2 }} />
//               </div>
//               <h3>No jobs found</h3>
//               <p>
//                 {hasActiveFilter
//                   ? 'No jobs match your search. Try different keywords or remove filters.'
//                   : 'No jobs posted yet. An employer needs to post jobs first.'}
//               </p>
//               {hasActiveFilter && (
//                 <button className="btn-secondary-jp" onClick={handleReset} style={{ marginTop: '20px' }}>
//                   <i className="bi bi-x" /> Clear filters &amp; show all
//                 </button>
//               )}
//             </div>

//           ) : (
//             <div className="row g-4">
//               {jobs.map(job => (
//                 <div key={job.jobId} className="col-md-6 col-lg-4">
//                   <JobCard
//                     job={job}
//                     appliedJobIds={appliedJobIds}
//                     onApplied={handleApplied}
//                   />
//                 </div>
//               ))}
//             </div>
//           )}

//         </div>
//       </main>

//       <Footer />
//     </div>
//   )
// }






import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import JobCard from '../components/JobCard'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { filterJobs, getUserApplications } from '../services/api'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

const JOB_TYPES = ['All', 'Full Time', 'Part Time', 'Internship', 'Remote', 'Contract']

const TYPE_COLORS = {
  'Full Time':  { bg: 'rgba(108,99,255,0.12)', color: '#a29bfe', border: 'rgba(108,99,255,0.3)'  },
  'Part Time':  { bg: 'rgba(247,183,49,0.12)',  color: '#f7b731', border: 'rgba(247,183,49,0.3)'  },
  'Internship': { bg: 'rgba(255,101,132,0.12)', color: '#ff6584', border: 'rgba(255,101,132,0.3)' },
  'Remote':     { bg: 'rgba(67,233,123,0.12)',  color: '#43e97b', border: 'rgba(67,233,123,0.3)'  },
  'Contract':   { bg: 'rgba(0,210,255,0.12)',   color: '#00d2ff', border: 'rgba(0,210,255,0.3)'   },
}

const JOBS_PER_PAGE = 6   // ← change this to show more/fewer per page

export default function Jobs() {
  const { user } = useAuth()
  const [jobs, setJobs]                   = useState([])
  const [appliedJobIds, setAppliedJobIds] = useState([])
  const [keyword, setKeyword]             = useState('')
  const [activeKeyword, setActiveKeyword] = useState('')
  const [selectedType, setSelectedType]   = useState('All')
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')

  // Pagination state
  const [currentPage, setCurrentPage]     = useState(1)

  const fetchJobs = useCallback(async (kw = '', type = 'All') => {
    setLoading(true)
    setError('')
    setCurrentPage(1)   // reset to page 1 on any new search/filter
    try {
      const res = await filterJobs(kw, type === 'All' ? '' : type)
      const data = res?.data
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

  useEffect(() => {
    if (!user || !isRole(user, 'jobseeker')) { setAppliedJobIds([]); return }
    getUserApplications(user.userId)
      .then(res => {
        const ids = (Array.isArray(res.data) ? res.data : [])
          .map(a => a.job?.jobId).filter(Boolean)
        setAppliedJobIds(ids)
      })
      .catch(() => {})
  }, [user])

  useEffect(() => { fetchJobs('', 'All') }, [fetchJobs])

  const handleSearch = (e) => {
    e.preventDefault()
    setActiveKeyword(keyword)
    fetchJobs(keyword, selectedType)
  }

  const handleTypeFilter = (type) => {
    setSelectedType(type)
    fetchJobs(activeKeyword, type)
  }

  const handleReset = () => {
    setKeyword('')
    setActiveKeyword('')
    setSelectedType('All')
    fetchJobs('', 'All')
  }

  const handleApplied = (jobId) => {
    setAppliedJobIds(prev => prev.includes(jobId) ? prev : [...prev, jobId])
  }

  const hasActiveFilter = activeKeyword || selectedType !== 'All'

  // Pagination calculations
  const totalPages  = Math.ceil(jobs.length / JOBS_PER_PAGE)
  const startIndex  = (currentPage - 1) * JOBS_PER_PAGE
  const currentJobs = jobs.slice(startIndex, startIndex + JOBS_PER_PAGE)

  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Build page number list (with ellipsis for many pages)
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = []
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }
    return pages
  }

  return (
    <div className="app-wrapper">
      <Navbar />

      <main className="page-content">
        <div className="container">

          {/* Header */}
          <div className="page-header fade-in">
            <span className="section-label">Opportunities</span>
            <h1>Browse open roles</h1>
            <p>Discover positions matching your skills &amp; ambitions</p>
          </div>

          {/* Search Bar */}
          <div className="jobs-search-wrap fade-in fade-in-delay-1">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1 }}>
              <div className="search-bar" style={{ flex: 1, maxWidth: '100%' }}>
                <i className="bi bi-search" style={{ color: 'var(--text-muted)', padding: '0 4px 0 10px', alignSelf: 'center' }} />
                <input
                  type="text"
                  placeholder="Search by title, company or location..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                />
                <button type="submit">
                  <i className="bi bi-search" /> Search
                </button>
              </div>
            </form>
            {hasActiveFilter && (
              <button onClick={handleReset} className="jobs-reset-btn">
                <i className="bi bi-x-circle" /> Clear All
              </button>
            )}
          </div>

          {/* Job Type Filter Pills */}
          <div className="jobs-type-filters fade-in fade-in-delay-2">
            {JOB_TYPES.map(type => (
              <button
                key={type}
                onClick={() => handleTypeFilter(type)}
                className={`jobs-type-pill ${selectedType === type ? 'jobs-type-pill-active' : ''}`}
                style={selectedType === type && TYPE_COLORS[type] ? {
                  background: TYPE_COLORS[type].bg,
                  color: TYPE_COLORS[type].color,
                  borderColor: TYPE_COLORS[type].border,
                } : {}}
              >
                {type === 'All'        && <i className="bi bi-grid-fill" />}
                {type === 'Full Time'  && <i className="bi bi-briefcase-fill" />}
                {type === 'Part Time'  && <i className="bi bi-clock-fill" />}
                {type === 'Internship' && <i className="bi bi-mortarboard-fill" />}
                {type === 'Remote'     && <i className="bi bi-house-fill" />}
                {type === 'Contract'   && <i className="bi bi-file-earmark-text-fill" />}
                {type}
              </button>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {activeKeyword && (
              <div className="jobs-count-badge">
                <i className="bi bi-search" /> Results for "{activeKeyword}"
              </div>
            )}
            {!loading && !error && jobs.length > 0 && (
              <div className="jobs-count-badge">
                <i className="bi bi-briefcase" />
                {jobs.length} {jobs.length === 1 ? 'position' : 'positions'} found
              </div>
            )}
            {user && isRole(user, 'jobseeker') && appliedJobIds.length > 0 && !loading && (
              <div className="applied-banner" style={{ margin: "0 px" }}>
                <i className="bi bi-check-circle-fill" style={{ color: 'var(--accent-3)' }} />
                <span>
                  Applied to <strong>{appliedJobIds.length}</strong> job{appliedJobIds.length > 1 ? 's' : ''}.{' '}
                  <a href="/my-applications" style={{ color: 'var(--accent)', fontWeight: 600 }}>Track →</a>
                </span>
              </div>
            )}
          </div>

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
              <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px', fontSize: '0.92rem' }}>{error}</p>
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
                {hasActiveFilter
                  ? 'No jobs match your search. Try different keywords or remove filters.'
                  : 'No jobs posted yet. An employer needs to post jobs first.'}
              </p>
              {hasActiveFilter && (
                <button className="btn-secondary-jp" onClick={handleReset} style={{ marginTop: '20px' }}>
                  <i className="bi bi-x" /> Clear filters
                </button>
              )}
            </div>

          ) : (
            <>
              {/* Job Grid — paginated */}
              <div className="row g-4">
                {currentJobs.map(job => (
                  <div key={job.jobId} className="col-md-6 col-lg-4">
                    <JobCard job={job} appliedJobIds={appliedJobIds} onApplied={handleApplied} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-wrap">
                  <div className="pagination-info">
                    Showing {startIndex + 1}–{Math.min(startIndex + JOBS_PER_PAGE, jobs.length)} of {jobs.length} jobs
                  </div>

                  <div className="pagination-controls">
                    {/* Prev */}
                    <button
                      className="page-btn page-btn-arrow"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-left" />
                    </button>

                    {/* Page numbers */}
                    {getPageNumbers().map((page, idx) =>
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="page-ellipsis">…</span>
                      ) : (
                        <button
                          key={page}
                          className={`page-btn ${currentPage === page ? 'page-btn-active' : ''}`}
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      className="page-btn page-btn-arrow"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <i className="bi bi-chevron-right" />
                    </button>
                  </div>
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