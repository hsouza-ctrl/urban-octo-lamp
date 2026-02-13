import gemPng from '../assets/loyalty-gem.png'

const badgeMask =
  'M11.418 0C15.6607 0 19.5944 1.3219 22.8311 3.5752L20.4512 6.97168L2.37012 7L0 3.57812C3.23758 1.32285 7.17318 0 11.418 0Z'

interface Props {
  pct?: number
}

/** Static loyalty gem badge — reuses als-* CSS classes from AnimatedLoyaltyStatus.css */
export default function StaticGemBadge({ pct = 0 }: Props) {
  const deg = (pct / 100) * 360
  return (
    <div className="als-root">
      <div className="als-island" style={{ width: 40, height: 40, borderRadius: 20 }}>
        <div className="als-island__clip">
          <div className="als-ring" style={{ position: 'absolute', inset: 0, borderRadius: 20 }}>
            <div className="als-ring__trailing" />
            <div
              className="als-ring__progress"
              style={{ '--pct': `${deg}deg` } as React.CSSProperties}
            />
          </div>
          <div className="als-gem">
            <img className="als-gem__img" src={gemPng} alt="" />
          </div>
        </div>
        <div className="als-badge">
          <div className="als-badge__mask">
            <svg fill="none" preserveAspectRatio="none" viewBox="0 0 22.8311 7"
              style={{ display: 'block', width: '100%', height: '100%' }}>
              <path d={badgeMask} fill="#121212" />
            </svg>
          </div>
          <p className="als-badge__text">{pct}%</p>
        </div>
      </div>
    </div>
  )
}
