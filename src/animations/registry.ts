export interface AnimationEntry {
  id: string
  name: string
  icon: string
}

const animations: AnimationEntry[] = [
  { id: 'gem-collected', name: 'Gem Collected', icon: '💎' },
  { id: 'loyalty-upgrade', name: 'Loyalty Upgrade', icon: '🔥' },
  { id: 'level-up', name: 'Level Up', icon: '⬆️' },
  { id: 'quest-offer', name: 'Quest Offer', icon: '📋' },
  { id: 'prize-zone', name: 'Prize Zone', icon: '🏆' },
  { id: 'customize', name: 'Customize', icon: '⚙️' },
]

export default animations
