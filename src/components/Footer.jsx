// import { Link } from 'react-router-dom'

// export default function Footer() {
//   const year = new Date().getFullYear()

//   return (
//     <footer className="jp-footer">
//       <div className="container">
//         <div className="footer-logo mb-2">
//           Job<span>Tracker</span>
//         </div>
//         <p>© {year} JobPortal &mdash; Connecting talent with opportunity</p>
//       </div>
//     </footer>
//   )
// }


import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="jp-footer">

      {/* Top Section */}
      <div className="footer-top">
        <div className="container">
          <div className="row g-5">

            {/* Brand Column */}
            <div className="col-lg-4 col-md-6">
              <div className="footer-brand">
                <div className="footer-logo mb-3">
                  <span className="logo-dot"></span>
                  Job<span>Tracker</span>
                </div>
                <p className="footer-tagline">
                  Connecting ambitious professionals with companies building the future.
                  Your next big career move starts here.
                </p>
                {/* Social Icons */}
                <div className="footer-socials">
                  {[
                    { icon: 'bi-linkedin',  href: '#', label: 'LinkedIn'  },
                    { icon: 'bi-twitter-x', href: '#', label: 'Twitter'   },
                    { icon: 'bi-github',    href: '#', label: 'GitHub'    },
                    { icon: 'bi-instagram', href: '#', label: 'Instagram' },
                  ].map(s => (
                    <a key={s.label} href={s.href} aria-label={s.label} className="footer-social-btn">
                      <i className={`bi ${s.icon}`} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className="footer-section">
                <h6 className="footer-heading">Quick Links</h6>
                <ul className="footer-links">
                  {[
                    { label: 'Home',         to: '/'       },
                    { label: 'Browse Jobs',  to: '/jobs'   },
                    { label: 'Dashboard',    to: '/dashboard' },
                    { label: 'Post a Job',   to: '/post-job'  },
                    { label: 'My Profile',   to: '/profile'   },
                  ].map(l => (
                    <li key={l.label}>
                      <Link to={l.to} className="footer-link">
                        <i className="bi bi-chevron-right" /> {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* For Job Seekers */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className="footer-section">
                <h6 className="footer-heading">Job Seekers</h6>
                <ul className="footer-links">
                  {[
                    { label: 'Find Jobs',         to: '/jobs'            },
                    { label: 'Create Account',    to: '/register'        },
                    { label: 'Upload CV',         to: '/profile'         },
                    { label: 'My Applications',   to: '/my-applications' },
                    { label: 'Track Status',      to: '/my-applications' },
                  ].map(l => (
                    <li key={l.label}>
                      <Link to={l.to} className="footer-link">
                        <i className="bi bi-chevron-right" /> {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* For Employers */}
            <div className="col-lg-4 col-md-6">
              <div className="footer-section">
                <h6 className="footer-heading">For Employers</h6>
                <ul className="footer-links" style={{ marginBottom: '20px' }}>
                  {[
                    { label: 'Post a Job',        to: '/post-job'   },
                    { label: 'View Applicants',   to: '/dashboard'  },
                    { label: 'Manage Listings',   to: '/dashboard'  },
                    { label: 'Employer Register', to: '/register'   },
                  ].map(l => (
                    <li key={l.label}>
                      <Link to={l.to} className="footer-link">
                        <i className="bi bi-chevron-right" /> {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Stats mini block */}
                <div className="footer-stats">
                  {[
                    { value: '10K+', label: 'Active Jobs'   },
                    { value: '5K+',  label: 'Companies'     },
                    { value: '50K+', label: 'Job Seekers'   },
                  ].map(s => (
                    <div key={s.label} className="footer-stat-item">
                      <div className="footer-stat-value">{s.value}</div>
                      <div className="footer-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="footer-divider" />

      {/* Bottom Section */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">

            <p className="footer-copy">
              © {year} JobPortal — All rights reserved. Connecting talent with opportunity.
            </p>

            <div className="footer-bottom-links">
              {[
                { label: 'Privacy Policy', to: '/' },
                { label: 'Terms of Use',   to: '/' },
                { label: 'Support',        to: '/' },
              ].map(l => (
                <Link key={l.label} to={l.to} className="footer-bottom-link">
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="footer-made">
              <i className="bi bi-code-slash" style={{ color: 'var(--accent)' }} />
              {' '}Built with{' '}
              <span style={{ color: 'var(--accent-2)' }}>❤️</span>
              {' '}using React + Spring Boot
            </div>

          </div>
        </div>
      </div>

    </footer>
  )
}