import './SystemStatusBar.css'

const SystemStatusBar: React.FC = () => {
  // Figma/iOS default screenshot time for pixel-perfect layout
  const time = '9:41'

  return (
    <div className="system-status-bar">
      <span className="time">{time}</span>
      <div className="status-icons">
        <svg className="signal-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="14" width="3" height="8" rx="1" fill="currentColor" />
          <rect x="7" y="12" width="3" height="10" rx="1" fill="currentColor" />
          <rect x="12" y="9" width="3" height="13" rx="1" fill="currentColor" />
          <rect x="17" y="6" width="3" height="16" rx="1" fill="currentColor" />
        </svg>
        <svg className="wifi-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2.6 9.3a15 15 0 0 1 18.8 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M6 12.8a10 10 0 0 1 12 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M9.5 16.2a5 5 0 0 1 5 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="19.2" r="1.2" fill="currentColor" />
        </svg>
        <svg className="battery-icon" viewBox="0 0 28 14" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="24" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <rect x="26" y="4.2" width="1.6" height="5.6" rx="0.8" fill="currentColor" />
          <rect x="3" y="3" width="18" height="8" rx="2" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

export default SystemStatusBar
