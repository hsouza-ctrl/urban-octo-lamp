import { motion } from 'motion/react'
import { forwardRef } from 'react'
import './BalanceWidget.css'

interface BalanceWidgetProps {
  visible: boolean
  value: number
  bonus?: number | null
  showBonus?: boolean
}

function formatNumber(n: number) {
  return n.toLocaleString('en-US')
}

function BalanceIcon() {
  return (
    <svg className="balance__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.99707 1.66797C14.5994 1.66797 18.3301 5.3986 18.3301 10.001C18.3301 14.6033 14.5994 18.334 9.99707 18.334C5.3947 18.334 1.66406 14.6033 1.66406 10.001C1.66406 5.3986 5.3947 1.66797 9.99707 1.66797ZM6.1084 5.00098V5.15234L6.38086 5.25879C6.58287 5.32943 6.72211 5.4257 6.79785 5.54688C6.8734 5.66811 6.91113 5.83503 6.91113 6.04688V13.9551C6.91113 14.157 6.87354 14.3192 6.79785 14.4404C6.72211 14.5616 6.58285 14.6623 6.38086 14.7432L6.1084 14.8496V15.001H11.3877C12.8323 15.001 14.0056 13.8283 14.0059 12.3838C14.0059 10.9391 12.8324 9.76562 11.3877 9.76562H11.29C10.4401 9.76562 9.74689 10.4432 9.72266 11.2871H9.61914C9.59481 10.4432 8.90176 9.76562 8.05176 9.76562V9.66797C8.91825 9.66797 9.62207 8.96405 9.62207 8.09766L9.61914 8.04883H9.72266L9.71973 8.09766C9.71973 8.96405 10.4236 9.66797 11.29 9.66797H11.3936C12.6788 9.66509 13.7217 8.61991 13.7217 7.33398C13.7215 6.04633 12.6754 5.00098 11.3877 5.00098H6.1084Z" fill="white" />
    </svg>
  )
}

const BalanceWidget = forwardRef<HTMLDivElement, BalanceWidgetProps>(
  ({ visible, value, bonus = null, showBonus = false }, ref) => {
    return (
      <motion.div
        ref={ref}
        className="balance"
        initial={{ opacity: 0, scale: 0.85, x: 20 }}
        animate={
          visible
            ? { opacity: 1, scale: 1, x: 0 }
            : { opacity: 0, scale: 0.85, x: 20 }
        }
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        style={{ pointerEvents: visible ? 'auto' : 'none' }}
      >
        <div className="balance__inner">
          <BalanceIcon />
          <span className="balance__value">{formatNumber(value)}</span>
        </div>

        {bonus !== null && (
          <motion.div
            className="balance__bonus"
            initial={{ opacity: 0, scale: 0.5, y: 4, x: '75%' }}
            animate={
              showBonus
                ? { opacity: 1, scale: 1, y: 0, x: '75%' }
                : { opacity: 0, scale: 0.5, y: 4, x: '75%' }
            }
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          >
            +{formatNumber(bonus)}
          </motion.div>
        )}
      </motion.div>
    )
  },
)

BalanceWidget.displayName = 'BalanceWidget'
export default BalanceWidget
