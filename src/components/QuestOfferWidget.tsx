import { useState, useEffect } from 'react'
import './QuestOfferWidget.css'

const TIMER_DURATION_MS = 7000

interface Props {
  onJoin?: () => void
  onTimerEnd?: () => void
}

/* Refresh/loop icon path */
const IconPath =
  'M20 10C25.5228 10 30 14.4772 30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10ZM15.1553 17.3428C15.0096 17.1973 14.7833 17.1971 14.6377 17.3428L12.6055 19.376C12.3801 19.6018 12.5401 19.9949 12.8604 19.9951H14.1719C14.172 23.215 16.7801 25.8232 20 25.8232C20.7577 25.8232 21.4865 25.6778 22.1494 25.4082C22.6375 25.2115 22.768 24.5844 22.3965 24.2129C22.1998 24.0164 21.8945 23.9368 21.6396 24.0459C21.1297 24.2499 20.5755 24.3662 20 24.3662C17.5887 24.3661 15.6291 22.4064 15.6289 19.9951H16.9326C17.2603 19.9951 17.421 19.6019 17.1885 19.376L15.1553 17.3428ZM20 14.167C19.2424 14.167 18.5135 14.3125 17.8506 14.582C17.3628 14.7789 17.2321 15.4049 17.6035 15.7764C17.8002 15.9731 18.0991 16.0536 18.3613 15.9443C18.8639 15.7332 19.4246 15.624 20 15.624C22.4114 15.624 24.3711 17.5837 24.3711 19.9951H23.0674C22.7395 19.9951 22.5794 20.3884 22.8125 20.6143L24.8447 22.6465C24.9904 22.7922 25.2166 22.7922 25.3623 22.6465L27.3945 20.6143C27.6203 20.3885 27.4604 19.9955 27.1328 19.9951H25.8281C25.8281 16.775 23.2201 14.167 20 14.167Z'

export default function QuestOfferWidget({ onJoin, onTimerEnd }: Props) {
  const [joined, setJoined] = useState(false)
  const [timerPct, setTimerPct] = useState(100) // 100 → 0 over 7s

  /* 7s countdown — only when not joined; when it hits 0, notify parent */
  useEffect(() => {
    if (joined) return
    const start = performance.now()
    let frame: number
    const tick = (now: number) => {
      const elapsed = now - start
      const pct = Math.max(0, 100 - (elapsed / TIMER_DURATION_MS) * 100)
      setTimerPct(pct)
      if (pct <= 0) {
        onTimerEnd?.()
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [joined, onTimerEnd])

  const handleJoin = () => {
    setJoined(true)
    onJoin?.()
  }

  return (
    <div className={`quest-offer${joined ? ' quest-offer--joined' : ''}`}>
      {/* Timer background shape — starts at 100% width and shrinks from right to left */}
      {!joined && (
        <div
          className="quest-offer__timer-bg"
          style={{ width: `${timerPct}%` }}
        />
      )}

      <div className="quest-offer__inner">
        {/* Left icon */}
        <div className="quest-offer__icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
            <circle cx="20" cy="20" r="15" fill="transparent" />
            <path d={IconPath} fill={joined ? '#BEEF70' : '#B2B2B2'} />
          </svg>
        </div>

        {/* Text */}
        <div className="quest-offer__text">
          <p className="quest-offer__label">QUEST AVAILABLE</p>
          <p className="quest-offer__value">
            {joined ? "You've joined the quest!" : 'Spin 250 times'}
          </p>
        </div>

        {/* JOIN button — only when not joined */}
        {!joined && (
          <button
            type="button"
            className="quest-offer__join"
            onClick={handleJoin}
          >
            <span className="quest-offer__join-text">JOIN</span>
          </button>
        )}
      </div>
    </div>
  )
}
