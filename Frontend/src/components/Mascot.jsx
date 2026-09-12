export default function Mascot({ mood = 'happy' }) {
  return (
    <div className={`mascot mascot--${mood}`} role="img" aria-label={`${mood} Juno mascot`}>
      <span className="mascot-ear mascot-ear--left" />
      <span className="mascot-ear mascot-ear--right" />
      <span className="mascot-face">
        <span className="mascot-eye mascot-eye--left" />
        <span className="mascot-eye mascot-eye--right" />
        <span className="mascot-mouth" />
        <span className="mascot-blush mascot-blush--left" />
        <span className="mascot-blush mascot-blush--right" />
      </span>
      <span className="mascot-body" />
      <span className="mascot-sparkle">✦</span>
    </div>
  )
}
