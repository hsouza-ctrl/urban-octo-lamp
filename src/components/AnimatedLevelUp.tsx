import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect, useLayoutEffect, useCallback, useRef, forwardRef } from 'react'
import './AnimatedLevelUp.css'

const badgeMask =
  'M11.418 0C15.6607 0 19.5944 1.3219 22.8311 3.5752L20.4512 6.97168L2.37012 7L0 3.57812C3.23758 1.32285 7.17318 0 11.418 0Z'

function ArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 5.5V7.5H15.09L5.5 17.09L6.91 18.5L16.5 8.91V17.5H18.5V5.5H6.5Z" fill="#B2B2B2" />
    </svg>
  )
}

export type LevelStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

/*
 *  1: default 0%            (2s)
 *  2: fill 0→100% + glow    (3s)
 *  3: pill with arrow        (500ms)
 *  4: expanded message        (3.2s)
 *  5: pill with arrow        (500ms)
 *  6: balance wait            (1.2s)
 *  7: coins fly               (2.2s)
 *  8: result pause            (2.5s)
 *  9: pill transition         (500ms)
 * 10: morph back to ring (82) (2s)  ← pill transforms into ring
 * 11: done                    (signals onComplete)
 */

interface Props {
  level?: number
  newLevel?: number
  paused?: boolean
  onStageChange?: (stage: LevelStage) => void
  onComplete?: () => void
  /** Called when ring reaches 100% (end of stage 2); parent should then run intro (e.g. slide loyalty out) before continuing */
  onReached100?: () => void
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 26, mass: 0.9 }
const springSnappy = { type: 'spring' as const, stiffness: 400, damping: 28 }

const AnimatedLevelUp = forwardRef<HTMLDivElement, Props>(
  ({ level = 81, newLevel = 82, paused = false, onStageChange, onComplete, onReached100 }, ref) => {
    const [stage, setStage] = useState<LevelStage>(1)
    const [pct, setPct] = useState(75)
    const [flash, setFlash] = useState(false)
    const [expandedWidth, setExpandedWidth] = useState(190)
    const [waitingForIntro, setWaitingForIntro] = useState(false)
    const textRef = useRef<HTMLDivElement>(null)
    const hasLeftRing = useRef(false) // tracks if ring ever exited (to skip initial animation)

    const go = useCallback(
      (s: LevelStage) => {
        setStage(s)
        onStageChange?.(s)
      },
      [onStageChange],
    )

    /* ── Schedule next stage ── */
    useEffect(() => {
      if (stage === 11) {
        onComplete?.()
        return
      }
      if (stage === 2) {
        // Don't auto-advance: wait for parent to run intro (slide loyalty out), then we advance when paused becomes false
        const t = setTimeout(() => {
          onReached100?.()
          setWaitingForIntro(true)
        }, 3000)
        return () => clearTimeout(t)
      }
      if (paused) return // don't progress while paused (intro phase)
      const s = stage as number
      const next: LevelStage =
        s === 1  ? 2  :
        s === 3  ? 4  :
        s === 4  ? 5  :
        s === 5  ? 6  :
        s === 6  ? 7  :
        s === 7  ? 8  :
        s === 8  ? 9  :
        s === 9  ? 10 :
        11
      const delay =
        s === 1  ? 2000 :
        s === 3  ? 500  :
        s === 4  ? 3200 :
        s === 5  ? 500  :
        s === 6  ? 1200 :
        s === 7  ? 2200 :
        s === 8  ? 2500 :
        s === 9  ? 500  :
        2000  // stage 10: show ring with 82 for 2s
      const t = setTimeout(() => go(next), delay)
      return () => clearTimeout(t)
    }, [stage, paused, go, onComplete, onReached100])

    /* ── When intro is done (paused becomes false), advance from stage 2 to 3 ── */
    useEffect(() => {
      if (!paused && stage === 2 && waitingForIntro) {
        setWaitingForIntro(false)
        go(3)
      }
    }, [paused, stage, waitingForIntro, go])

    /* ── Default 75%; fill 75→100 on stage 2 ── */
    useEffect(() => {
      if (stage === 1) { setPct(75); setFlash(false) }
      if (stage === 2) {
        setFlash(false)
        let frame: number
        const start = performance.now()
        const duration = 1400
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
          setPct(Math.round(75 + 25 * eased))
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        const flashTimer = setTimeout(() => setFlash(true), 1500)
        return () => { cancelAnimationFrame(frame); clearTimeout(flashTimer) }
      }
      if (stage >= 3 && stage < 10) setFlash(false)
      if (stage === 10) setPct(0) // new level starts at 0%
    }, [stage])

    /* ── Measure text for hug width (stage 4); offsetWidth already includes padding ── */
    useLayoutEffect(() => {
      if (stage !== 4 || !textRef.current) return
      const tw = textRef.current.offsetWidth
      setExpandedWidth(40 + tw)
    }, [stage])

    /* ── Derived state ── */
    const isRingStage = stage <= 2 || stage >= 10
    const showBorder = stage >= 3 && stage <= 9
    const showArrow = stage >= 3 && stage <= 9

    // Once ring exits for the first time, enable entry animations for re-entry
    if (!isRingStage && !hasLeftRing.current) {
      hasLeftRing.current = true
    }
    const deg = (pct / 100) * 360
    const w = stage === 4 ? expandedWidth : 40

    // Which number to show
    const displayNumber = stage >= 10 ? newLevel : level

    return (
      <div className="alu-root" ref={ref}>
        <motion.div
          className="alu-island"
          animate={{ width: w }}
          transition={spring}
        >
          <div className="alu-island__clip">
            {/* Border — stages 3-9 only */}
            <motion.div
              className="alu-island__border"
              initial={{ opacity: 0 }}
              animate={{ opacity: showBorder ? 1 : 0 }}
              transition={{ duration: showBorder ? 0.3 : 0.2, delay: showBorder ? 0.25 : 0 }}
            />

            {/* ── Ring (stages 1-2 and 10+) ── */}
            <AnimatePresence>
              {isRingStage && (
                <motion.div
                  key={`ring-${stage >= 10 ? 'new' : 'old'}`}
                  className="alu-ring"
                  initial={hasLeftRing.current ? { opacity: 0, scale: 0.7 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}
                >
                  <div className="alu-ring__trailing" />
                  <div
                    className={`alu-ring__progress${flash ? ' alu-ring__progress--flash' : ''}`}
                    style={{ '--pct': `${deg}deg` } as React.CSSProperties}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Level number (ring stages) */}
            <AnimatePresence>
              {isRingStage && (
                <motion.div
                  key={`num-${displayNumber}`}
                  className="alu-number"
                  initial={hasLeftRing.current ? { opacity: 0, scale: 0.7 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                >
                  <span>{displayNumber}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Arrow icon — stages 3-9 */}
            <AnimatePresence>
              {showArrow && (
                <motion.div
                  key="arrow"
                  className="alu-arrow"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 24 }}
                >
                  <ArrowIcon />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded text (stage 4) */}
            <AnimatePresence>
              {stage === 4 && (
                <motion.div
                  key="text"
                  ref={textRef}
                  className="alu-text"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={springSnappy}
                >
                  <p className="alu-text__label">LEVEL UP</p>
                  <p className="alu-text__value">New level reached</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LVL badge — OUTSIDE clip (ring stages) */}
          <AnimatePresence>
            {isRingStage && (
              <motion.div
                key={`badge-${stage >= 10 ? 'new' : 'old'}`}
                className="alu-badge"
                initial={hasLeftRing.current ? { opacity: 0, y: -4 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <div className="alu-badge__mask">
                  <svg fill="none" preserveAspectRatio="none" viewBox="0 0 22.8311 7"
                    style={{ display: 'block', width: '100%', height: '100%' }}>
                    <path d={badgeMask} fill="#121212" />
                  </svg>
                </div>
                <p className="alu-badge__text">LVL</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    )
  },
)

AnimatedLevelUp.displayName = 'AnimatedLevelUp'
export default AnimatedLevelUp
