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
      <svg
        className="back-button__icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 13L7.83 13L13.42 18.59L12 20L4 12L12 4L13.41 5.41L7.83 11L20 11L20 13Z"
          fill="#B2B2B2"
        />
      </svg>
    </button>
  )
}

export default BackButton
