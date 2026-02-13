import './AddIconButton.css'

interface Props {
  onClick?: () => void
}

export default function AddIconButton({ onClick }: Props) {
  return (
    <button
      type="button"
      className="add-icon-button"
      onClick={onClick}
      aria-label="Adicionar"
    >
      <svg
        className="add-icon-button__svg"
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect
          x="0.5"
          y="0.5"
          width="39"
          height="39"
          rx="19.5"
          stroke="#3A3A3A"
          strokeDasharray="6 6"
        />
        <path
          d="M13 19L19 19L19 13L21 13L21 19L27 19L27 21L21 21L21 27L19 27L19 21L13 21L13 19Z"
          fill="#B2B2B2"
        />
      </svg>
    </button>
  )
}
