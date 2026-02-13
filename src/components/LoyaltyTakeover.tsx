import { motion, AnimatePresence } from 'motion/react'
// Use .gif so the gem animates. Copy your GIF into src/assets/topaz-gem.gif (Finder or: cp yourfile.gif src/assets/topaz-gem.gif) — uploading in chat often converts to PNG.
import topazGem from '../assets/topaz-gem.gif'
import './LoyaltyTakeover.css'

interface Props {
  visible: boolean
  onComplete?: () => void
}

export default function LoyaltyTakeover({ visible, onComplete }: Props) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          className="takeover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="takeover__band">
            {/* Top fade gradient */}
            <div className="takeover__band-fade takeover__band-fade--top" />

            {/* Main content */}
            <div className="takeover__content">
              {/* Left text */}
              <motion.p
                className="takeover__text-left"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                You've reached
              </motion.p>

              {/* Center gem with glow */}
              <motion.div
                className="takeover__gem-wrap"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 18,
                  mass: 0.8,
                  delay: 0.15,
                }}
              >
                <div className="takeover__gem-glow" />
                <motion.img
                  className="takeover__gem-img"
                  src={topazGem}
                  alt="Topaz gem"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>

              {/* Right text */}
              <motion.p
                className="takeover__text-right"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <span className="takeover__text-topaz">Topaz</span> status
              </motion.p>
            </div>

            {/* Bottom fade gradient */}
            <div className="takeover__band-fade takeover__band-fade--bottom" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
