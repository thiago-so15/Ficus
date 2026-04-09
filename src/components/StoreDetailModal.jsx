import { formatWeeklyHoursLines } from '../utils/storeHours'

/**
 * @param {{
 *   store: import('../data/storesCatalog').StoreDefinition
 *   typeLabel: string
 *   isOpen: boolean
 *   onClose: () => void
 * }} props
 */
export function StoreDetailModal({ store, typeLabel, isOpen, onClose }) {
  const mapsQuery = encodeURIComponent(`${store.address}, ${store.city}, ${store.country}`)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

  const lines = formatWeeklyHoursLines(store.weeklyHours)

  return (
    <div className="store-detail-overlay" role="presentation" onClick={onClose}>
      <div
        className="store-detail-sheet fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="store-detail__head">
          <h2 id="store-detail-title" className="store-detail__title">
            {store.name}
          </h2>
          <span className={`store-card__badge store-card__badge--${isOpen ? 'open' : 'closed'}`}>
            {isOpen ? 'Abierto ahora' : 'Cerrado ahora'}
          </span>
        </div>

        <p className="store-detail__meta">
          <span className="store-card__type">{typeLabel}</span>
          <span className="store-detail__city">{store.city}</span>
        </p>

        <p className="store-detail__address">{store.address}</p>

        {store.phone && (
          <p className="store-detail__row">
            <span className="store-detail__label">Teléfono</span>
            <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="store-detail__link">
              {store.phone}
            </a>
          </p>
        )}

        {store.website && (
          <p className="store-detail__row">
            <span className="store-detail__label">Web</span>
            <a href={store.website} className="store-detail__link" target="_blank" rel="noopener noreferrer">
              {store.website.replace(/^https?:\/\//, '')}
            </a>
          </p>
        )}

        <div className="store-detail__section">
          <h3 className="store-detail__subtitle">Horario (hora local de la tienda)</h3>
          <ul className="store-detail__hours">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="store-detail__disclaimer">
            El estado abierto/cerrado se calcula con estos horarios referenciales; en feriados puede variar.
          </p>
        </div>

        <div className="store-detail__section">
          <h3 className="store-detail__subtitle">Sobre el lugar</h3>
          <p className="store-detail__desc">{store.description}</p>
          <p className="store-detail__note">
            <strong>Tip:</strong> {store.note}
          </p>
        </div>

        <div className="store-detail__actions">
          <a className="btn btn--primary btn--block" href={mapsUrl} target="_blank" rel="noopener noreferrer">
            Ver en mapa
          </a>
          <button type="button" className="btn btn--secondary btn--block" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
