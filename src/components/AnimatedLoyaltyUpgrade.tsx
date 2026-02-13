import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect, useCallback, forwardRef } from 'react'
import gemPng from '../assets/loyalty-gem.png'
import nextGemPng from '../assets/next-gem.png'
import './AnimatedLoyaltyStatus.css'
import './AnimatedLoyaltyUpgrade.css'

const badgeMask =
  'M11.418 0C15.6607 0 19.5944 1.3219 22.8311 3.5752L20.4512 6.97168L2.37012 7L0 3.57812C3.23758 1.32285 7.17318 0 11.418 0Z'

/* ───────────────────────────────────────────────────────────── */
export type UpgradeStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

/*
 * Flow (Loyalty Upgrade — Amethyst → Topaz):
 *  1 (0%)   → 2 (fill→100%) → 3 (pill) → 4 (gems + topaz activates) →
 *  5 (TAKEOVER) → 6 (balance wait) → 7 (coins fly) → 8 (result pause) →
 *  9 (pill) → 10 (0% alone) → 11 (0% + level, widget shows TOPAZ) → 1 (restart)
 */

interface Props {
  onStageChange?: (stage: UpgradeStage) => void
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 26, mass: 0.9 }

const AnimatedLoyaltyUpgrade = forwardRef<HTMLDivElement, Props>(
  ({ onStageChange }, ref) => {
    const [stage, setStage] = useState<UpgradeStage>(1)
    const [pct, setPct] = useState(0)
    const [flash, setFlash] = useState(false)

    const go = useCallback(
      (s: UpgradeStage) => {
        setStage(s)
        onStageChange?.(s)
      },
      [onStageChange],
    )

    /* ── Schedule next stage ── */
    useEffect(() => {
      const next: UpgradeStage =
        stage === 1  ? 2  :
        stage === 2  ? 3  :
        stage === 3  ? 4  :
        stage === 4  ? 5  :
        stage === 5  ? 6  :
        stage === 6  ? 7  :
        stage === 7  ? 8  :
        stage === 8  ? 9  :
        stage === 9  ? 10 :
        stage === 10 ? 11 :
        1 // 11 → restart loop
      const delay =
        stage === 1  ? 2000 :  // show 0%
        stage === 2  ? 3000 :  // fill→100% + flash
        stage === 3  ? 500  :  // pill transition (quick)
        stage === 4  ? 4000 :  // gems (topaz activate)
        stage === 5  ? 4500 :  // TAKEOVER
        stage === 6  ? 1200 :  // balance appears, wait before coins
        stage === 7  ? 2200 :  // coins flying
        stage === 8  ? 2500 :  // result pause
        stage === 9  ? 500  :  // pill transition (quick)
        stage === 10 ? 2000 :  // 0% alone
        3000                    // 0% + level (topaz widget) before restart
      const t = setTimeout(() => go(next), delay)
      return () => clearTimeout(t)
    }, [stage, go])

    /* ── Percentage control ── */
    useEffect(() => {
      // Zero pct before transition back to ring so it never shows 100%
      if (stage === 8 || stage === 9 || stage === 10 || stage === 1) {
        setPct(0)
        setFlash(false)
      }
      if (stage === 2) {
        setFlash(false)
        let frame: number
        const start = performance.now()
        const duration = 1400
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
          setPct(Math.round(100 * eased))
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        const flashTimer = setTimeout(() => setFlash(true), 1500)
        return () => {
          cancelAnimationFrame(frame)
          clearTimeout(flashTimer)
        }
      }
      if (stage >= 3) setFlash(false)
    }, [stage])

    /* ── Derived state ── */
    const isRingStage = stage <= 2 || stage >= 9
    const showBorder = stage >= 3 && stage <= 8
    const showTopazGem = stage >= 6 // from balance update onward: transition pill + ring use topaz
    const deg = (pct / 100) * 360
    const w = stage === 4 ? 172 : 40

    return (
      <div className={`als-root${showTopazGem ? ' als-root--topaz' : ''}`} ref={ref}>
        {/* ── Morphing island ── */}
        <motion.div
          className="als-island"
          animate={{ width: w }}
          transition={spring}
        >
          {/* Clipped content container */}
          <div className="als-island__clip">
            {/* Border — fades in for pill/gems stages */}
            <motion.div
              className="als-island__border"
              animate={{ opacity: showBorder ? 1 : 0 }}
              transition={{ duration: showBorder ? 0.3 : 0.2, delay: showBorder ? 0.25 : 0 }}
            />

            {/* ── Ring layer (stages 1-2, 7-8) ── */}
            <AnimatePresence>
              {isRingStage && (
                <motion.div
                  key="ring"
                  className="als-ring"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}
                >
                  <div className="als-ring__trailing" />
                  <div
                    className={`als-ring__progress${flash ? ' als-ring__progress--flash' : ''}`}
                    style={{ '--pct': `${deg}deg` } as React.CSSProperties}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ★ Persistent gem — amethyst until stage 9, then topaz ★ */}
            <motion.div
              className={`als-gem${flash ? ' als-gem--flash' : ''}`}
              key={`gem-bounce-${stage === 4 ? 'gems' : 'default'}`}
              initial={stage === 4 ? { scale: 0.3, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={stage === 4
                ? { type: 'spring', stiffness: 500, damping: 20, mass: 0.6 }
                : { duration: 0.2 }
              }
            >
              <img className="als-gem__img" src={showTopazGem ? nextGemPng : gemPng} alt="" />
            </motion.div>

            {/* ── Gems (stage 4) — all amethyst full + topaz activates ── */}
            <AnimatePresence>
              {stage === 4 && (
                <motion.div
                  key="extra-gems"
                  className="als-extra"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* 3 amethyst gems — all collected (full opacity) */}
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="als-extra__slot"
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 20,
                        mass: 0.6,
                        delay: i * 0.12,
                      }}
                    >
                      <img src={gemPng} alt="" />
                    </motion.div>
                  ))}
                  {/* Topaz gem — activates with glow */}
                  <motion.div
                    key="topaz"
                    className="als-extra__slot alu-topaz-activate"
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 20,
                      mass: 0.6,
                      delay: 4 * 0.12,
                    }}
                  >
                    <img src={nextGemPng} alt="" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Badge (% label) — OUTSIDE clip ── */}
          <AnimatePresence>
            {isRingStage && (
              <motion.div
                key="badge"
                className="als-badge"
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <div className="als-badge__mask">
                  <svg
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 22.8311 7"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                  >
                    <path d={badgeMask} fill="#121212" />
                  </svg>
                </div>
                <p className="als-badge__text">{pct}%</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    )
  },
)

AnimatedLoyaltyUpgrade.displayName = 'AnimatedLoyaltyUpgrade'
export default AnimatedLoyaltyUpgrade
