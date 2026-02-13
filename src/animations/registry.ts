export interface AnimationEntry {
  id: string
  name: string
  description: string
  icon: string
}

const animations: AnimationEntry[] = [
  {
    id: 'gem-collected',
    name: 'Gem Collected',
    description: 'Loyalty status fills to 100%, new gem collected message, gems display, coin reward',
    icon: '💎',
  },
  {
    id: 'loyalty-upgrade',
    name: 'Loyalty Upgrade',
    description: 'Amethyst → Topaz: status fills to 100%, new status reached, topaz gem activates',
    icon: '🔥',
  },
  {
    id: 'level-up',
    name: 'Level Up',
    description: 'Level progress fills to 100%, level up message, coin reward',
    icon: '⬆️',
  },
  {
    id: 'quest-offer',
    name: 'Quest Offer',
    description: 'Quest available widget with 7s timer, JOIN and confirmation',
    icon: '📋',
  },
  {
    id: 'prize-zone',
    name: 'Prize Zone',
    description: 'Notification from the right: Prize Zone message, 4s then dismiss',
    icon: '🏆',
  },
  {
    id: 'customize',
    name: 'Customize',
    description: 'Drag widgets between active and inactive zones to customize the top bar',
    icon: '⚙️',
  },
]

export default animations
