import { useEffect, useMemo, useState } from 'react'
import { getApproxCoordsForStore } from '../data/storeCityCenters'
import { useNowTick } from '../hooks/useNowTick'
import { formatDistanceEs, haversineKm } from '../utils/distanceKm'
import { formatRelativeTimeEs } from '../utils/formatRelativeTimeEs'
import { getOpenStatus, getWeeklyHoursRowsEs } from '../utils/storeHours'
import { getBuiltInSampleReviews } from '../utils/storeSampleReviews'

/**
 * @param {string} fullAddress
 */
function openGoogleMapsQuery(fullAddress) {
  const q = encodeURIComponent(fullAddress)
  window.open(`https://maps.google.com/?q=${q}`, '_blank', 'noopener,noreferrer')
}

/**
 * @param {{ value: number }} props
 */
function StarsDisplay({ value }) {
  return (
    <span className="store-detail-stars" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= value ? 'store-detail-stars__star store-detail-stars__star--on' : 'store-detail-stars__star'}
        >
          ★
        </span>
      ))}
    </span>
  )
}

/**
 * @param {{ value: number, onChange: (n: number) => void }} props
 */
function StarsInput({ value, onChange }) {
  return (
    <div className="store-detail-stars-input" role="group" aria-label="Puntuación de 1 a 5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className={`store-detail-stars-input__btn ${i <= value ? 'store-detail-stars-input__btn--on' : ''}`}
          onClick={() => onChange(i)}
          aria-pressed={i <= value}
        >
          ★
        </button>
      ))}
    </div>
  )
}

/**
 * @param {{ filled: boolean }} props
 */
function HeartIcon({ filled }) {
  return (
    <svg className="store-detail-heart-svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  )
}

/**
 * @param {{
 *   store: import('../data/storesCatalog').StoreDefinition
 *   typeLabel: string
 *   onBack: () => void
 *   isFavorite: boolean
 *   onToggleFavorite: () => void
 *   userReviews: { id: string, author: string, stars: number, text: string, createdAt: string }[]
 *   onAddUserReview: (r: { stars: number, text: string }) => void
 *   reviewAuthorName: string
 * }} props
 */
export function StoreDetailScreen({
  store,
  typeLabel,
  onBack,
  isFavorite,
  onToggleFavorite,
  userReviews,
  onAddUserReview,
  reviewAuthorName,
}) {
  useNowTick(45000)

  const [shareNotice, setShareNotice] = useState(/** @type {string | null} */ (null))
  const [distanceKm, setDistanceKm] = useState(/** @type {number | null} */ (null))
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [formText, setFormText] = useState('')
  const [formStars, setFormStars] = useState(5)

  const fullAddress = `${store.address}, ${store.city}, ${store.country}`
  const coverSrc = store.coverSrc ?? `/store-cover-${store.type}.svg`

  const { open: isOpenNow } = getOpenStatus(store.weeklyHours, store.timezone)
  const hoursRows = useMemo(
    () => getWeeklyHoursRowsEs(store.weeklyHours, store.timezone),
    [store.weeklyHours, store.timezone],
  )

  const builtinReviews = useMemo(() => getBuiltInSampleReviews(store), [store])
  const mergedReviews = useMemo(() => {
    const u = [...userReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const b = [...builtinReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return [...u, ...b]
  }, [userReviews, builtinReviews])

  useEffect(() => {
    if (!shareNotice) return undefined
    const t = window.setTimeout(() => setShareNotice(null), 4200)
    return () => window.clearTimeout(t)
  }, [shareNotice])

  useEffect(() => {
    const coords = getApproxCoordsForStore(store)
    if (!coords || !navigator.geolocation) return undefined
    let cancelled = false
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return
        const km = haversineKm(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          coords,
        )
        setDistanceKm(km)
      },
      () => {},
      { maximumAge: 600000, timeout: 10000, enableHighAccuracy: false },
    )
    return () => {
      cancelled = true
    }
  }, [store])

  const handleShare = async () => {
    const text = `${store.name}\n${fullAddress}`
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: store.name, text })
        setShareNotice(null)
      } catch (e) {
        if (/** @type {any} */ (e)?.name === 'AbortError') return
        setShareNotice('Tu navegador no permite compartir. Copiá la dirección manualmente.')
      }
    } else {
      setShareNotice('Tu navegador no permite compartir. Copiá la dirección manualmente.')
    }
  }

  const submitReview = () => {
    const text = formText.trim()
    if (!text) return
    onAddUserReview({ stars: formStars, text })
    setFormText('')
    setFormStars(5)
    setShowReviewForm(false)
  }

  return (
    <div className="screen screen--store-detail fade-in">
      {shareNotice && (
        <div className="store-detail-toast" role="status">
          {shareNotice}
        </div>
      )}

      <div className="store-detail-scroll">
        <header className="store-detail-hero">
          <img className="store-detail-hero__img" src={coverSrc} alt="" width={800} height={360} />
          <div className="store-detail-hero__bar">
            <button
              type="button"
              className="store-detail-hero__circle-btn"
              onClick={onBack}
              aria-label="Volver a tiendas"
            >
              <span className="store-detail-hero__arrow" aria-hidden>
                ←
              </span>
            </button>
            <button
              type="button"
              className={`store-detail-hero__circle-btn store-detail-hero__circle-btn--fav ${isFavorite ? 'store-detail-hero__circle-btn--fav-on' : ''}`}
              onClick={onToggleFavorite}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorita'}
              aria-pressed={isFavorite}
            >
              <HeartIcon filled={isFavorite} />
            </button>
          </div>
        </header>

        <div className="store-detail-body">
          <h1 className="store-detail-title">{store.name}</h1>

          <div className="store-detail-badges">
            <span
              className={`store-detail-badge store-detail-badge--status ${isOpenNow ? 'store-detail-badge--open' : 'store-detail-badge--closed'}`}
            >
              {isOpenNow ? 'Abierta ahora' : 'Cerrada ahora'}
            </span>
            <span className="store-detail-badge store-detail-badge--muted">{typeLabel}</span>
            <span className="store-detail-badge store-detail-badge--muted">{store.note}</span>
          </div>

          <div className="store-detail-actions">
            <button
              type="button"
              className="store-detail-action store-detail-action--maps"
              onClick={() => openGoogleMapsQuery(fullAddress)}
            >
              <span className="store-detail-action__icon store-detail-action__icon--pin" aria-hidden>
                📍
              </span>
              Cómo llegar
            </button>
            <button type="button" className="store-detail-action store-detail-action--share" onClick={handleShare}>
              <span className="store-detail-action__icon store-detail-action__icon--share" aria-hidden>
                ↗
              </span>
              Compartir
            </button>
          </div>

          <button
            type="button"
            className="store-detail-map"
            onClick={() => openGoogleMapsQuery(fullAddress)}
            aria-label={`Abrir mapa: ${fullAddress}`}
          >
            <span className="store-detail-map__grid" aria-hidden />
            <span className="store-detail-map__pin" aria-hidden>
              <svg className="store-detail-map__pin-svg" viewBox="0 0 24 24" width="44" height="44">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </span>
            <span className="store-detail-map__cta">Abrir en Maps</span>
          </button>

          <div className="store-detail-address-block">
            <p className="store-detail-address">
              <span className="store-detail-address__pin" aria-hidden>
                📍
              </span>
              {fullAddress}
            </p>
            {distanceKm != null && (
              <p className="store-detail-distance">{formatDistanceEs(distanceKm)} desde tu ubicación</p>
            )}
          </div>

          <section className="store-detail-section" aria-labelledby="store-hours-heading">
            <h2 id="store-hours-heading" className="store-detail-section__title">
              Horarios
            </h2>
            <ul className="store-detail-hours">
              {hoursRows.map((row) => (
                <li
                  key={row.key}
                  className={`store-detail-hours__row ${row.isToday ? 'store-detail-hours__row--today' : ''}`}
                >
                  <span className="store-detail-hours__day">{row.dayLabel}</span>
                  <span
                    className={`store-detail-hours__time ${row.closed ? 'store-detail-hours__time--closed' : ''} ${row.isToday && !row.closed ? 'store-detail-hours__time--today-open' : ''} ${row.isToday && row.closed ? 'store-detail-hours__time--today-closed' : ''}`}
                  >
                    {row.closed ? 'Cerrado' : row.rangeText}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="store-detail-section" aria-labelledby="store-reviews-heading">
            <h2 id="store-reviews-heading" className="store-detail-section__title">
              Reseñas
            </h2>
            <ul className="store-detail-reviews">
              {mergedReviews.map((r) => (
                <li key={r.id} className="store-detail-review">
                  <div className="store-detail-review__head">
                    <span className="store-detail-review__author">{r.author}</span>
                    <StarsDisplay value={r.stars} />
                  </div>
                  <p className="store-detail-review__text">{r.text}</p>
                  <p className="store-detail-review__when">{formatRelativeTimeEs(r.createdAt)}</p>
                </li>
              ))}
            </ul>

            {!showReviewForm ? (
              <button
                type="button"
                className="store-detail-review-add"
                onClick={() => setShowReviewForm(true)}
              >
                + Escribir una reseña
              </button>
            ) : (
              <div className="store-detail-review-form">
                <label className="store-detail-review-form__label" htmlFor="store-review-text">
                  Tu reseña
                </label>
                <textarea
                  id="store-review-text"
                  className="store-detail-review-form__textarea"
                  rows={4}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Contá tu experiencia con esta tienda…"
                />
                <StarsInput value={formStars} onChange={setFormStars} />
                <div className="store-detail-review-form__actions">
                  <button type="button" className="btn btn--ghost" onClick={() => setShowReviewForm(false)}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={submitReview}
                    disabled={!formText.trim()}
                  >
                    Publicar
                  </button>
                </div>
                <p className="store-detail-review-form__hint">Se publicará como «{reviewAuthorName}».</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
