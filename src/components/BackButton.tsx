import './BackButton.css'

interface BackButtonProps {
  onBack?: () => void
}

const BackButton: React.FC<BackButtonProps> = ({ onBack }) => {
  const handleClick = () => {
    if (onBack) {
      onBack()
    } else {
      console.log('Back button clicked')
    }
  }

  return (
    <button className="back-button" onClick={handleClick} aria-label="Voltar">
      {/* Material Design arrow_back_ios */}
      <svg
        className="back-button__icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.77 3.77L16 2 6 12l10 10 1.77-1.77L9.54 12z"
          fill="#B2B2B2"
        />
      </svg>
    </button>
  )
}

export default BackButton
