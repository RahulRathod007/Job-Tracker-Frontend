// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import { applyJob } from '../services/api'

// function getCardAccent(str = '') {
//   const colors = ['#6c63ff', '#ff6584', '#43e97b', '#f7b731', '#a29bfe', '#fd79a8']
//   let hash = 0
//   for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
//   return colors[Math.abs(hash) % colors.length]
// }

// const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

// export default function JobCard({ job, appliedJobIds = [], onApplied }) {
//   const { user } = useAuth()
//   const navigate = useNavigate()
//   const accent = getCardAccent(job.companyName)

//   const initials = (job.companyName || 'JP')
//     .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

//   const formattedSalary = job.salary
//     ? `₹${Number(job.salary).toLocaleString()} / LPA`
//     : 'Not disclosed'

//   const postedDate = job.postedDate
//     ? new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//     : ''

//   const alreadyApplied = appliedJobIds.includes(job.jobId)
//   const [applying, setApplying] = useState(false)
//   const [justApplied, setJustApplied] = useState(false)
//   const [applyErr, setApplyErr] = useState('')

//   const isJobSeeker = user && isRole(user, 'jobseeker')
//   const isEmployer  = user && isRole(user, 'employer')

//   const handleQuickApply = async (e) => {
//     e.preventDefault()
//     if (!user) { navigate('/login'); return }
//     if (!isJobSeeker) return

//     setApplying(true)
//     setApplyErr('')
//     try {
//       await applyJob(job.jobId, user.userId)
//       setJustApplied(true)
//       onApplied && onApplied(job.jobId)
//     } catch (err) {
//       const status = err?.response?.status
//       if (status === 409 || status === 500) {
//         setJustApplied(true)
//         onApplied && onApplied(job.jobId)
//       } else {
//         setApplyErr('Apply failed. Try again.')
//         setTimeout(() => setApplyErr(''), 3000)
//       }
//     } finally {
//       setApplying(false)
//     }
//   }

//   const applied = alreadyApplied || justApplied

//   return (
//     <div className="job-card fade-in" style={{ borderColor: applied ? 'rgba(67,233,123,0.3)' : '' }}>
//       <div className="job-card-body">
//         {/* Company logo */}
//         <div
//           className="company-logo"
//           style={{
//             background: `linear-gradient(135deg, ${accent}aa, ${accent}44)`,
//             border: `1px solid ${accent}55`,
//           }}
//         >
//           {initials}
//         </div>

//         <div className="job-title">{job.title}</div>
//         <div className="job-company">{job.companyName}</div>

//         <div className="job-meta">
//           {job.location && (
//             <span className="job-tag">
//               <i className="bi bi-geo-alt" /> {job.location}
//             </span>
//           )}
//           {postedDate && (
//             <span className="job-tag">
//               <i className="bi bi-calendar3" /> {postedDate}
//             </span>
//           )}
//         </div>

//         <div className="job-salary" style={{ color: accent }}>{formattedSalary}</div>

//         {job.description && (
//           <p className="job-desc-preview">{job.description}</p>
//         )}

//         {applyErr && (
//           <div style={{ color: '#ff6584', fontSize: '0.78rem', marginBottom: '10px' }}>
//             <i className="bi bi-exclamation-circle" /> {applyErr}
//           </div>
//         )}

//         {/* Action buttons */}
//         <div className="job-card-actions">
//           <Link
//             to={`/jobs/${job.jobId}`}
//             className="btn-view-job"
//             style={{ borderColor: `${accent}55`, color: accent }}
//           >
//             Details <i className="bi bi-arrow-right" />
//           </Link>

//           {/* Job seeker: Quick Apply or Applied badge
//           {isJobSeeker && (
//             applied ? (
//               <span className="job-applied-badge">
//                 <i className="bi bi-check-circle-fill" /> Applied
//               </span>
//             ) : (
//               <button
//                 className="btn-quick-apply"
//                 onClick={handleQuickApply}
//                 disabled={applying}
//                 style={{ background: accent }}
//               >
//                 {applying
//                   ? <><span className="btn-spinner" /> Applying...</>
//                   : <><i className="bi bi-send-fill" /> Apply</>
//                 }
//               </button>
//             )
//           )} */}
//         </div>
//       </div>
//     </div>
//   )
// }


import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { applyJob } from '../services/api'

function getCardAccent(str = '') {
  const colors = ['#6c63ff', '#ff6584', '#43e97b', '#f7b731', '#a29bfe', '#fd79a8']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

// Job type badge colors
const JOB_TYPE_STYLE = {
  'Full Time':  { bg: 'rgba(108,99,255,0.15)', color: '#a29bfe', border: 'rgba(108,99,255,0.35)' },
  'Part Time':  { bg: 'rgba(247,183,49,0.15)',  color: '#f7b731', border: 'rgba(247,183,49,0.35)' },
  'Internship': { bg: 'rgba(255,101,132,0.15)', color: '#ff6584', border: 'rgba(255,101,132,0.35)' },
  'Remote':     { bg: 'rgba(67,233,123,0.15)',  color: '#43e97b', border: 'rgba(67,233,123,0.35)' },
  'Contract':   { bg: 'rgba(0,210,255,0.15)',   color: '#00d2ff', border: 'rgba(0,210,255,0.35)'  },
}

// Saved jobs helpers — stored in localStorage
const SAVE_KEY = 'jp_saved_jobs'
function getSaved() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]') } catch { return [] }
}
function toggleSave(jobId) {
  const saved = getSaved()
  const next = saved.includes(jobId) ? saved.filter(id => id !== jobId) : [...saved, jobId]
  localStorage.setItem(SAVE_KEY, JSON.stringify(next))
  return next.includes(jobId)
}

export default function JobCard({ job, appliedJobIds = [], onApplied }) {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const accent    = getCardAccent(job.companyName)

  const initials = (job.companyName || 'JP')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const formattedSalary = job.salary
    ? `₹${Number(job.salary).toLocaleString()} / yr`
    : 'Not disclosed'

  const postedDate = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  const alreadyApplied = appliedJobIds.includes(job.jobId)
  const [applying, setApplying]     = useState(false)
  const [justApplied, setJustApplied] = useState(false)
  const [applyErr, setApplyErr]     = useState('')

  // Bookmark state
  const [saved, setSaved] = useState(() => getSaved().includes(job.jobId))
  const [saveAnim, setSaveAnim] = useState(false)

  const isJobSeeker = user && isRole(user, 'jobseeker')

  const handleQuickApply = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!isJobSeeker) return
    setApplying(true)
    setApplyErr('')
    try {
      await applyJob(job.jobId, user.userId)
      setJustApplied(true)
      onApplied && onApplied(job.jobId)
    } catch (err) {
      const status = err?.response?.status
      if (status === 409 || status === 500) {
        setJustApplied(true)
        onApplied && onApplied(job.jobId)
      } else {
        setApplyErr('Apply failed. Try again.')
        setTimeout(() => setApplyErr(''), 3000)
      }
    } finally {
      setApplying(false)
    }
  }

  const handleBookmark = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const nowSaved = toggleSave(job.jobId)
    setSaved(nowSaved)
    setSaveAnim(true)
    setTimeout(() => setSaveAnim(false), 400)
    // dispatch storage event so SavedJobs page refreshes in same tab
    window.dispatchEvent(new Event('savedJobsChanged'))
  }

  const applied = alreadyApplied || justApplied
  const typeStyle = JOB_TYPE_STYLE[job.jobType] || null

  return (
    <div
      className="job-card fade-in"
      style={{ borderColor: applied ? 'rgba(67,233,123,0.3)' : '' }}
    >
      <div className="job-card-body">

        {/* Top row: logo + bookmark */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div
            className="company-logo"
            style={{
              background: `linear-gradient(135deg, ${accent}aa, ${accent}44)`,
              border: `1px solid ${accent}55`,
              margin: 0,
            }}
          >
            {initials}
          </div>

          {/* Bookmark button — visible for everyone */}
          <button
            onClick={handleBookmark}
            className={`job-bookmark-btn ${saved ? 'job-bookmark-btn-saved' : ''} ${saveAnim ? 'job-bookmark-pop' : ''}`}
            title={saved ? 'Remove bookmark' : 'Save job'}
          >
            <i className={`bi ${saved ? 'bi-bookmark-fill' : 'bi-bookmark'}`} />
          </button>
        </div>

        <div className="job-title">{job.title}</div>
        <div className="job-company">{job.companyName}</div>

        {/* Job Type badge — NEW */}
        {job.jobType && typeStyle && (
          <span
            className="job-type-badge"
            style={{ background: typeStyle.bg, color: typeStyle.color, borderColor: typeStyle.border }}
          >
            {job.jobType}
          </span>
        )}

        <div className="job-meta" style={{ marginTop: '12px' }}>
          {job.location && (
            <span className="job-tag">
              <i className="bi bi-geo-alt" /> {job.location}
            </span>
          )}
          {postedDate && (
            <span className="job-tag">
              <i className="bi bi-calendar3" /> {postedDate}
            </span>
          )}
        </div>

        <div className="job-salary" style={{ color: accent }}>{formattedSalary}</div>

        {job.description && (
          <p className="job-desc-preview">{job.description}</p>
        )}

        {applyErr && (
          <div style={{ color: '#ff6584', fontSize: '0.78rem', marginBottom: '10px' }}>
            <i className="bi bi-exclamation-circle" /> {applyErr}
          </div>
        )}

        {/* Applied badge */}
        {/* {applied && (
          <div className="job-applied-strip">
            <i className="bi bi-check-circle-fill" /> Applied
          </div>
        )} */}

        {/* Action buttons */}
        <div className="job-card-actions">
          <Link
            to={`/jobs/${job.jobId}`}
            className="btn-view-job"
            style={{ borderColor: `${accent}55`, color: accent }}
          >
            Details <i className="bi bi-arrow-right" />
          </Link>

          {/* {isJobSeeker && !applied && (
            <button
              className="btn-quick-apply"
              onClick={handleQuickApply}
              disabled={applying}
              style={{ background: accent }}
            >
              {applying
                ? <><span className="btn-spinner" /> Applying...</>
                : <><i className="bi bi-send-fill" /> Apply</>
              }
            </button>
          )} */}
        </div>

      </div>
    </div>
  )
}