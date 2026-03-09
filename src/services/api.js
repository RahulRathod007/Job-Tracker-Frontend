import axios from 'axios'

const API_BASE = 'http://localhost:8080'

// Reads token that AuthContext saved in localStorage
const getToken = () => localStorage.getItem('jp_at')
const getRT    = () => localStorage.getItem('jp_rt')

const API = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
let refreshing = false
let queue = []
const flush = (err, token = null) => { queue.forEach(({ resolve, reject }) => err ? reject(err) : resolve(token)); queue = [] }

API.interceptors.response.use(
  res => res,
  async (error) => {
    const orig = error.config
    if (error.response?.status !== 401 || orig._retry || orig.url?.includes('/auth/')) return Promise.reject(error)

    if (refreshing) return new Promise((resolve, reject) => queue.push({ resolve, reject }))
      .then(t => { orig.headers['Authorization'] = `Bearer ${t}`; return API(orig) })

    orig._retry = true
    refreshing  = true

    try {
      const rt  = getRT()
      if (!rt) throw new Error('No refresh token')
      const res = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken: rt })
      localStorage.setItem('jp_at', res.data.accessToken)
      localStorage.setItem('jp_rt', res.data.refreshToken)
      flush(null, res.data.accessToken)
      window.dispatchEvent(new CustomEvent('jp:tokens-refreshed', { detail: res.data }))
      orig.headers['Authorization'] = `Bearer ${res.data.accessToken}`
      return API(orig)
    } catch (err) {
      flush(err)
      ;['jp_at','jp_rt','jp_user'].forEach(k => localStorage.removeItem(k))
      window.dispatchEvent(new Event('jp:session-expired'))
      return Promise.reject(err)
    } finally {
      refreshing = false
    }
  }
)

// ── AUTH ──────────────────────────────────────────────────────────
export const register    = (data) => API.post('/auth/register', data)
export const login       = (data) => API.post('/auth/login',    data)
export const googleAuth  = (data) => API.post('/auth/google',   data)
export const refreshAuth = (rt)   => API.post('/auth/refresh',  { refreshToken: rt })

// ── USERS ─────────────────────────────────────────────────────────
export const getAllUsers = () => API.get('/users/all')

// ── JOBS ──────────────────────────────────────────────────────────
export const getAllJobs        = ()                            => API.get('/jobs/all')
export const searchByLocation  = (loc)                        => API.get(`/jobs/search/${encodeURIComponent(loc)}`)
export const filterJobs        = (keyword = '', jobType = '') => API.get(`/jobs/filter?keyword=${encodeURIComponent(keyword)}&jobType=${encodeURIComponent(jobType)}`)
export const postJob           = (job, id)                    => API.post(`/jobs/post/${id}`, job)
export const updateJob         = (id, job)                    => API.put(`/jobs/update/${id}`, job)
export const deleteJob         = (id)                         => API.delete(`/jobs/delete/${id}`)

// ── APPLICATIONS ──────────────────────────────────────────────────
export const applyJob                = (jobId, userId)         => API.post(`/applications/apply/${jobId}/${userId}`)
export const getUserApplications     = (userId)                => API.get(`/applications/user/${userId}`)
export const getJobApplications      = (jobId)                 => API.get(`/applications/job/${jobId}`)
export const updateApplicationStatus = (applicationId, status) => API.put(`/applications/update/${applicationId}`, { status })

// ── FILE UPLOADS ──────────────────────────────────────────────────
export const uploadProfilePic = (userId, formData) =>
  axios.post(`${API_BASE}/api/files/upload/profile/${userId}`, formData, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
export const uploadCV = (userId, formData) =>
  axios.post(`${API_BASE}/api/files/upload/cv/${userId}`, formData, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })

export const getFileUrl = (filename) => `${API_BASE}/uploads/${filename}`
export { API_BASE }
export default API