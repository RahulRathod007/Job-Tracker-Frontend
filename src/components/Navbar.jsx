import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getFileUrl } from '../services/api'
import useNotifications from '../pages/Usenotifications'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

// Time-ago helper
function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Navbar() {
  const { user, logout }  = useAuth()
  const navigate          = useNavigate()
  const location          = useLocation()
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen]       = useState(false)
  const notifRef = useRef(null)

  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications(user)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMobileOpen(false)
    setDropdownOpen(false)
    setNotifOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const profilePictureUrl = user?.profilePicture ? getFileUrl(user.profilePicture) : null

  // Close notification panel on outside click
  useEffect(() => {
    if (!notifOpen) return
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  const handleBellClick = () => {
    setNotifOpen(o => !o)
    setDropdownOpen(false)
    if (!notifOpen) markAllRead()
  }

  const seen = (() => {
    try { return new Set(JSON.parse(localStorage.getItem('jp_notif_seen_ids') || '[]')) } catch { return new Set() }
  })()

  return (
    <>
      <nav className="jp-navbar">
        <div className="container">
          <Link to="/" className="jp-logo">
            <span className="logo-dot"></span>
            Job<span>Portal</span>
          </Link>

          <ul className="nav-links desktop-nav">
            <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
            <li><Link to="/jobs" className={isActive('/jobs') ? 'active' : ''}>Browse Jobs</Link></li>

            {user && (
              <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link></li>
            )}
            {user && isRole(user, 'employer') && (
              <li><Link to="/post-job" className={isActive('/post-job') ? 'active' : ''}>Post Job</Link></li>
            )}
            {user && isRole(user, 'jobseeker') && (
              <li><Link to="/my-applications" className={isActive('/my-applications') ? 'active' : ''}>My Applications</Link></li>
            )}
            {user && isRole(user, 'jobseeker') && (
              <li>
                <Link to="/saved-jobs" className={isActive('/saved-jobs') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <i className="bi bi-bookmark" style={{ fontSize: '0.85rem' }} /> Saved
                </Link>
              </li>
            )}

            {!user && (
              <>
                <li><Link to="/login" className={isActive('/login') ? 'active' : ''}>Sign in</Link></li>
                <li><Link to="/register" className="btn-nav-cta">Get Started</Link></li>
              </>
            )}

            {/* ── NOTIFICATION BELL — jobseekers only ── */}
            {user && isRole(user, 'jobseeker') && (
              <li style={{ position: 'relative' }} ref={notifRef}>
                <button
                  onClick={handleBellClick}
                  className="nav-bell-btn"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <i className="bi bi-bell-fill" />
                  {unreadCount > 0 && (
                    <span className="nav-bell-badge">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown panel */}
                {notifOpen && (
                  <div className="notif-panel">
                    {/* Header */}
                    <div className="notif-panel-header">
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        <i className="bi bi-bell-fill" style={{ marginRight: '7px', color: 'var(--accent)' }} />
                        Notifications
                      </span>
                      {notifications.length > 0 && (
                        <button onClick={clearAll} className="notif-clear-btn">
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">
                          <i className="bi bi-bell-slash" style={{ fontSize: '1.8rem', opacity: 0.25, display: 'block', marginBottom: '10px' }} />
                          <div style={{ fontWeight: 600, marginBottom: '4px' }}>No notifications yet</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            When employers update your application status, you'll see it here.
                          </div>
                        </div>
                      ) : (
                        notifications.map(n => {
                          const isUnread = !seen.has(n.id)
                          return (
                            <Link
                              key={n.id}
                              to={`/my-applications#app-${n.appId}`}
                              onClick={() => setNotifOpen(false)}
                              className={`notif-item ${isUnread ? 'notif-item-unread' : ''}`}
                            >
                              {/* Icon circle */}
                              <div
                                className="notif-icon-circle"
                                style={{ background: `${n.color}18`, border: `1px solid ${n.color}40`, color: n.color }}
                              >
                                <i className={`bi ${n.icon}`} />
                              </div>

                              {/* Content */}
                              <div className="notif-content">
                                <div className="notif-job">
                                  {n.jobTitle}
                                  {n.company && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {n.company}</span>}
                                </div>
                                <div className="notif-message">{n.message}</div>
                                <div className="notif-time">{timeAgo(n.timestamp)}</div>
                              </div>

                              {/* Unread dot */}
                              {isUnread && <span className="notif-dot" style={{ background: n.color }} />}
                            </Link>
                          )
                        })
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <Link
                        to="/my-applications"
                        onClick={() => setNotifOpen(false)}
                        className="notif-footer"
                      >
                        View all applications <i className="bi bi-arrow-right" />
                      </Link>
                    )}
                  </div>
                )}
              </li>
            )}

            {/* Profile dropdown */}
            {user && (
              <li style={{ position: 'relative', marginLeft: '8px' }}>
                <div
                  onClick={() => { setDropdownOpen(o => !o); setNotifOpen(false) }}
                  className="nav-avatar-wrap"
                  aria-label="User menu"
                >
                  <div
                    className="nav-avatar-circle"
                    style={{
                      background: profilePictureUrl
                        ? `url(${profilePictureUrl}) center/cover`
                        : 'linear-gradient(135deg,#6c63ff,#00f5a0)',
                    }}
                  >
                    {!profilePictureUrl && initials}
                  </div>
                  <i
                    className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'}`}
                    style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}
                  />
                </div>

                {dropdownOpen && (
                  <>
                    <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                    <div className="nav-dropdown">
                      <div className="nav-dropdown-header">
                        <div
                          className="nav-dropdown-avatar"
                          style={{
                            background: profilePictureUrl
                              ? `url(${profilePictureUrl}) center/cover`
                              : 'linear-gradient(135deg,#6c63ff,#00f5a0)',
                          }}
                        >
                          {!profilePictureUrl && initials}
                        </div>
                        <div style={{ fontWeight: 600, color: 'white', marginBottom: '2px' }}>{user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{user.email}</div>
                        <span className={`badge-jp ${isRole(user, 'employer') ? 'badge-employer' : 'badge-jobseeker'}`}>
                          {user.role}
                        </span>
                      </div>

                      <div className="nav-dropdown-divider" />

                      {isRole(user, 'jobseeker') && (
                        <>
                          <Link to="/jobs" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
                            <i className="bi bi-search" /> Browse Jobs
                          </Link>
                          <Link to="/my-applications" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
                            <i className="bi bi-list-check" /> My Applications
                          </Link>
                          <Link to="/saved-jobs" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
                            <i className="bi bi-bookmark-fill" style={{ color: 'var(--accent)' }} /> Saved Jobs
                          </Link>
                          <Link to="/profile" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
                            <i className="bi bi-person-circle" /> My Profile &amp; CV
                          </Link>
                        </>
                      )}

                      {isRole(user, 'employer') && (
                        <>
                          <Link to="/post-job" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
                            <i className="bi bi-plus-circle" /> Post a Job
                          </Link>
                          <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
                            <i className="bi bi-grid" /> My Listings
                          </Link>
                          <Link to="/profile" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
                            <i className="bi bi-gear" /> Profile Settings
                          </Link>
                        </>
                      )}

                      <div className="nav-dropdown-divider" />
                      <button onClick={handleLogout} className="nav-dropdown-logout">
                        <i className="bi bi-box-arrow-right" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </li>
            )}
          </ul>

          <button className="mobile-nav-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <i className="bi bi-list" style={{ fontSize: '1.3rem' }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-nav-menu ${mobileOpen ? 'open' : ''}`}>
        <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>
          <i className="bi bi-x-lg" />
        </button>

        {user && (
          <div className="mobile-user-info">
            <div
              className="mobile-avatar"
              style={{
                background: profilePictureUrl
                  ? `url(${profilePictureUrl}) center/cover`
                  : 'linear-gradient(135deg,#6c63ff,#00f5a0)',
              }}
            >
              {!profilePictureUrl && initials}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
          </div>
        )}

        <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
        <Link to="/jobs" onClick={() => setMobileOpen(false)}>Browse Jobs</Link>

        {user ? (
          <>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            {isRole(user, 'employer') && (
              <Link to="/post-job" onClick={() => setMobileOpen(false)}>Post Job</Link>
            )}
            {isRole(user, 'jobseeker') && (
              <>
                <Link to="/my-applications" onClick={() => setMobileOpen(false)}>My Applications</Link>
                <Link to="/saved-jobs" onClick={() => setMobileOpen(false)}>Saved Jobs</Link>
                {/* Mobile notifications link */}
                <Link
                  to="/my-applications"
                  onClick={() => setMobileOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span><i className="bi bi-bell-fill" style={{ marginRight: '8px' }} />Notifications</span>
                  {unreadCount > 0 && ( 
                    <span style={{
                      background: 'var(--accent)', color: 'white', borderRadius: '100px',
                      fontSize: '0.72rem', fontWeight: 700, padding: '1px 8px',
                    }}>
                      {unreadCount}
                    </span> 
                  )}
                </Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)}>My Profile &amp; CV</Link>
              </>
            )}
            {isRole(user, 'employer') && (
              <Link to="/profile" onClick={() => setMobileOpen(false)}>Profile Settings</Link>
            )}
            <button onClick={handleLogout} style={{ color: '#ff6584' }}>Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} style={{ color: '#6c63ff' }}>
              Get Started
            </Link>
          </>
        )}
      </div>
    </>
  )
}