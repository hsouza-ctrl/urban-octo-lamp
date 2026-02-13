import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import SystemStatusBar from './SystemStatusBar'
import AnimatedLoyaltyStatus from './AnimatedLoyaltyStatus'
import type { Stage as GemStage } from './AnimatedLoyaltyStatus'
import AnimatedLoyaltyUpgrade from './AnimatedLoyaltyUpgrade'
import type { UpgradeStage } from './AnimatedLoyaltyUpgrade'
import AnimatedLevelUp from './AnimatedLevelUp'
import type { LevelStage } from './AnimatedLevelUp'
import PlayerLevel from './PlayerLevel'
import StaticGemBadge from './StaticGemBadge'
import BackButton from './BackButton'
import BalanceWidget from './BalanceWidget'
import AddIconButton from './AddIconButton'
import QuestOfferWidget from './QuestOfferWidget'
import QuestBadge from './QuestBadge'
import PrizeZoneNotification from './PrizeZoneNotification'
import CoinAnimation from './CoinAnimation'
import LoyaltyTakeover from './LoyaltyTakeover'
import JackpotBadge from './JackpotBadge'
import CustomizePanel from './CustomizePanel'
import './TopBar.css'

const BASE_BALANCE = 232_002
const BONUS = 3_000

export interface TopBarProps {
  animationId?: string
  playerLevel?: number
  onBack?: () => void
}

/*
 * Level-up phases:
 *  idle    → normal layout (loyalty + level)
 *  intro   → loyalty slides out, level slides to loyalty pos
 *  playing → AnimatedLevelUp runs (includes morph back to ring with 82)
 *  outro   → loyalty slides back in
 *  idle    → restart after pause
 */
type LevelPhase = 'idle' | 'intro' | 'playing' | 'outro'

const slideSpring = { type: 'spring' as const, stiffness: 320, damping: 30 }
const questOfferEnterSpring = { type: 'spring' as const, stiffness: 140, damping: 22 }
const plusEntranceTransition = { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }

export default function TopBar({
  animationId = 'gem-collected',
  playerLevel = 81,
  onBack,
}: TopBarProps) {
  const isGem = animationId === 'gem-collected'
  const isUpgrade = animationId === 'loyalty-upgrade'
  const isLevel = animationId === 'level-up'
  const isQuestOffer = animationId === 'quest-offer'
  const isPrizeZone = animationId === 'prize-zone'
  const isCustomize = animationId === 'customize'

  /* ── Customize panel state ── */
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [customizedIds, setCustomizedIds] = useState<string[] | null>(null)

  /* Reset state when entering/leaving the customize flow */
  useEffect(() => {
    if (!isCustomize) {
      setCustomizeOpen(false)
      setCustomizedIds(null)
    }
  }, [isCustomize])

  const openCustomize = useCallback(() => setCustomizeOpen(true), [])

  /* ── Horizontal scroll with mouse wheel + left fade on badges area ── */
  const badgesRef = useRef<HTMLDivElement>(null)
  const [badgesScrolled, setBadgesScrolled] = useState(false)

  useEffect(() => {
    const el = badgesRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }
    const onScroll = () => {
      setBadgesScrolled(el.scrollLeft > 2)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('scroll', onScroll)
    }
  })

  /* When badge list changes (e.g. one removed), reset scroll so first badge isn’t behind fade */
  useEffect(() => {
    if (!isCustomize) return
    const el = badgesRef.current
    if (el) {
      el.scrollLeft = 0
      setBadgesScrolled(false)
    }
  }, [isCustomize, customizedIds])

  const handleCustomizeClose = useCallback(
    (activeIds: string[]) => {
      setCustomizedIds(activeIds)
      setCustomizeOpen(false)
    },
    []
  )

  /* ── Quest Offer phases ── */
  // 'default' = loyalty+level+quest counter+plus; 'offer' = quest widget; 'confirmed' = success; 'transition' = transition badge; 'outro' = dismiss
  type QuestPhase = 'default' | 'offer' | 'confirmed' | 'transition' | 'outro'
  const [questPhase, setQuestPhase] = useState<QuestPhase>('default')
  const [questLoopKey, setQuestLoopKey] = useState(0)
  const [questJoined, setQuestJoined] = useState(false)

  useEffect(() => {
    if (!isQuestOffer) return
    setQuestPhase('default')
    const t = setTimeout(() => setQuestPhase('offer'), 2000)
    return () => clearTimeout(t)
  }, [isQuestOffer, questLoopKey])

  /* ── Prize Zone — default badges + notification from right, 4s then exit ── */
  type PrizeZonePhase = 'idle' | 'visible' | 'exiting'
  const [prizeZonePhase, setPrizeZonePhase] = useState<PrizeZonePhase>('idle')
  const [prizeZoneKey, setPrizeZoneKey] = useState(0)
  const [prizeZonePlusKey, setPrizeZonePlusKey] = useState(0)

  useEffect(() => {
    if (!isPrizeZone) return
    setPrizeZonePhase('idle')
    const t1 = setTimeout(() => setPrizeZonePhase('visible'), 1000)
    const t2 = setTimeout(() => setPrizeZonePhase('exiting'), 1000 + 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [isPrizeZone, prizeZoneKey])

  /* ── Shared coin/balance state ── */
  const sourceRef = useRef<HTMLDivElement>(null)
  const balanceRef = useRef<HTMLDivElement>(null)
  const [balance, setBalance] = useState(BASE_BALANCE)
  const [showBonus, setShowBonus] = useState(false)
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  /* ── Gem Collected state ── */
  const [gemStage, setGemStage] = useState<GemStage>(1)

  /* ── Loyalty Upgrade state ── */
  const [upgradeStage, setUpgradeStage] = useState<UpgradeStage>(1)

  /* ── Level Up state ── */
  const [levelPhase, setLevelPhase] = useState<LevelPhase>('idle')
  const [levelStage, setLevelStage] = useState<LevelStage>(1)
  const [loopKey, setLoopKey] = useState(0)

  /* ── Level Up phase management ── */
  // Intro/playing are NOT time-based: ring fills to 100% during idle (all icons visible), then onReached100 triggers intro → playing
  useEffect(() => {
    if (!isLevel) return
    setLevelPhase('idle')
  }, [isLevel, loopKey, playerLevel])

  const handleLevelReached100 = useCallback(() => {
    setLevelPhase('intro')
    setTimeout(() => setLevelPhase('playing'), 700)
  }, [])

  const handleLevelComplete = () => {
    // AnimatedLevelUp has already morphed back to ring showing 82
    // Now loyalty slides back in
    setLevelPhase('outro')
    setTimeout(() => {
      setLevelPhase('idle')
      // Restart loop after rest
      setTimeout(() => {
        setLevelStage(1)
        setLoopKey((k) => k + 1)
      }, 3000)
    }, 800)
  }

  /* ── Derived visibility ── */
  const gemShowLevel = gemStage <= 2 || gemStage === 13
  const upgradeShowLevel = upgradeStage <= 2 || upgradeStage === 11

  // When is loyalty hidden?
  const isLoyaltyHidden =
    levelPhase === 'intro' ||
    levelPhase === 'playing'

  // Default badges area (gem + level) visible when default, transition, or outro
  const questDefault = isQuestOffer && (questPhase === 'default' || questPhase === 'outro' || questPhase === 'transition')
  /* Plus: inside quest/prize-zone wrappers when isQuestOffer/isPrizeZone; standalone for other flows */
  const showAddIcon =
    (isGem && gemShowLevel) ||
    (isUpgrade && upgradeShowLevel) ||
    (isLevel && (levelPhase === 'idle' || levelPhase === 'outro'))

  // Balance visible during coin stages
  const coinStageActive = isGem
    ? gemStage === 9
    : isUpgrade
      ? upgradeStage === 7
      : isLevel && levelStage === 7
  const showBalance = isGem
    ? gemStage >= 8 && gemStage <= 10
    : isUpgrade
      ? upgradeStage >= 6 && upgradeStage <= 8
      : isLevel && levelStage >= 6 && levelStage <= 8
  const showCoins = coinStageActive

  /* ── Reset rects when leaving coin stage so next run captures fresh ── */
  useEffect(() => {
    if (!coinStageActive) {
      setSourceRect(null)
      setTargetRect(null)
    }
  }, [coinStageActive])

  /* ── Snapshot positions for coin animation (after layout so first run has rects) ── */
  useEffect(() => {
    if (!coinStageActive) return
    const capture = () => {
      if (sourceRef.current) setSourceRect(sourceRef.current.getBoundingClientRect())
      if (balanceRef.current) setTargetRect(balanceRef.current.getBoundingClientRect())
    }
    const id = requestAnimationFrame(() => requestAnimationFrame(capture))
    return () => cancelAnimationFrame(id)
  }, [coinStageActive])

  /* ── Animate balance counter ── */
  useEffect(() => {
    if (coinStageActive) {
      setShowBonus(true)
      let frame: number
      const start = performance.now()
      const duration = 1600
      const from = BASE_BALANCE
      const to = BASE_BALANCE + BONUS
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        setBalance(Math.round(from + (to - from) * eased))
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(frame)
    }
  }, [coinStageActive])

  /* ── Reset balance on loop restart ── */
  useEffect(() => {
    if ((isGem && gemStage === 1) || (isUpgrade && upgradeStage === 1) || (isLevel && levelPhase === 'idle')) {
      setBalance(BASE_BALANCE)
      setShowBonus(false)
    }
  }, [isGem, isUpgrade, isLevel, gemStage, upgradeStage, levelPhase])

  return (
    <header className={`topbar${customizeOpen ? ' topbar--customize-open' : ''}`}>
      <div className="topbar__system">
        <SystemStatusBar />
      </div>

      {!customizeOpen && (
      <div className="topbar__ingame">
        <BackButton onBack={onBack} />

        <div
          className={`topbar__badges${isCustomize ? ' topbar__badges--scrollable' : ''}${isCustomize && badgesScrolled ? ' topbar__badges--scrolled' : ''}`}
          ref={isCustomize ? badgesRef : undefined}
        >
          {/* ═══ CUSTOMIZE FLOW — default or customized badges ═══ */}
          {isCustomize && (
            customizedIds ? (
              <>
                {customizedIds.map((id) => {
                  switch (id) {
                    case 'loyalty':
                      return <StaticGemBadge key={id} pct={75} />
                    case 'level':
                      return <PlayerLevel key={id} level={playerLevel} pct={75} />
                    case 'quest':
                      return <QuestBadge key={id} value={0} goal={250} pct={0} />
                    case 'jackpot':
                      return <JackpotBadge key={id} />
                    case 'balance':
                      return (
                        <BalanceWidget
                          key={id}
                          visible
                          value={BASE_BALANCE}
                        />
                      )
                    default:
                      return null
                  }
                })}
                <AddIconButton onClick={openCustomize} />
              </>
            ) : (
              <>
                <StaticGemBadge pct={75} />
                <PlayerLevel level={playerLevel} pct={75} />
                <AddIconButton onClick={openCustomize} />
              </>
            )
          )}

          {/* ═══ QUEST OFFER — default badges or quest widget ═══ */}
          {isQuestOffer && questDefault && (
            questPhase === 'outro' ? (
              <motion.div
                key="quest-defaults-outro"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={plusEntranceTransition}
                className="topbar__quest-badges"
              >
                <StaticGemBadge pct={0} />
                <PlayerLevel level={playerLevel} pct={0} />
                {questJoined && <QuestBadge value={0} pct={0} />}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={plusEntranceTransition}
                  style={{ flexShrink: 0, display: 'flex' }}
                >
                  <AddIconButton onClick={openCustomize} />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="quest-defaults-main"
                initial={questPhase === 'transition' ? { opacity: 0, scale: 0.88 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="topbar__quest-badges"
              >
                <StaticGemBadge pct={0} />
                <PlayerLevel level={playerLevel} pct={0} />
                {(questPhase === 'transition' || (questPhase === 'default' && questJoined)) && (
                  <QuestBadge
                    value={0}
                    pct={0}
                    transition={questPhase === 'transition'}
                  />
                )}
                <motion.div
                  className="topbar__quest-plus-slot"
                  initial={false}
                  animate={{
                    opacity: questPhase === 'transition' ? 0 : 1,
                    scale: questPhase === 'transition' ? 0.85 : 1,
                    pointerEvents: questPhase === 'transition' ? 'none' : 'auto',
                  }}
                  transition={plusEntranceTransition}
                  aria-hidden={questPhase === 'transition'}
                >
                  <AddIconButton onClick={openCustomize} />
                </motion.div>
              </motion.div>
            )
          )}
          {isQuestOffer && (questPhase === 'offer' || questPhase === 'confirmed' || questPhase === 'outro') && (
            <motion.div
              key={`quest-wrap-${questLoopKey}`}
              className="topbar__quest-offer-wrap"
              initial={questPhase === 'outro' ? false : { x: '100%' }}
              animate={{ x: questPhase === 'outro' ? '100%' : 0 }}
              transition={questPhase === 'outro' ? slideSpring : questOfferEnterSpring}
              onAnimationComplete={questPhase === 'outro' ? () => {
                setQuestPhase('default')
                setTimeout(() => setQuestLoopKey((k) => k + 1), 2000)
              } : undefined}
              style={{ flexShrink: 0 }}
            >
              <QuestOfferWidget
                key={questLoopKey}
                onJoin={() => {
                  setQuestJoined(true)
                  setQuestPhase('confirmed')
                  setTimeout(() => {
                    setQuestPhase('transition')
                    setTimeout(() => {
                      setQuestPhase('default')
                      setTimeout(() => setQuestLoopKey((k) => k + 1), 2000)
                    }, 1800)
                  }, 2000)
                }}
                onTimerEnd={() => {
                  setQuestPhase('outro')
                }}
              />
            </motion.div>
          )}

          {/* ═══ GEM COLLECTED ═══ */}
          {!isQuestOffer && !isPrizeZone && isGem && (
            <>
              <AnimatedLoyaltyStatus ref={sourceRef} onStageChange={setGemStage} />
              <div className={`topbar__level-wrap${gemShowLevel ? '' : ' topbar__level-wrap--hidden'}`}>
                <PlayerLevel level={playerLevel} pct={0} />
              </div>
            </>
          )}

          {/* ═══ LOYALTY UPGRADE ═══ */}
          {!isQuestOffer && !isPrizeZone && isUpgrade && (
            <>
              <AnimatedLoyaltyUpgrade ref={sourceRef} onStageChange={setUpgradeStage} />
              <div className={`topbar__level-wrap${upgradeShowLevel ? '' : ' topbar__level-wrap--hidden'}`}>
                <PlayerLevel level={playerLevel} pct={0} />
              </div>
            </>
          )}

          {/* ═══ PRIZE ZONE — ícones saem para esquerda; notificação entra pela direita ═══ */}
          {isPrizeZone && (
            <>
              <motion.div
                className="topbar__prize-zone-icons"
                initial={false}
                animate={{
                  x: prizeZonePhase === 'visible' ? -80 : 0,
                  opacity: prizeZonePhase === 'visible' ? 0 : 1,
                  width: prizeZonePhase === 'visible' ? 0 : 'auto',
                  marginRight: prizeZonePhase === 'visible' ? -12 : 0,
                }}
                transition={slideSpring}
                style={{ overflow: 'visible', flexShrink: 0 }}
              >
                <StaticGemBadge pct={0} />
                <PlayerLevel level={playerLevel} pct={0} />
                <motion.div
                  key={`prize-zone-plus-${prizeZonePlusKey}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={plusEntranceTransition}
                  style={{ flexShrink: 0, display: 'flex' }}
                >
                  <AddIconButton onClick={openCustomize} />
                </motion.div>
              </motion.div>
              {(prizeZonePhase === 'visible' || prizeZonePhase === 'exiting') && (
                <motion.div
                  key={`prize-zone-notif-${prizeZoneKey}`}
                  initial={{ x: '100%' }}
                  animate={{ x: prizeZonePhase === 'exiting' ? '100%' : 0 }}
                  transition={questOfferEnterSpring}
                  onAnimationComplete={
                    prizeZonePhase === 'exiting'
                      ? () => {
                          setPrizeZonePhase('idle')
                          setPrizeZonePlusKey((k) => k + 1)
                          setTimeout(() => setPrizeZoneKey((k) => k + 1), 2000)
                        }
                      : undefined
                  }
                  style={{ flexShrink: 0 }}
                >
                  <PrizeZoneNotification />
                </motion.div>
              )}
            </>
          )}

          {/* ═══ LEVEL UP ═══ */}
          {!isQuestOffer && !isPrizeZone && isLevel && (
            <>
              {/* Loyalty — slides left + collapses so balance stays close */}
              <motion.div
                className="topbar__slide-loyalty"
                animate={{
                  x: isLoyaltyHidden ? -80 : 0,
                  opacity: isLoyaltyHidden ? 0 : 1,
                  width: isLoyaltyHidden ? 0 : 40,
                  marginRight: isLoyaltyHidden ? -12 : 0,
                }}
                transition={slideSpring}
                style={{ overflow: 'visible' }}
              >
                <StaticGemBadge pct={0} />
              </motion.div>

              {/* Level — loyalty collapse moves it into position naturally */}
              <motion.div
                ref={sourceRef}
                className="topbar__slide-level"
                transition={slideSpring}
              >
                <AnimatedLevelUp
                  key={loopKey}
                  level={playerLevel}
                  newLevel={playerLevel + 1}
                  paused={levelPhase === 'intro'}
                  onStageChange={setLevelStage}
                  onComplete={handleLevelComplete}
                  onReached100={handleLevelReached100}
                />
              </motion.div>
            </>
          )}

          {/* ═══ Add icon — only in animated flows (both icons on screen) ═══ */}
          {showAddIcon && !isCustomize && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={plusEntranceTransition}
              style={{ flexShrink: 0, display: 'flex' }}
            >
              <AddIconButton onClick={openCustomize} />
            </motion.div>
          )}

          {/* ═══ SHARED: Balance widget ═══ */}
          {!(isQuestOffer && !questDefault) && !isCustomize && (
          <BalanceWidget
            ref={balanceRef}
            visible={showBalance}
            value={balance}
            bonus={BONUS}
            showBonus={showBonus}
          />
          )}
        </div>
      </div>
      )}

      {/* ═══ CUSTOMIZE PANEL ═══ */}
      {customizeOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          <CustomizePanel
            initialActiveIds={customizedIds ?? undefined}
            onClose={handleCustomizeClose}
          />
        </motion.div>
      )}

      {/* Coin animation overlay */}
      <CoinAnimation
        sourceRect={sourceRect}
        targetRect={targetRect}
        active={showCoins}
        count={10}
      />

      {/* Loyalty Upgrade takeover — only within top bar (ingame row) */}
      <div className="topbar__takeover-wrap">
        <LoyaltyTakeover visible={isUpgrade && upgradeStage === 5} />
      </div>
    </header>
  )
}
