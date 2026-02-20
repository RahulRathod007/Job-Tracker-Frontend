import { useState, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { uploadProfilePic, uploadCV, getAllUsers, getFileUrl } from '../services/api'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [uploading, setUploading] = useState(null) // 'pic' | 'cv' | null
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const picRef = useRef()
  const cvRef = useRef()

  if (!user) return <Navigate to="/login" replace />

  const profilePictureUrl = user.profilePicture ? getFileUrl(user.profilePicture) : null
  const cvUrl = user.cvFilename ? getFileUrl(user.cvFilename) : null

  const refreshUser = async () => {
    try {
      const res = await getAllUsers()
      const fresh = res.data.find(u => u.userId === user.userId)
      if (fresh) updateUser(fresh)
    } catch {}
  }

  const showMsg = (msg) => { setMessage(msg); setError(''); setTimeout(() => setMessage(''), 4000) }
  const showErr = (msg) => { setError(msg); setMessage(''); setTimeout(() => setError(''), 5000) }

  const handleProfilePic = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showErr('Only JPEG, PNG, or WebP images allowed'); return
    }
    if (file.size > 5 * 1024 * 1024) { showErr('Image must be under 5MB'); return }

    setUploading('pic')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await uploadProfilePic(user.userId, fd)
      updateUser({ profilePicture: res.data.fileName })
      showMsg('Profile picture updated!')
    } catch (err) {
      showErr(err?.response?.data?.error || 'Failed to upload profile picture')
    } finally {
      setUploading(null)
      e.target.value = ''
    }
  }

  const handleCV = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') { showErr('Only PDF files allowed for CV'); return }
    if (file.size > 10 * 1024 * 1024) { showErr('PDF must be under 10MB'); return }

    setUploading('cv')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await uploadCV(user.userId, fd)
      updateUser({ cvFilename: res.data.fileName })
      showMsg('CV uploaded successfully!')
    } catch (err) {
      showErr(err?.response?.data?.error || 'Failed to upload CV')
    } finally {
      setUploading(null)
      e.target.value = ''
    }
  }

  const initials = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="page-content">
        <div className="container" style={{ maxWidth: '740px' }}>

          <div className="page-header fade-in">
            <span className="section-label">Settings</span>
            <h1>My Profile</h1>
            <p>Manage your profile picture, CV and account info</p>
          </div>

          {message && (
            <div className="alert-jp alert-jp-success fade-in" style={{ marginBottom: '24px' }}>
              <i className="bi bi-check-circle-fill"></i> {message}
            </div>
          )}
          {error && (
            <div className="alert-jp fade-in" style={{ marginBottom: '24px' }}>
              <i className="bi bi-exclamation-circle-fill"></i> {error}
            </div>
          )}

          {/* ACCOUNT INFO */}
          <div className="jp-form-card fade-in fade-in-delay-1" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
              <i className="bi bi-person-fill me-2" style={{ color: 'var(--accent)' }}></i>
              Account Information
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[['Name', user.name], ['Email', user.email]].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Role</span>
                <span className={`badge-jp ${isRole(user, 'employer') ? 'badge-employer' : 'badge-jobseeker'}`}>
                  <i className={`bi bi-${isRole(user, 'employer') ? 'building' : 'person'}`}></i>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* PROFILE PICTURE */}
          <div className="jp-form-card fade-in fade-in-delay-2" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
              <i className="bi bi-image me-2" style={{ color: 'var(--accent)' }}></i>
              Profile Picture
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{
                width: '110px', height: '110px', borderRadius: '50%', flexShrink: 0,
                background: profilePictureUrl
                  ? `url(${profilePictureUrl}) center/cover`
                  : 'linear-gradient(135deg, #6c63ff, #00f5a0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.2rem', fontWeight: 800, color: '#fff',
                border: '3px solid var(--border-accent)',
                boxShadow: '0 0 25px rgba(108,99,255,0.3)',
              }}>
                {!profilePictureUrl && initials}
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
                  Accepted: JPEG, PNG, WebP · Max 5MB
                </p>
                <button
                  onClick={() => picRef.current.click()}
                  className="btn-primary-jp"
                  disabled={uploading === 'pic'}
                  style={{ fontSize: '0.9rem' }}
                >
                  {uploading === 'pic' ? (
                    <><span className="btn-spinner"></span> Uploading...</>
                  ) : (
                    <><i className="bi bi-upload"></i> {profilePictureUrl ? 'Change Picture' : 'Upload Picture'}</>
                  )}
                </button>
                <input ref={picRef} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handleProfilePic} style={{ display: 'none' }} />
              </div>
            </div>
          </div>

          {/* CV — Job Seekers only */}
          {isRole(user, 'jobseeker') && (
            <div className="jp-form-card fade-in fade-in-delay-3">
              <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                <i className="bi bi-file-earmark-person me-2" style={{ color: 'var(--accent)' }}></i>
                CV / Resume
              </h3>

              {cvUrl ? (
                <div className="cv-uploaded-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="cv-icon-wrap">
                      <i className="bi bi-file-earmark-pdf-fill" style={{ color: '#ff6584', fontSize: '1.6rem' }}></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>Resume.pdf</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PDF Document · Uploaded</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                      <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary-jp" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                        <i className="bi bi-eye"></i> View
                      </a>
                      <button onClick={() => cvRef.current.click()} className="btn-secondary-jp" style={{ fontSize: '0.85rem', padding: '8px 16px' }} disabled={uploading === 'cv'}>
                        <i className="bi bi-arrow-repeat"></i> Replace
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cv-empty-box">
                  <i className="bi bi-file-earmark-arrow-up" style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '12px' }}></i>
                  <h4>No CV uploaded yet</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                    Upload your CV so employers can review it when you apply.
                  </p>
                  <button onClick={() => cvRef.current.click()} className="btn-primary-jp" disabled={uploading === 'cv'}>
                    {uploading === 'cv' ? (
                      <><span className="btn-spinner"></span> Uploading...</>
                    ) : (
                      <><i className="bi bi-upload"></i> Upload CV</>
                    )}
                  </button>
                </div>
              )}

              <input ref={cvRef} type="file" accept=".pdf" onChange={handleCV} style={{ display: 'none' }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
                PDF only · Max 10MB
              </p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}
