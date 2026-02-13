import { useState } from 'react'
import AnimationPicker from './screens/AnimationPicker'
import TopBar from './components/TopBar'
import './App.css'

function App() {
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null)

  if (!activeAnimation) {
    return (
      <div className="app">
        <AnimationPicker onSelect={setActiveAnimation} />
      </div>
    )
  }

  return (
    <div className="app app--preview">
      <TopBar
        animationId={activeAnimation}
        onBack={() => setActiveAnimation(null)}
      />
      <div className="game-content" />
    </div>
  )
}

export default App
