/**
 * @param {{
 *   store: import('../data/storesCatalog').StoreDefinition
 *   typeLabel: string
 *   isOpen: boolean
 *   onOpen: () => void
 *   showHint?: boolean
 * }} props
 */
export function StoreCard({ store, typeLabel, isOpen, onOpen, showHint = true }) {
  return (
    <button type="button" className="store-card store-card--interactive" onClick={onOpen}>
      <div className="store-card__head">
        <h3 className="store-card__name">{store.name}</h3>
        <span className={`store-card__badge store-card__badge--${isOpen ? 'open' : 'closed'}`}>
          {isOpen ? 'Abierto' : 'Cerrado'}
        </span>
      </div>
      <p className="store-card__meta">
        <span className="store-card__type">{typeLabel}</span>
        <span className="store-card__address">
          {store.address} · {store.city}
        </span>
      </p>
      <p className="store-card__note">{store.note}</p>
      {showHint && <span className="store-card__hint">Tocá para ver horarios y más información</span>}
    </button>
  )
}
