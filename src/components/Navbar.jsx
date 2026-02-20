// import { useState } from 'react'
// import { Link, useNavigate, useLocation } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import { getFileUrl } from '../services/api'

// const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

// export default function Navbar() {
//   const { user, logout } = useAuth()
//   const navigate = useNavigate()
//   const location = useLocation()
//   const [mobileOpen, setMobileOpen] = useState(false)
//   const [dropdownOpen, setDropdownOpen] = useState(false)

//   const handleLogout = () => {
//     logout()
//     navigate('/login')
//     setMobileOpen(false)
//     setDropdownOpen(false)
//   }

//   const isActive = (path) => location.pathname === path

//   const initials = user?.name
//     ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
//     : '?'

//   const profilePictureUrl = user?.profilePicture ? getFileUrl(user.profilePicture) : null

//   return (
//     <>
//       <nav className="jp-navbar">
//         <div className="container">
//           <Link to="/" className="jp-logo">
//             <span className="logo-dot"></span>
//             Job<span>Portal</span>
//           </Link>

//           <ul className="nav-links desktop-nav">
//             <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
//             <li><Link to="/jobs" className={isActive('/jobs') ? 'active' : ''}>Browse Jobs</Link></li>

//             {user ? (
//               <>
//                 <li>
//                   <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
//                 </li>
//                 {isRole(user, 'employer') && (
//                   <li>
//                     <Link to="/post-job" className={isActive('/post-job') ? 'active' : ''}>Post Job</Link>
//                   </li>
//                 )}

//                 {/* PROFILE DROPDOWN */}
//                 <li style={{ position: 'relative', marginLeft: '10px' }}>
//                   <div onClick={() => setDropdownOpen(!dropdownOpen)} className="nav-avatar-wrap">
//                     <div className="nav-avatar-circle" style={{
//                       background: profilePictureUrl
//                         ? `url(${profilePictureUrl}) center/cover`
//                         : 'linear-gradient(135deg,#6c63ff,#00f5a0)',
//                     }}>
//                       {!profilePictureUrl && initials}
//                     </div>
//                     <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}></i>
//                   </div>

//                   {dropdownOpen && (
//                     <>
//                       <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }}></div>
//                       <div className="nav-dropdown">
//                         {/* Profile header */}
//                         <div className="nav-dropdown-header">
//                           <div className="nav-dropdown-avatar" style={{
//                             background: profilePictureUrl
//                               ? `url(${profilePictureUrl}) center/cover`
//                               : 'linear-gradient(135deg,#6c63ff,#00f5a0)',
//                           }}>
//                             {!profilePictureUrl && initials}
//                           </div>
//                           <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
//                           <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user.email}</div>
//                           <span className={`badge-jp mt-2 ${isRole(user, 'employer') ? 'badge-employer' : 'badge-jobseeker'}`}>
//                             {user.role}
//                           </span>
//                         </div>

//                         <div className="nav-dropdown-divider"></div>

//                         {isRole(user, 'jobseeker') && (
//                           <>
//                             <Link to="/my-applications" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
//                               <i className="bi bi-list-check"></i> My Applications
//                             </Link>
//                             <Link to="/profile" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
//                               <i className="bi bi-person-circle"></i> My Profile
//                             </Link>
//                           </>
//                         )}

//                         {isRole(user, 'employer') && (
//                           <>
//                             <Link to="/post-job" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
//                               <i className="bi bi-plus-circle"></i> Post a Job
//                             </Link>
//                             <Link to="/profile" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
//                               <i className="bi bi-gear"></i> Profile Settings
//                             </Link>
//                           </>
//                         )}

//                         <div className="nav-dropdown-divider"></div>
//                         <button onClick={handleLogout} className="nav-dropdown-logout">
//                           <i className="bi bi-box-arrow-right"></i> Sign out
//                         </button>
//                       </div>
//                     </>
//                   )}
//                 </li>
//               </>
//             ) : (
//               <>
//                 <li><Link to="/login" className={isActive('/login') ? 'active' : ''}>Sign in</Link></li>
//                 <li><Link to="/register" className="btn-nav-cta">Get Started</Link></li>
//               </>
//             )}
//           </ul>

//           <button className="mobile-nav-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
//             <i className="bi bi-list" style={{ fontSize: '1.3rem' }}></i>
//           </button>
//         </div>
//       </nav>

//       {/* MOBILE MENU */}
//       <div className={`mobile-nav-menu ${mobileOpen ? 'open' : ''}`}>
//         <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>
//           <i className="bi bi-x-lg"></i>
//         </button>

//         {user && (
//           <div className="mobile-user-info">
//             <div className="mobile-avatar" style={{
//               background: profilePictureUrl ? `url(${profilePictureUrl}) center/cover` : 'linear-gradient(135deg,#6c63ff,#00f5a0)',
//             }}>
//               {!profilePictureUrl && initials}
//             </div>
//             <div>
//               <div style={{ fontWeight: 600 }}>{user.name}</div>
//               <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
//             </div>
//           </div>
//         )}

//         <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
//         <Link to="/jobs" onClick={() => setMobileOpen(false)}>Browse Jobs</Link>

//         {user ? (
//           <>
//             <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
//             {isRole(user, 'employer') && <Link to="/post-job" onClick={() => setMobileOpen(false)}>Post Job</Link>}
//             {isRole(user, 'jobseeker') && <Link to="/my-applications" onClick={() => setMobileOpen(false)}>My Applications</Link>}
//             <Link to="/profile" onClick={() => setMobileOpen(false)}>Profile</Link>
//             <button onClick={handleLogout} style={{ color: '#ff6584' }}>Sign out</button>
//           </>
//         ) : (
//           <>
//             <Link to="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
//             <Link to="/register" onClick={() => setMobileOpen(false)} style={{ color: '#6c63ff' }}>Get Started</Link>
//           </>
//         )}
//       </div>
//     </>
//   )
// }


import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getFileUrl } from '../services/api'

const isRole = (user, role) => user?.role?.toLowerCase() === role.toLowerCase()

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMobileOpen(false)
    setDropdownOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const profilePictureUrl = user?.profilePicture ? getFileUrl(user.profilePicture) : null

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

            {/* Show these only when user is logged in */}
            {user && (
              <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link></li>
            )}
            {user && isRole(user, 'employer') && (
              <li><Link to="/post-job" className={isActive('/post-job') ? 'active' : ''}>Post Job</Link></li>
            )}
            {user && isRole(user, 'jobseeker') && (
              <li><Link to="/my-applications" className={isActive('/my-applications') ? 'active' : ''}>My Applications</Link></li>
            )}

            {/* Show Sign In / Get Started only when NOT logged in */}
            {!user && (
              <>
                <li><Link to="/login" className={isActive('/login') ? 'active' : ''}>Sign in</Link></li>
                <li><Link to="/register" className="btn-nav-cta">Get Started</Link></li>
              </>
            )}

            {/* Profile dropdown — only when logged in */}
            {user && (
              <li style={{ position: 'relative', marginLeft: '8px' }}>
                <div
                  onClick={() => setDropdownOpen(o => !o)}
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
                    {/* Backdrop */}
                    <div
                      onClick={() => setDropdownOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                    />
                    <div className="nav-dropdown">
                      {/* Profile header */}
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
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          {user.email}
                        </div>
                        <span className={`badge-jp ${isRole(user, 'employer') ? 'badge-employer' : 'badge-jobseeker'}`}>
                          {user.role}
                        </span>
                      </div>

                      <div className="nav-dropdown-divider" />

                      {/* Job seeker links */}
                      {isRole(user, 'jobseeker') && (
                        <>
                          <Link to="/jobs" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
                            <i className="bi bi-search" /> Browse Jobs
                          </Link>
                          <Link to="/my-applications" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
                            <i className="bi bi-list-check" /> My Applications
                          </Link>
                          <Link to="/profile" onClick={() => setDropdownOpen(false)} className="nav-dropdown-item">
                            <i className="bi bi-person-circle" /> My Profile &amp; CV
                          </Link>
                        </>
                      )}

                      {/* Employer links */}
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

          {/* Mobile toggle */}
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
