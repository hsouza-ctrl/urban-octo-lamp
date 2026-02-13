import animations from '../animations/registry'
import type { AnimationEntry } from '../animations/registry'
import './AnimationPicker.css'

interface AnimationPickerProps {
  onSelect: (id: string) => void
}

export default function AnimationPicker({ onSelect }: AnimationPickerProps) {
  return (
    <div className="picker">
      <div className="picker__header">
        <h1 className="picker__title">In-Game Animations</h1>
        <p className="picker__subtitle">Select an animation to preview</p>
      </div>

      <div className="picker__list">
        {animations.map((anim) => (
          <button
            key={anim.id}
            className="picker__item"
            onClick={() => onSelect(anim.id)}
          >
            <span className="picker__item-icon">{anim.icon}</span>
            <div className="picker__item-info">
              <span className="picker__item-name">{anim.name}</span>
            </div>
            <svg className="picker__item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}
