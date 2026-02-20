export default function Spinner({ message = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="jp-spinner"></div>
      {message && <p>{message}</p>}
    </div>
  )
}
