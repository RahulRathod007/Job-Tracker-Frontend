// import { useState, useEffect } from 'react'
// import { Link, Navigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'
// import Spinner from '../components/Spinner'
// import { getAllJobs, getUserApplications, deleteJob, getJobApplications, updateJob } from '../services/api'

// const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

// // NEW — job type options for edit modal
// const JOB_TYPES  = ['Full Time', 'Part Time', 'Internship', 'Remote', 'Contract']
// const TYPE_ICONS = {
//   'Full Time': 'bi-briefcase-fill', 'Part Time': 'bi-clock-fill',
//   'Internship': 'bi-mortarboard-fill', 'Remote': 'bi-house-fill', 'Contract': 'bi-file-earmark-text-fill',
// }

// const STATUS_CONFIG = {
//   APPLIED:             { label: 'Applied',             bg: 'rgba(108,99,255,0.12)', color: '#a29bfe', border: 'rgba(108,99,255,0.3)' },
//   RESUME_VIEWED:       { label: 'Resume Viewed',       bg: 'rgba(247,183,49,0.12)', color: '#f7b731', border: 'rgba(247,183,49,0.3)' },
//   SHORTLISTED:         { label: 'Shortlisted',         bg: 'rgba(67,233,123,0.12)', color: '#43e97b', border: 'rgba(67,233,123,0.3)' },
//   INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', bg: 'rgba(0,210,255,0.12)',  color: '#00d2ff', border: 'rgba(0,210,255,0.3)'  },
//   HIRED:               { label: 'Hired 🎉',            bg: 'rgba(67,233,123,0.15)', color: '#43e97b', border: 'rgba(67,233,123,0.4)' },
//   REJECTED:            { label: 'Rejected',            bg: 'rgba(255,101,132,0.1)', color: '#ff6584', border: 'rgba(255,101,132,0.3)' },
// }

// // ── NEW — Edit Job Modal ──────────────────────────────────────────────────
// function EditJobModal({ job, onClose, onSaved }) {
//   const [form, setForm]     = useState({
//     title:       job.title       || '',
//     companyName: job.companyName || '',
//     location:    job.location    || '',
//     salary:      job.salary      || '',
//     jobType:     job.jobType     || 'Full Time',
//     description: job.description || '',
//   })
//   const [saving, setSaving] = useState(false)
//   const [error, setError]   = useState('')

//   const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

//   const handleSave = async e => {
//     e.preventDefault()
//     setSaving(true)
//     setError('')
//     try {
//       const res = await updateJob(job.jobId, {
//         ...form,
//         salary: form.salary ? Number(form.salary) : null,
//       })
//       onSaved(res.data)
//       onClose()
//     } catch (err) {
//       setError(err?.response?.data?.error || 'Failed to update job. Please try again.')
//     } finally {
//       setSaving(false)
//     }
//   }

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-box" onClick={e => e.stopPropagation()}>

//         {/* Header */}
//         <div className="modal-header">
//           <div>
//             <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
//               Edit Listing
//             </div>
//             <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Update Job Details</h4>
//           </div>
//           <button className="modal-close-btn" onClick={onClose}>
//             <i className="bi bi-x-lg" />
//           </button>
//         </div>

//         {error && (
//           <div className="alert-jp" style={{ margin: '0 0 16px' }}>
//             <i className="bi bi-exclamation-circle-fill" /> {error}
//           </div>
//         )}

//         <form onSubmit={handleSave}>

//           {/* Title + Company */}
//           <div className="form-row" style={{ marginBottom: 0 }}>
//             <div className="form-group-jp" style={{ margin: 0 }}>
//               <label className="form-label-jp">Job Title</label>
//               <input type="text" name="title" className="form-control-jp"
//                 value={form.title} onChange={handleChange} required />
//             </div>
//             <div className="form-group-jp" style={{ margin: 0 }}>
//               <label className="form-label-jp">Company Name</label>
//               <input type="text" name="companyName" className="form-control-jp"
//                 value={form.companyName} onChange={handleChange} required />
//             </div>
//           </div>

//           {/* Location + Salary */}
//           <div className="form-row" style={{ marginBottom: 0 }}>
//             <div className="form-group-jp" style={{ margin: 0 }}>
//               <label className="form-label-jp">Location</label>
//               <input type="text" name="location" className="form-control-jp"
//                 value={form.location} onChange={handleChange} required />
//             </div>
//             <div className="form-group-jp" style={{ margin: 0 }}>
//               <label className="form-label-jp">Salary (₹, optional)</label>
//               <input type="number" name="salary" className="form-control-jp"
//                 value={form.salary} onChange={handleChange} min="0" />
//             </div>
//           </div>

//           {/* Job Type */}
//           <div className="form-group-jp">
//             <label className="form-label-jp">Job Type</label>
//             <div className="postjob-type-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
//               {JOB_TYPES.map(type => (
//                 <button key={type} type="button"
//                   onClick={() => setForm(p => ({ ...p, jobType: type }))}
//                   className={`postjob-type-btn ${form.jobType === type ? 'postjob-type-btn-active' : ''}`}
//                   style={{ padding: '8px 6px', fontSize: '0.75rem' }}>
//                   <i className={`bi ${TYPE_ICONS[type]}`} />
//                   {type}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Description */}
//           <div className="form-group-jp">
//             <label className="form-label-jp">Job Description</label>
//             <textarea name="description" className="form-control-jp"
//               value={form.description} onChange={handleChange} rows={6} required />
//           </div>

//           {/* Actions */}
//           <div style={{ display: 'flex', gap: '12px' }}>
//             <button type="button" className="btn-secondary-jp" onClick={onClose}
//               style={{ flex: 1, justifyContent: 'center' }}>
//               Cancel
//             </button>
//             <button type="submit" className="btn-primary-jp" disabled={saving}
//               style={{ flex: 2, justifyContent: 'center' }}>
//               {saving
//                 ? <><span className="btn-spinner" /> Saving...</>
//                 : <><i className="bi bi-check-circle-fill" /> Save Changes</>}
//             </button>
//           </div>

//         </form>
//       </div>
//     </div>
//   )
// }

// // ── Dashboard ─────────────────────────────────────────────────────────────
// export default function Dashboard() {
//   const { user } = useAuth()
//   const [jobs, setJobs]                     = useState([])
//   const [applications, setApplications]     = useState([])
//   const [applicantCounts, setApplicantCounts] = useState({})
//   const [loading, setLoading]               = useState(true)
//   const [deletingId, setDeletingId]         = useState(null)
//   const [editingJob, setEditingJob]         = useState(null)   // NEW — tracks which job is being edited

//   if (!user) return <Navigate to="/login" replace />

//   const isEmployer = isRole(user, 'employer')

//   useEffect(() => {
//     const load = async () => {
//       try {
//         if (isEmployer) {
//           const res = await getAllJobs()
//           const all = Array.isArray(res.data) ? res.data : []
//           const myJobs = all.filter(j => j.employer?.userId === user.userId)
//           setJobs(myJobs)

//           // Fetch applicant counts for each job in parallel
//           const countEntries = await Promise.all(
//             myJobs.map(async (job) => {
//               try {
//                 const r = await getJobApplications(job.jobId)
//                 return [job.jobId, Array.isArray(r.data) ? r.data.length : 0]
//               } catch {
//                 return [job.jobId, 0]
//               }
//             })
//           )
//           setApplicantCounts(Object.fromEntries(countEntries))
//         } else {
//           const res = await getUserApplications(user.userId)
//           setApplications(Array.isArray(res.data) ? res.data : [])
//         }
//       } catch {}
//       setLoading(false)
//     }
//     load()
//   }, [user.userId, isEmployer])

//   const handleDelete = async (jobId) => {
//     if (!window.confirm('Delete this job listing?')) return
//     setDeletingId(jobId)
//     try {
//       await deleteJob(jobId)
//       setJobs(prev => prev.filter(j => j.jobId !== jobId))
//     } catch {
//       alert('Failed to delete job. Please try again.')
//     } finally {
//       setDeletingId(null)
//     }
//   }

//   // NEW — called by modal after successful save, updates the card in-place
//   const handleJobSaved = (updatedJob) => {
//     setJobs(prev => prev.map(j => j.jobId === updatedJob.jobId ? updatedJob : j))
//   }

//   const greeting = () => {
//     const hr = new Date().getHours()
//     if (hr < 12) return 'Good morning'
//     if (hr < 18) return 'Good afternoon'
//     return 'Good evening'
//   }

//   return (
//     <div className="app-wrapper">
//       <Navbar />

//       {/* NEW — Edit Job Modal renders here when employer clicks Edit */}
//       {editingJob && (
//         <EditJobModal
//           job={editingJob}
//           onClose={() => setEditingJob(null)}
//           onSaved={handleJobSaved}
//         />
//       )}

//       <main className="page-content">
//         <div className="container">

//           {/* Welcome */}
//           <div className="fade-in" style={{ marginBottom: '40px' }}>
//             <span className="section-label">Dashboard</span>
//             <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '10px' }}>
//               {greeting()}, {user.name.split(' ')[0]}! 👋
//             </h1>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
//               <span className={isEmployer ? 'badge-jp badge-employer' : 'badge-jp badge-jobseeker'}>
//                 <i className={`bi bi-${isEmployer ? 'building' : 'person'}`}></i>
//                 {isEmployer ? 'Employer' : 'Job Seeker'}
//               </span>
//               <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</span>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className="row g-4 mb-5">
//             {isEmployer ? (
//               <>
//                 <div className="col-md-4">
//                   <Link to="/post-job" className="dashboard-action-card">
//                     <div className="dashboard-icon dashboard-icon-purple">
//                       <i className="bi bi-plus-circle-fill"></i>
//                     </div>
//                     <div>Post a Job</div>
//                     <small>Create a new listing</small>
//                   </Link>
//                 </div>
//                 <div className="col-md-4">
//                   <Link to="/jobs" className="dashboard-action-card">
//                     <div className="dashboard-icon dashboard-icon-pink">
//                       <i className="bi bi-briefcase-fill"></i>
//                     </div>
//                     <div>Browse Jobs</div>
//                     <small>See all listings</small>
//                   </Link>
//                 </div>
//                 <div className="col-md-4">
//                   <Link to="/profile" className="dashboard-action-card">
//                     <div className="dashboard-icon dashboard-icon-green">
//                       <i className="bi bi-person-fill"></i>
//                     </div>
//                     <div>My Profile</div>
//                     <small>Update settings</small>
//                   </Link>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className="col-md-4">
//                   <Link to="/jobs" className="dashboard-action-card">
//                     <div className="dashboard-icon dashboard-icon-purple">
//                       <i className="bi bi-search"></i>
//                     </div>
//                     <div>Find Jobs</div>
//                     <small>Browse open roles</small>
//                   </Link>
//                 </div>
//                 <div className="col-md-4">
//                   <Link to="/my-applications" className="dashboard-action-card">
//                     <div className="dashboard-icon dashboard-icon-green">
//                       <i className="bi bi-list-check"></i>
//                     </div>
//                     <div>Applications</div>
//                     <small>{applications.length} submitted</small>
//                   </Link>
//                 </div>
//                 <div className="col-md-4">
//                   <Link to="/profile" className="dashboard-action-card">
//                     <div className="dashboard-icon dashboard-icon-pink">
//                       <i className="bi bi-file-earmark-person-fill"></i>
//                     </div>
//                     <div>My Profile</div>
//                     <small>{user.cvFilename ? 'CV uploaded ✓' : 'Upload your CV'}</small>
//                   </Link>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Employer: My Jobs */}
//           {isEmployer && (
//             <div className="fade-in">
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
//                 <h3>My Job Listings <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1rem' }}>({jobs.length})</span></h3>
//                 <Link to="/post-job" className="btn-primary-jp" style={{ fontSize: '0.88rem', padding: '8px 18px' }}>
//                   <i className="bi bi-plus"></i> Post New
//                 </Link>
//               </div>

//               {loading ? <Spinner message="Loading your jobs..." /> : jobs.length === 0 ? (
//                 <div className="empty-state" style={{ padding: '48px' }}>
//                   <div className="empty-icon"><i className="bi bi-briefcase" style={{ fontSize: '2.5rem', opacity: 0.2 }}></i></div>
//                   <h4>No jobs posted yet</h4>
//                   <p>Post your first job to start receiving applications.</p>
//                   <Link to="/post-job" className="btn-primary-jp" style={{ marginTop: '16px', justifyContent: 'center' }}>
//                     <i className="bi bi-plus"></i> Post a Job
//                   </Link>
//                 </div>
//               ) : (
//                 <div className="row g-4">
//                   {jobs.map((job, i) => {
//                     const count = applicantCounts[job.jobId] ?? '...'
//                     return (
//                       <div key={job.jobId} className={`col-md-6 fade-in fade-in-delay-${Math.min(i+1,4)}`}>
//                         <div className="employer-job-card">
//                           <div className="employer-job-header">
//                             <div>
//                               <div className="employer-job-title">{job.title}</div>
//                               <div className="employer-job-company">{job.companyName}</div>
//                             </div>
//                             {/* NEW — shows Live badge + jobType badge side by side */}
//                             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
//                               <span className="employer-job-live-badge">Live</span>
//                               {job.jobType && (
//                                 <span style={{
//                                   fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px',
//                                   borderRadius: '100px', background: 'rgba(108,99,255,0.1)',
//                                   color: '#a29bfe', border: '1px solid rgba(108,99,255,0.2)',
//                                 }}>
//                                   {job.jobType}
//                                 </span>
//                               )}
//                             </div>
//                           </div>

//                           <div className="employer-job-meta">
//                             {job.location && <span className="job-tag"><i className="bi bi-geo-alt"></i> {job.location}</span>}
//                             {job.salary && <span className="job-tag"><i className="bi bi-currency-rupee"></i> {Number(job.salary).toLocaleString()} / yr</span>}
//                             {job.postedDate && <span className="job-tag"><i className="bi bi-calendar3"></i> {new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
//                           </div>

//                           {/* Applicant count badge */}
//                           <div style={{ margin: '12px 0 16px' }}>
//                             <Link
//                               to={`/jobs/${job.jobId}/applicants`}
//                               style={{
//                                 display: 'inline-flex', alignItems: 'center', gap: '8px',
//                                 padding: '8px 16px', borderRadius: '10px', textDecoration: 'none',
//                                 background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)',
//                                 color: '#a29bfe', fontSize: '0.84rem', fontWeight: 600,
//                                 transition: 'all 0.2s',
//                               }}
//                             >
//                               <i className="bi bi-people-fill" />
//                               {count} Applicant{count !== 1 ? 's' : ''}
//                               <i className="bi bi-arrow-right" style={{ fontSize: '0.75rem' }} />
//                             </Link>
//                           </div>

//                           <div className="employer-job-actions">
//                             <Link to={`/jobs/${job.jobId}`} className="btn-secondary-jp" style={{ fontSize: '0.82rem', padding: '7px 14px' }}>
//                               <i className="bi bi-eye"></i> View
//                             </Link>

//                             {/* NEW — Edit button opens the modal */}
//                             <button
//                               onClick={() => setEditingJob(job)}
//                               className="btn-secondary-jp"
//                               style={{
//                                 fontSize: '0.82rem', padding: '7px 14px',
//                                 background: 'rgba(247,183,49,0.1)',
//                                 borderColor: 'rgba(247,183,49,0.3)',
//                                 color: '#f7b731',
//                               }}
//                             >
//                               <i className="bi bi-pencil-fill"></i> Edit
//                             </button>

//                             <Link to={`/jobs/${job.jobId}/applicants`} className="btn-secondary-jp" style={{ fontSize: '0.82rem', padding: '7px 14px' }}>
//                               <i className="bi bi-people"></i> Applicants
//                             </Link>
//                             <button
//                               onClick={() => handleDelete(job.jobId)}
//                               disabled={deletingId === job.jobId}
//                               className="btn-danger-jp"
//                               style={{ fontSize: '0.82rem', padding: '7px 14px' }}
//                             >
//                               {deletingId === job.jobId ? <><span className="btn-spinner"></span> Deleting...</> : <><i className="bi bi-trash"></i> Delete</>}
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Job Seeker: Recent Applications */}
//           {!isEmployer && !loading && applications.length > 0 && (
//             <div className="fade-in fade-in-delay-2">
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
//                 <h3>Recent Applications</h3>
//                 <Link to="/my-applications" style={{ color: 'var(--accent)', fontSize: '0.88rem' }}>View all →</Link>
//               </div>
//               <div className="row g-4">
//                 {applications.slice(0, 4).map((app, i) => {
//                   const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED
//                   return (
//                     <div key={app.applicationId} className={`col-md-6 fade-in fade-in-delay-${i+1}`}>
//                       <div className="application-card">
//                         <div className="application-card-top">
//                           <div>
//                             <h5 className="application-title">{app.job?.title}</h5>
//                             <div className="application-company">{app.job?.companyName}</div>
//                           </div>
//                           <span className="status-badge" style={{
//                             background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
//                           }}>
//                             {cfg.label}
//                           </span>
//                         </div>
//                         <div className="application-meta">
//                           {app.job?.location && <span className="job-tag"><i className="bi bi-geo-alt"></i> {app.job.location}</span>}
//                           <span className="job-tag"><i className="bi bi-calendar3"></i> {new Date(app.applyDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
//                         </div>
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//           )}

//         </div>
//       </main>
//       <Footer />
//     </div>
//   )
// }



import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import { getAllJobs, getUserApplications, deleteJob, getJobApplications, updateJob } from '../services/api'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

// Returns today as YYYY-MM-DD for date input min attribute
const todayStr = () => new Date().toISOString().split('T')[0]

// Job is expired if deadline is set and has passed (including today)
const isExpired = (job) => {
  if (!job.deadline) return false
  return Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)) <= 0
}

// NEW — job type options for edit modal
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

// ── NEW — Edit Job Modal ──────────────────────────────────────────────────
function EditJobModal({ job, onClose, onSaved }) {
  const [form, setForm]     = useState({
    title:       job.title       || '',
    companyName: job.companyName || '',
    location:    job.location    || '',
    salary:      job.salary      || '',
    jobType:     job.jobType     || 'Full Time',
    description: job.description || '',
    deadline:    job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',   // NEW
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await updateJob(job.jobId, {
        ...form,
        salary:   form.salary   ? Number(form.salary) : null,
        deadline: form.deadline ? form.deadline       : null,   // NEW
      })
      onSaved(res.data)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update job. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              Edit Listing
            </div>
            <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Update Job Details</h4>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {error && (
          <div className="alert-jp" style={{ margin: '0 0 16px' }}>
            <i className="bi bi-exclamation-circle-fill" /> {error}
          </div>
        )}

        <form onSubmit={handleSave}>

          {/* Title + Company */}
          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group-jp" style={{ margin: 0 }}>
              <label className="form-label-jp">Job Title</label>
              <input type="text" name="title" className="form-control-jp"
                value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group-jp" style={{ margin: 0 }}>
              <label className="form-label-jp">Company Name</label>
              <input type="text" name="companyName" className="form-control-jp"
                value={form.companyName} onChange={handleChange} required />
            </div>
          </div>

          {/* Location + Salary */}
          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group-jp" style={{ margin: 0 }}>
              <label className="form-label-jp">Location</label>
              <input type="text" name="location" className="form-control-jp"
                value={form.location} onChange={handleChange} required />
            </div>
            <div className="form-group-jp" style={{ margin: 0 }}>
              <label className="form-label-jp">Salary (₹, optional)</label>
              <input type="number" name="salary" className="form-control-jp"
                value={form.salary} onChange={handleChange} min="0" />
            </div>
          </div>

          {/* Job Type */}
          <div className="form-group-jp">
            <label className="form-label-jp">Job Type</label>
            <div className="postjob-type-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {JOB_TYPES.map(type => (
                <button key={type} type="button"
                  onClick={() => setForm(p => ({ ...p, jobType: type }))}
                  className={`postjob-type-btn ${form.jobType === type ? 'postjob-type-btn-active' : ''}`}
                  style={{ padding: '8px 6px', fontSize: '0.75rem' }}>
                  <i className={`bi ${TYPE_ICONS[type]}`} />
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* NEW — Deadline date picker */}
          <div className="form-group-jp">
            <label className="form-label-jp">
              <i className="bi bi-calendar-x" style={{ marginRight: '6px', color: 'var(--accent-2)' }} />
              Application Deadline
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              type="date"
              name="deadline"
              className="form-control-jp"
              value={form.deadline}
              onChange={handleChange}
              min={todayStr()}
              style={{ colorScheme: 'dark' }}
            />
            {form.deadline && (() => {
              const days = Math.ceil((new Date(form.deadline) - new Date()) / (1000 * 60 * 60 * 24))
              const color = days <= 0 ? '#ff6584' : days <= 7 ? '#f7b731' : '#43e97b'
              const label = days <= 0 ? 'Expired' : days === 1 ? '1 day left' : `${days} days left`
              return (
                <div style={{ marginTop: '8px' }}>
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 600, padding: '3px 12px',
                    borderRadius: '100px', background: 'rgba(255,101,132,0.08)',
                    border: `1px solid ${color}44`, color,
                  }}>
                    <i className="bi bi-hourglass-split" style={{ marginRight: '4px' }} />
                    {label}
                  </span>
                </div>
              )
            })()}
          </div>

          {/* Description */}
          <div className="form-group-jp">
            <label className="form-label-jp">Job Description</label>
            <textarea name="description" className="form-control-jp"
              value={form.description} onChange={handleChange} rows={6} required />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn-secondary-jp" onClick={onClose}
              style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-jp" disabled={saving}
              style={{ flex: 2, justifyContent: 'center' }}>
              {saving
                ? <><span className="btn-spinner" /> Saving...</>
                : <><i className="bi bi-check-circle-fill" /> Save Changes</>}
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
  const [jobs, setJobs]                     = useState([])
  const [applications, setApplications]     = useState([])
  const [applicantCounts, setApplicantCounts] = useState({})
  const [loading, setLoading]               = useState(true)
  const [deletingId, setDeletingId]         = useState(null)
  const [editingJob, setEditingJob]         = useState(null)   // tracks which job is being edited
  const [jobFilter, setJobFilter]           = useState('all')  // NEW — 'all' | 'live' | 'expired'

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

  // NEW — called by modal after successful save, updates the card in-place
  const handleJobSaved = (updatedJob) => {
    setJobs(prev => prev.map(j => j.jobId === updatedJob.jobId ? updatedJob : j))
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

      {/* NEW — Edit Job Modal renders here when employer clicks Edit */}
      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSaved={handleJobSaved}
        />
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3>My Job Listings <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1rem' }}>({jobs.length})</span></h3>
                <Link to="/post-job" className="btn-primary-jp" style={{ fontSize: '0.88rem', padding: '8px 18px' }}>
                  <i className="bi bi-plus"></i> Post New
                </Link>
              </div>

              {/* NEW — Filter tabs: All / Live / Expired */}
              {!loading && jobs.length > 0 && (() => {
                const liveCount    = jobs.filter(j => !isExpired(j)).length
                const expiredCount = jobs.filter(j => isExpired(j)).length
                return (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'all',     label: 'All',     count: jobs.length,    icon: 'bi-grid-fill'        },
                      { key: 'live',    label: 'Live',    count: liveCount,      icon: 'bi-broadcast'        },
                      { key: 'expired', label: 'Expired', count: expiredCount,   icon: 'bi-calendar-x-fill'  },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setJobFilter(tab.key)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '7px',
                          padding: '8px 18px', borderRadius: '100px', cursor: 'pointer',
                          fontFamily: 'DM Sans, sans-serif', fontSize: '0.84rem', fontWeight: 600,
                          transition: 'all 0.2s',
                          border: jobFilter === tab.key
                            ? tab.key === 'expired' ? '1px solid rgba(255,101,132,0.5)' : '1px solid rgba(108,99,255,0.5)'
                            : '1px solid var(--border)',
                          background: jobFilter === tab.key
                            ? tab.key === 'expired' ? 'rgba(255,101,132,0.12)' : 'rgba(108,99,255,0.12)'
                            : 'transparent',
                          color: jobFilter === tab.key
                            ? tab.key === 'expired' ? '#ff6584' : 'var(--accent)'
                            : 'var(--text-muted)',
                        }}
                      >
                        <i className={`bi ${tab.icon}`} />
                        {tab.label}
                        <span style={{
                          background: jobFilter === tab.key
                            ? tab.key === 'expired' ? 'rgba(255,101,132,0.2)' : 'rgba(108,99,255,0.2)'
                            : 'rgba(255,255,255,0.06)',
                          borderRadius: '100px', padding: '1px 8px', fontSize: '0.75rem',
                        }}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )
              })()}

              {loading ? <Spinner message="Loading your jobs..." /> : jobs.length === 0 ? (
                <div className="empty-state" style={{ padding: '48px' }}>
                  <div className="empty-icon"><i className="bi bi-briefcase" style={{ fontSize: '2.5rem', opacity: 0.2 }}></i></div>
                  <h4>No jobs posted yet</h4>
                  <p>Post your first job to start receiving applications.</p>
                  <Link to="/post-job" className="btn-primary-jp" style={{ marginTop: '16px', justifyContent: 'center' }}>
                    <i className="bi bi-plus"></i> Post a Job
                  </Link>
                </div>
              ) : (() => {
                const filtered = jobs.filter(job =>
                  jobFilter === 'all' ? true :
                  jobFilter === 'live' ? !isExpired(job) :
                  isExpired(job)
                )
                if (filtered.length === 0) return (
                  <div className="empty-state" style={{ padding: '48px' }}>
                    <div className="empty-icon">
                      <i className={`bi ${jobFilter === 'expired' ? 'bi-calendar-x' : 'bi-broadcast'}`} style={{ fontSize: '2.5rem', opacity: 0.2 }} />
                    </div>
                    <h4>No {jobFilter === 'expired' ? 'expired' : 'live'} listings</h4>
                    <p>{jobFilter === 'expired' ? 'None of your listings have passed their deadline.' : 'All your listings have expired.'}</p>
                  </div>
                )
                return (
                <div className="row g-4">
                  {filtered.map((job, i) => {
                    const count = applicantCounts[job.jobId] ?? '...'
                    return (
                      <div key={job.jobId} className={`col-md-6 fade-in fade-in-delay-${Math.min(i+1,4)}`}>
                        <div className="employer-job-card">
                          <div className="employer-job-header">
                            <div>
                              <div className="employer-job-title">{job.title}</div>
                              <div className="employer-job-company">{job.companyName}</div>
                            </div>
                            {/* Status badge: Live or Expired */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                              {isExpired(job) ? (
                                <span style={{
                                  background: 'rgba(255,101,132,0.12)', border: '1px solid rgba(255,101,132,0.3)',
                                  color: '#ff6584', borderRadius: '6px', padding: '3px 10px',
                                  fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap',
                                }}>
                                  <i className="bi bi-x-circle-fill" style={{ marginRight: '4px' }} />Expired
                                </span>
                              ) : (
                                <span className="employer-job-live-badge">
                                  <i className="bi bi-broadcast" style={{ marginRight: '4px' }} />Live
                                </span>
                              )}
                              {job.jobType && (
                                <span style={{
                                  fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px',
                                  borderRadius: '100px', background: 'rgba(108,99,255,0.1)',
                                  color: '#a29bfe', border: '1px solid rgba(108,99,255,0.2)',
                                }}>
                                  {job.jobType}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="employer-job-meta">
                            {job.location && <span className="job-tag"><i className="bi bi-geo-alt"></i> {job.location}</span>}
                            {job.salary && <span className="job-tag"><i className="bi bi-currency-rupee"></i> {Number(job.salary).toLocaleString()} / yr</span>}
                            {job.postedDate && <span className="job-tag"><i className="bi bi-calendar3"></i> {new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                          </div>

                          {/* NEW — Deadline badge with actual date for employer */}
                          {job.deadline && (() => {
                            const days    = Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                            const dateStr = new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            const color   = days <= 0 ? '#ff6584' : days <= 3 ? '#ff6584' : days <= 7 ? '#f7b731' : '#43e97b'
                            const bg      = days <= 0 ? 'rgba(255,101,132,0.08)' : days <= 7 ? 'rgba(247,183,49,0.08)' : 'rgba(67,233,123,0.07)'
                            const border  = days <= 0 ? 'rgba(255,101,132,0.25)' : days <= 7 ? 'rgba(247,183,49,0.25)' : 'rgba(67,233,123,0.25)'
                            const urgency = days <= 0 ? 'Deadline passed' : days === 1 ? 'Closes tomorrow' : days <= 7 ? `${days} days left` : null
                            return (
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '7px 12px', borderRadius: '8px', marginTop: '4px',
                                background: bg, border: `1px solid ${border}`, color,
                                fontSize: '0.82rem',
                              }}>
                                <i className={`bi ${days <= 0 ? 'bi-calendar-x-fill' : days <= 7 ? 'bi-hourglass-split' : 'bi-calendar-check'}`} />
                                <span>
                                  <span style={{ fontWeight: 700 }}>
                                    {urgency ? `${urgency} · ` : 'Deadline: '}
                                  </span>
                                  <span style={{ fontWeight: urgency ? 500 : 700 }}>{dateStr}</span>
                                </span>
                              </div>
                            )
                          })()}

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

                            {/* NEW — Edit button opens the modal */}
                            <button
                              onClick={() => setEditingJob(job)}
                              className="btn-secondary-jp"
                              style={{
                                fontSize: '0.82rem', padding: '7px 14px',
                                background: 'rgba(247,183,49,0.1)',
                                borderColor: 'rgba(247,183,49,0.3)',
                                color: '#f7b731',
                              }}
                            >
                              <i className="bi bi-pencil-fill"></i> Edit
                            </button>

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
                )
              })()}
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