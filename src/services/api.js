// import axios from 'axios'

// const API_BASE = 'http://localhost:8080'

// const API = axios.create({
//   baseURL: `${API_BASE}/api`,
//   headers: { 'Content-Type': 'application/json' },
// })

// // ── AUTH ──────────────────────────────────────────────
// export const register    = (data)   => API.post('/auth/register', data)
// export const login       = (data)   => API.post('/auth/login', data)

// // ── USERS ─────────────────────────────────────────────
// export const getAllUsers  = ()       => API.get('/users/all')

// // ── JOBS ──────────────────────────────────────────────
// export const getAllJobs        = ()           => API.get('/jobs/all')
// export const searchByLocation  = (loc)        => API.get(`/jobs/search/${encodeURIComponent(loc)}`)
// export const postJob           = (job, id)    => API.post(`/jobs/post/${id}`, job)
// export const updateJob         = (id, job)    => API.put(`/jobs/update/${id}`, job)
// export const deleteJob         = (id)         => API.delete(`/jobs/delete/${id}`)

// // ── APPLICATIONS ──────────────────────────────────────
// export const applyJob             = (jobId, userId) => API.post(`/applications/apply/${jobId}/${userId}`)
// export const getUserApplications  = (userId)        => API.get(`/applications/user/${userId}`)

// // ── FILE UPLOADS ──────────────────────────────────────
// export const uploadProfilePic = (userId, formData) =>
//   axios.post(`${API_BASE}/api/files/upload/profile/${userId}`, formData)

// export const uploadCV = (userId, formData) =>
//   axios.post(`${API_BASE}/api/files/upload/cv/${userId}`, formData)

// export const getFileUrl = (filename) => `${API_BASE}/uploads/${filename}`

// export { API_BASE }
// export default API



import axios from 'axios'

const API_BASE = 'http://localhost:8080'

const API = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// ── AUTH ──────────────────────────────────────────────
export const register    = (data)   => API.post('/auth/register', data)
export const login       = (data)   => API.post('/auth/login', data)

// ── USERS ─────────────────────────────────────────────
export const getAllUsers  = ()       => API.get('/users/all')

// ── JOBS ──────────────────────────────────────────────
export const getAllJobs        = ()           => API.get('/jobs/all')
export const searchByLocation  = (loc)        => API.get(`/jobs/search/${encodeURIComponent(loc)}`)
export const postJob           = (job, id)    => API.post(`/jobs/post/${id}`, job)
export const updateJob         = (id, job)    => API.put(`/jobs/update/${id}`, job)
export const deleteJob         = (id)         => API.delete(`/jobs/delete/${id}`)

// ── APPLICATIONS ──────────────────────────────────────
export const applyJob                = (jobId, userId)          => API.post(`/applications/apply/${jobId}/${userId}`)
export const getUserApplications     = (userId)                 => API.get(`/applications/user/${userId}`)
export const getJobApplications      = (jobId)                  => API.get(`/applications/job/${jobId}`)
export const updateApplicationStatus = (applicationId, status)  => API.put(`/applications/update/${applicationId}`, { status })

// ── FILE UPLOADS ──────────────────────────────────────
export const uploadProfilePic = (userId, formData) =>
  axios.post(`${API_BASE}/api/files/upload/profile/${userId}`, formData)

export const uploadCV = (userId, formData) =>
  axios.post(`${API_BASE}/api/files/upload/cv/${userId}`, formData)

export const getFileUrl = (filename) => `${API_BASE}/uploads/${filename}`

export { API_BASE }
export default API