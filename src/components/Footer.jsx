import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="jp-footer">
      <div className="container">
        <div className="footer-logo mb-2">
          Job<span>Portal</span>
        </div>
        <p>© {year} JobPortal &mdash; Connecting talent with opportunity</p>
      </div>
    </footer>
  )
}
