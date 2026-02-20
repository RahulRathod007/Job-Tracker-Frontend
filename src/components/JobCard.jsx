// import { Link } from 'react-router-dom'

// // Deterministic color per company name
// function getCardAccent(str = '') {
//   const colors = ['#6c63ff', '#ff6584', '#43e97b', '#f7b731', '#a29bfe', '#fd79a8']
//   let hash = 0
//   for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
//   return colors[Math.abs(hash) % colors.length]
// }

// export default function JobCard({ job }) {
//   const accent = getCardAccent(job.companyName)
//   const initials = (job.companyName || 'JP')
//     .split(' ')
//     .map(w => w[0])
//     .join('')
//     .slice(0, 2)
//     .toUpperCase()

//   const formattedSalary = job.salary
//     ? `₹${Number(job.salary).toLocaleString()} / month`
//     : 'Not disclosed'

//   const postedDate = job.postedDate
//     ? new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//     : ''

//   return (
//     <div className="job-card fade-in">
//       <div className="job-card-body">
//         <div
//           className="company-logo"
//           style={{ background: `linear-gradient(135deg, ${accent}aa, ${accent}44)`, border: `1px solid ${accent}55` }}
//         >
//           {initials}
//         </div>

//         <div className="job-title">{job.title}</div>
//         <div className="job-company">{job.companyName}</div>

//         <div className="job-meta">
//           {job.location && (
//             <span className="job-tag">
//               <i className="bi bi-geo-alt"></i>
//               {job.location}
//             </span>
//           )}
//           {postedDate && (
//             <span className="job-tag">
//               <i className="bi bi-calendar3"></i>
//               {postedDate}
//             </span>
//           )}
//         </div>

//         <div className="job-salary" style={{ color: accent }}>
//           {formattedSalary}
//         </div>

//         {job.description && (
//           <p style={{
//             fontSize: '0.83rem',
//             color: 'var(--text-muted)',
//             marginBottom: '20px',
//             lineHeight: 1.6,
//             overflow: 'hidden',
//             display: '-webkit-box',
//             WebkitLineClamp: 2,
//             WebkitBoxOrient: 'vertical',
//           }}>
//             {job.description}
//           </p>
//         )}

//         <Link
//           to={`/jobs/${job.jobId}`}
//           className="btn-view-job"
//           style={{ borderColor: `${accent}55`, color: accent }}
//         >
//           View Details <i className="bi bi-arrow-right"></i>
//         </Link>
//       </div>
//     </div>
//   )
// }


import { useState } from 'react'
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

export default function JobCard({ job, appliedJobIds = [], onApplied }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const accent = getCardAccent(job.companyName)

  const initials = (job.companyName || 'JP')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const formattedSalary = job.salary
    ? `₹${Number(job.salary).toLocaleString()} / yr`
    : 'Not disclosed'

  const postedDate = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  const alreadyApplied = appliedJobIds.includes(job.jobId)
  const [applying, setApplying] = useState(false)
  const [justApplied, setJustApplied] = useState(false)
  const [applyErr, setApplyErr] = useState('')

  const isJobSeeker = user && isRole(user, 'jobseeker')
  const isEmployer  = user && isRole(user, 'employer')

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

  const applied = alreadyApplied || justApplied

  return (
    <div className="job-card fade-in" style={{ borderColor: applied ? 'rgba(67,233,123,0.3)' : '' }}>
      <div className="job-card-body">
        {/* Company logo */}
        <div
          className="company-logo"
          style={{
            background: `linear-gradient(135deg, ${accent}aa, ${accent}44)`,
            border: `1px solid ${accent}55`,
          }}
        >
          {initials}
        </div>

        <div className="job-title">{job.title}</div>
        <div className="job-company">{job.companyName}</div>

        <div className="job-meta">
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

        {/* Action buttons */}
        <div className="job-card-actions">
          <Link
            to={`/jobs/${job.jobId}`}
            className="btn-view-job"
            style={{ borderColor: `${accent}55`, color: accent }}
          >
            Details <i className="bi bi-arrow-right" />
          </Link>

          {/* Job seeker: Quick Apply or Applied badge
          {isJobSeeker && (
            applied ? (
              <span className="job-applied-badge">
                <i className="bi bi-check-circle-fill" /> Applied
              </span>
            ) : (
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
            )
          )} */}
        </div>
      </div>
    </div>
  )
}