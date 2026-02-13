import { motion } from 'motion/react'
import { useMemo } from 'react'
import coinPng from '../assets/coin.png'
import './CoinAnimation.css'

interface CoinAnimationProps {
  /** Bounding rect of the source element (loyalty widget) */
  sourceRect: DOMRect | null
  /** Bounding rect of the target element (balance widget) */
  targetRect: DOMRect | null
  /** Whether animation is active */
  active: boolean
  /** Called when each coin arrives at the target */
  onCoinArrive?: () => void
  /** Called when ALL coins have arrived */
  onComplete?: () => void
  /** Number of coins */
  count?: number
}

export default function CoinAnimation({
  sourceRect,
  targetRect,
  active,
  onCoinArrive,
  onComplete,
  count = 10,
}: CoinAnimationProps) {
  /* Generate random scatter positions for each coin (stable across renders) */
  const coins = useMemo(() => {
    if (!sourceRect || !targetRect) return []
    const sx = sourceRect.left + sourceRect.width / 2
    const sy = sourceRect.top + sourceRect.height / 2
    const tx = targetRect.left + targetRect.width / 2
    const ty = targetRect.top + targetRect.height / 2

    return Array.from({ length: count }, (_, i) => {
      const angle = ((Math.PI * 2) / count) * i + (Math.random() - 0.5) * 0.6
      const dist = 25 + Math.random() * 35
      return {
        id: i,
        sx,
        sy,
        // Scatter position (burst outward)
        mx: sx + Math.cos(angle) * dist,
        my: sy + Math.sin(angle) * dist,
        // Target
        tx,
        ty,
        // Stagger: each coin's fly phase starts slightly later
        flyDelay: i * 0.07,
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, count])

  if (!active || coins.length === 0) return null

  /*
   * Animation phases per coin:
   *  0.00 → 0.15s  : burst from source to scatter (pop out)
   *  0.15 → 0.55s  : hover at scatter position
   *  0.55 → 1.05s  : fly from scatter to target (arc)
   *
   * Total per coin ≈ 1.05s, stagger of 0.07s per coin
   * Full sequence ≈ 1.05 + (count-1)*0.07 ≈ 1.7s
   */

  return (
    <div className="coin-anim">
      {coins.map((coin) => (
        <motion.img
          key={coin.id}
          className="coin-anim__coin"
          src={coinPng}
          alt=""
          initial={{
            position: 'fixed',
            left: 0,
            top: 0,
            x: coin.sx - 10,
            y: coin.sy - 10,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: [coin.sx - 10, coin.mx - 10, coin.mx - 10, coin.tx - 10],
            y: [coin.sy - 10, coin.my - 10, coin.my - 10, coin.ty - 10],
            scale: [0, 1.1, 1, 0.7],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.05,
            times: [0, 0.14, 0.5, 1],
            ease: ['easeOut', 'linear', 'easeIn'],
            delay: coin.flyDelay,
          }}
          onAnimationComplete={() => {
            onCoinArrive?.()
            if (coin.id === count - 1) {
              onComplete?.()
            }
          }}
        />
      ))}
    </div>
  )
}
