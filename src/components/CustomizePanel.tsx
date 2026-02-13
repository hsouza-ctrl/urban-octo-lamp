import { useState, useRef, useCallback, type ReactNode } from 'react'
import { motion, Reorder, type PanInfo } from 'motion/react'
import StaticGemBadge from './StaticGemBadge'
import PlayerLevel from './PlayerLevel'
import QuestBadge from './QuestBadge'
import JackpotBadge from './JackpotBadge'
import './CustomizePanel.css'

/* ── Widget definitions ── */
type WidgetSize = 'circle' | 'pill'

interface WidgetDef {
  id: string
  label: string
  size: WidgetSize
  render: () => ReactNode
}

function StaticBalance() {
  return (
    <div
      style={{
        height: 40,
        borderRadius: 20,
        background: '#121212',
        border: '1px solid #3a3a3a',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 12px 0 8px',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M9.99707 1.66797C14.5994 1.66797 18.3301 5.3986 18.3301 10.001C18.3301 14.6033 14.5994 18.334 9.99707 18.334C5.3947 18.334 1.66406 14.6033 1.66406 10.001C1.66406 5.3986 5.3947 1.66797 9.99707 1.66797ZM6.1084 5.00098V5.15234L6.38086 5.25879C6.58287 5.32943 6.72211 5.4257 6.79785 5.54688C6.8734 5.66811 6.91113 5.83503 6.91113 6.04688V13.9551C6.91113 14.157 6.87354 14.3192 6.79785 14.4404C6.72211 14.5616 6.58285 14.6623 6.38086 14.7432L6.1084 14.8496V15.001H11.3877C12.8323 15.001 14.0056 13.8283 14.0059 12.3838C14.0059 10.9391 12.8324 9.76562 11.3877 9.76562H11.29C10.4401 9.76562 9.74689 10.4432 9.72266 11.2871H9.61914C9.59481 10.4432 8.90176 9.76562 8.05176 9.76562V9.66797C8.91825 9.66797 9.62207 8.96405 9.62207 8.09766L9.61914 8.04883H9.72266L9.71973 8.09766C9.71973 8.96405 10.4236 9.66797 11.29 9.66797H11.3936C12.6788 9.66509 13.7217 8.61991 13.7217 7.33398C13.7215 6.04633 12.6754 5.00098 11.3877 5.00098H6.1084Z"
          fill="white"
        />
      </svg>
      <span
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 14,
          color: '#fff',
          whiteSpace: 'nowrap',
        }}
      >
        232,002
      </span>
    </div>
  )
}

const WIDGETS: WidgetDef[] = [
  { id: 'loyalty', label: 'Loyalty', size: 'circle', render: () => <StaticGemBadge pct={75} /> },
  { id: 'level', label: 'Level', size: 'circle', render: () => <PlayerLevel level={81} pct={75} /> },
  { id: 'quest', label: 'Quest', size: 'circle', render: () => <QuestBadge value={0} goal={250} pct={0} /> },
  { id: 'jackpot', label: 'Jackpot', size: 'circle', render: () => <JackpotBadge /> },
  { id: 'balance', label: 'Coin Balance', size: 'pill', render: () => <StaticBalance /> },
]

/* ── Drag hand / pointer icon for hint ── */
function DragHintIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="customize-panel__hint-icon" aria-hidden>
      <path
        d="M1.77875 6.00922L0.71875 4.94922L4.21875 1.44922L7.71875 4.94922L6.65875 6.00922L5.03875 4.38922C4.82875 5.20922 4.71875 6.06922 4.71875 6.94922C4.71875 9.36922 5.53875 11.5992 6.91875 13.3792L5.84875 14.4492C4.20875 12.3992 3.21875 9.78922 3.21875 6.94922C3.21875 6.02922 3.31875 5.12922 3.51875 4.26922L1.77875 6.00922ZM13.5688 12.0692L10.8888 6.69922C10.5188 5.95922 9.61875 5.65922 8.87875 6.02922C8.12875 6.40922 7.82875 7.30922 8.19875 8.04922L13.0087 17.6492L9.76875 18.4492C9.43875 18.5392 9.17875 18.7792 9.06875 19.1092L8.71875 20.2292L14.9087 22.4792C15.4087 22.6492 16.1888 22.4992 16.6588 22.2592L22.1688 19.5092C23.0588 19.0592 23.4888 18.0292 23.1688 17.0892L21.7388 12.8192C21.4688 11.9992 20.6988 11.4492 19.8388 11.4492H15.2788C14.9688 11.4492 14.6588 11.5192 14.3888 11.6592L13.5688 12.0692Z"
        fill="#A0A0A0"
        style={{ fill: 'color(display-p3 0.6275 0.6275 0.6275)' }}
      />
    </svg>
  )
}

/* ── Close X icon ── */
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M15 5L5 15M5 5L15 15"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ═══════════════════════════════════════════════
   CustomizePanel
   ═══════════════════════════════════════════════ */

const ALL_WIDGET_IDS = WIDGETS.map((w) => w.id)
const DEFAULT_ACTIVE_IDS = ['loyalty', 'level']

function getInitialActive(initialActiveIds: string[] | undefined): string[] {
  if (!initialActiveIds?.length) return DEFAULT_ACTIVE_IDS
  const valid = initialActiveIds.filter((id) => ALL_WIDGET_IDS.includes(id))
  return valid.length > 0 ? valid : DEFAULT_ACTIVE_IDS
}

interface CustomizePanelProps {
  initialActiveIds?: string[]
  onClose?: (activeIds: string[]) => void
}

export default function CustomizePanel({ initialActiveIds, onClose }: CustomizePanelProps) {
  const [activeIds, setActiveIds] = useState<string[]>(() => getInitialActive(initialActiveIds))
  const [inactiveIds, setInactiveIds] = useState<string[]>(() => {
    const active = getInitialActive(initialActiveIds)
    return ALL_WIDGET_IDS.filter((id) => !active.includes(id))
  })
  const [dragOverZone, setDragOverZone] = useState<'active' | 'inactive' | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [draggingFromZone, setDraggingFromZone] = useState<'active' | 'inactive' | null>(null)
  const [dropIndex, setDropIndex] = useState<number>(0)

  const activeZoneRef = useRef<HTMLDivElement>(null)
  const inactiveZoneRef = useRef<HTMLDivElement>(null)

  const getWidgetDef = (id: string) => WIDGETS.find((w) => w.id === id)!

  /* ── Determine which zone the pointer is over ── */
  const getZoneAtPoint = useCallback(
    (point: { x: number; y: number }, sourceZone: 'active' | 'inactive'): 'active' | 'inactive' | null => {
      const targetZone = sourceZone === 'active' ? 'inactive' : 'active'
      const ref = targetZone === 'active' ? activeZoneRef : inactiveZoneRef
      if (!ref.current) return null
      const rect = ref.current.getBoundingClientRect()
      // Generous hit zone (expand by 20px)
      if (
        point.x >= rect.left - 20 &&
        point.x <= rect.right + 20 &&
        point.y >= rect.top - 20 &&
        point.y <= rect.bottom + 20
      ) {
        return targetZone
      }
      return null
    },
    [],
  )

  /* ── Move widget between zones ── */
  const moveToActive = useCallback((id: string, atIndex?: number) => {
    setInactiveIds((prev) => prev.filter((i) => i !== id))
    if (atIndex !== undefined) {
      setActiveIds((prev) => [...prev.slice(0, atIndex), id, ...prev.slice(atIndex)])
    } else {
      setActiveIds((prev) => [...prev, id])
    }
  }, [])

  const insertIntoActiveAt = useCallback((id: string, index: number) => {
    setInactiveIds((prev) => prev.filter((i) => i !== id))
    setActiveIds((prev) => [...prev.slice(0, index), id, ...prev.slice(index)])
  }, [])

  const moveToInactive = useCallback(
    (id: string) => {
      setActiveIds((prev) => prev.filter((i) => i !== id))
      setInactiveIds((prev) => [...prev, id])
    },
    [],
  )

  /* ── Drag handlers ── */
  const handleDrag = useCallback(
    (sourceZone: 'active' | 'inactive') =>
      (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const point = info.point
        const zone = getZoneAtPoint(point, sourceZone)
        setDragOverZone(zone)
        if (zone === 'active' && sourceZone === 'inactive' && activeZoneRef.current) {
          const container = activeZoneRef.current
          const items = Array.from(container.children).filter(
            (el) => !(el as HTMLElement).hasAttribute('data-placeholder')
          )
          if (items.length === 0) {
            setDropIndex(0)
            return
          }
          for (let i = 0; i < items.length; i++) {
            const rect = items[i].getBoundingClientRect()
            if (point.x < rect.left + rect.width / 2) {
              setDropIndex(i)
              return
            }
          }
          setDropIndex(items.length)
        }
      },
    [getZoneAtPoint],
  )

  const handleDragStart = useCallback(
    (id: string, sourceZone: 'active' | 'inactive') => () => {
      setDraggingId(id)
      setDraggingFromZone(sourceZone)
    },
    [],
  )

  const handleDragEnd = useCallback(
    (id: string, sourceZone: 'active' | 'inactive') =>
      (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const point = info.point
        const zone = getZoneAtPoint(point, sourceZone)
        if (zone === 'active' && sourceZone === 'inactive') {
          insertIntoActiveAt(id, dropIndex)
        } else if (zone === 'inactive' && sourceZone === 'active') {
          moveToInactive(id)
        }
        setDragOverZone(null)
        setDraggingId(null)
        setDraggingFromZone(null)
        setDropIndex(0)
      },
    [getZoneAtPoint, insertIntoActiveAt, moveToInactive, dropIndex],
  )

  /* ── Render an active draggable widget (reorderable) ── */
  const renderActiveDraggable = (id: string) => {
    const def = getWidgetDef(id)
    const isDragging = draggingId === id
    const wobbleClass = isDragging ? '' : ' customize-panel__widget--wobble'
    return (
      <Reorder.Item
        key={id}
        value={id}
        as="div"
        className={`customize-panel__widget${wobbleClass}`}
        drag
        dragSnapToOrigin
        dragElastic={0}
        dragMomentum={false}
        whileDrag={{ scale: 1.08, zIndex: 100 }}
        onDragStart={handleDragStart(id, 'active')}
        onDrag={handleDrag('active')}
        onDragEnd={handleDragEnd(id, 'active')}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {def.render()}
      </Reorder.Item>
    )
  }

  /* ── Render an inactive draggable widget ── */
  const renderInactiveDraggable = (id: string) => {
    const def = getWidgetDef(id)
    const isDragging = draggingId === id
    const wobbleClass = isDragging ? '' : ' customize-panel__widget--wobble'
    return (
      <motion.div
        key={id}
        className={`customize-panel__widget${wobbleClass}`}
        drag
        dragSnapToOrigin
        dragElastic={0}
        dragMomentum={false}
        whileDrag={{ scale: 1.08, zIndex: 100 }}
        onDragStart={handleDragStart(id, 'inactive')}
        onDrag={handleDrag('inactive')}
        onDragEnd={handleDragEnd(id, 'inactive')}
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {def.render()}
      </motion.div>
    )
  }

  /* ── Determine if we should show a drop placeholder in the active zone ── */
  const showDropPlaceholder = dragOverZone === 'active' && draggingFromZone === 'inactive' && draggingId
  const placeholderSize = showDropPlaceholder ? getWidgetDef(draggingId!).size : null
  const activeValues = showDropPlaceholder
    ? [...activeIds.slice(0, dropIndex), '__placeholder__', ...activeIds.slice(dropIndex)]
    : activeIds
  const handleReorder = useCallback((newOrder: string[]) => {
    setActiveIds(newOrder.filter((id) => id !== '__placeholder__'))
  }, [])

  const activeClasses = [
    'customize-panel__active-zone',
    dragOverZone === 'active' ? 'customize-panel__active-zone--drop-target' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const inactiveClasses = [
    'customize-panel__inactive',
    dragOverZone === 'inactive' ? 'customize-panel__inactive--drop-target' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.05, delayChildren: 0.12 },
    },
  }
  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  return (
    <motion.div
      className="customize-panel"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Active zone (reorderable) ── */}
      <motion.div variants={itemVariants} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
      <Reorder.Group
        axis="x"
        values={activeValues}
        onReorder={handleReorder}
        ref={activeZoneRef}
        className={activeClasses}
        as="div"
      >
        {activeIds.length === 0 && !showDropPlaceholder ? (
          <p className="customize-panel__no-active">Drag here to pin</p>
        ) : (
          activeValues.map((v) =>
            v === '__placeholder__' ? (
              <Reorder.Item
                key="__placeholder__"
                value="__placeholder__"
                drag={false}
                data-placeholder
                as="div"
                className={`customize-panel__drop-placeholder customize-panel__drop-placeholder--${placeholderSize}`}
                style={{ cursor: 'default' }}
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M6 1V11M1 6H11" stroke="#7B61FF" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.span>
              </Reorder.Item>
            ) : (
              renderActiveDraggable(v)
            )
          )
        )}
      </Reorder.Group>
      </motion.div>

      {/* ── Inactive zone ── */}
      <motion.div className="customize-panel__inactive-wrap" variants={itemVariants} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
      <div ref={inactiveZoneRef} className={inactiveClasses}>
        {inactiveIds.length === 0 ? (
          <p className="customize-panel__all-active">Drag here to remove from gameplay</p>
        ) : (
          inactiveIds.map((id) => {
            const def = getWidgetDef(id)
            return (
              <div key={id} className="customize-panel__inactive-item">
                {renderInactiveDraggable(id)}
                <p className="customize-panel__inactive-label">{def.label}</p>
              </div>
            )
          })
        )}
      </div>
      </motion.div>

      {/* ── Hint ── */}
      <motion.div variants={itemVariants} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
      <div className="customize-panel__hint">
        <DragHintIcon />
        <p className="customize-panel__hint-text">
          Drag the widgets to set their order and choose which ones appear during gameplay.
        </p>
      </div>
      </motion.div>

      {/* ── Close button ── */}
      <motion.div variants={itemVariants} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <motion.button
          type="button"
          className="customize-panel__close"
          onClick={() => onClose?.(activeIds)}
          whileTap={{ scale: 0.92 }}
          aria-label="Close customization"
        >
          <CloseIcon />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
