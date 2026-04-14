/** @typedef {'missing' | 'owned' | 'duplicate'} StickerState */

const NEXT = /** @type {const} */ ({
  missing: 'owned',
  owned: 'duplicate',
  duplicate: 'missing',
})

/**
 * @param {{
 *   number: number
 *   state: StickerState
 *   onToggle: (next: StickerState) => void
 *   hidden?: boolean
 * }} props
 */
export function StickerSquare({ number, state, onToggle, hidden }) {
  if (hidden) return null

  const cycle = () => {
    onToggle(NEXT[state])
  }

  const label =
    state === 'missing'
      ? `Figurita ${number}, falta. Tocar para marcar conseguida.`
      : state === 'owned'
        ? `Figurita ${number}, conseguida. Tocar para marcar duplicada.`
        : `Figurita ${number}, duplicada. Tocar para marcar falta.`

  return (
    <button
      type="button"
      className={`sticker-square sticker-square--${state}`}
      data-sticker-num={number}
      onClick={cycle}
      aria-label={label}
    >
      <span className="sticker-square__num">{number}</span>
      {(state === 'owned' || state === 'duplicate') && (
        <span className={`sticker-square__dot sticker-square__dot--${state}`} aria-hidden />
      )}
    </button>
  )
}
