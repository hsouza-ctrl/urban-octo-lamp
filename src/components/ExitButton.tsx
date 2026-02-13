import './ExitButton.css'
import exitPng from '../assets/exit.png'

interface ExitButtonProps {
  onExit?: () => void
}

const ExitButton: React.FC<ExitButtonProps> = ({ onExit }) => {
  const handleClick = () => {
    if (onExit) {
      onExit()
    } else {
      console.log('Exit button clicked')
    }
  }

  return (
    <button className="exit-button" onClick={handleClick} aria-label="Sair do jogo">
      <img className="exit-button__icon" src={exitPng} alt="" aria-hidden="true" />
    </button>
  )
}

export default ExitButton
