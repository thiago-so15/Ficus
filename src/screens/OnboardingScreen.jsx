import { useState } from 'react'

/** @typedef {'missing' | 'owned' | 'duplicate'} DemoState */

/** 4×4 demo: mezcla de estados */
const SLIDE1_GRID = /** @type {const} */ ([
  ['owned', 'missing', 'duplicate', 'owned'],
  ['duplicate', 'owned', 'missing', 'duplicate'],
  ['missing', 'duplicate', 'owned', 'missing'],
  ['owned', 'owned', 'missing', 'duplicate'],
])

const SLIDE2_GRID = /** @type {const} */ ([
  ['owned', 'owned', 'missing', 'duplicate', 'owned'],
  ['missing', 'duplicate', 'owned', 'missing', 'duplicate'],
  ['owned', 'missing', 'owned', 'owned', 'missing'],
])

function FicusLogoMark() {
  return (
    <div className="onboarding-logo" aria-hidden>
      <svg className="onboarding-logo__svg" viewBox="0 0 72 72" width="72" height="72">
        <rect width="72" height="72" rx="16" fill="#1D9E75" />
        <rect x="18" y="20" width="10" height="32" rx="2" fill="#fff" opacity="0.95" />
        <rect x="31" y="14" width="10" height="38" rx="2" fill="#fff" opacity="0.95" />
        <rect x="44" y="24" width="10" height="28" rx="2" fill="#fff" opacity="0.95" />
      </svg>
    </div>
  )
}

/**
 * @param {{ state: DemoState }} props
 */
function DemoSticker({ state }) {
  return (
    <span className={`onboarding-demo-cell onboarding-demo-cell--${state}`}>
      {(state === 'owned' || state === 'duplicate') && <span className="onboarding-demo-cell__dot" />}
    </span>
  )
}

function StickerLegend({ className = '' }) {
  return (
    <ul className={`sticker-legend ${className}`.trim()}>
      <li className="sticker-legend__item">
        <span className="sticker-legend__swatch sticker-legend__swatch--owned" />
        Conseguida
      </li>
      <li className="sticker-legend__item">
        <span className="sticker-legend__swatch sticker-legend__swatch--duplicate" />
        Duplicada
      </li>
      <li className="sticker-legend__item">
        <span className="sticker-legend__swatch sticker-legend__swatch--missing" />
        Faltante
      </li>
    </ul>
  )
}

function SlideStoresIllustration() {
  const cards = [
    { name: 'Kiosco Rivadavia', address: 'Av. Rivadavia 4521', open: true },
    { name: 'Librería Central', address: 'Córdoba 1201', open: false },
    { name: 'Mundo Joven', address: 'Bv. Oroño 2100', open: true },
  ]
  return (
    <div className="onboarding-stores-illus" aria-hidden>
      {cards.map((c) => (
        <div key={c.name} className="onboarding-stores-illus__card">
          <div className="onboarding-stores-illus__row">
            <span className="onboarding-stores-illus__name">{c.name}</span>
            <span className={`onboarding-stores-illus__badge ${c.open ? 'onboarding-stores-illus__badge--open' : 'onboarding-stores-illus__badge--closed'}`}>
              {c.open ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
          <span className="onboarding-stores-illus__addr">{c.address}</span>
        </div>
      ))}
    </div>
  )
}

function SlideAlbumsIllustration() {
  const rows = [
    { name: 'Copa América 2024', pct: 62 },
    { name: 'Demon Slayer', pct: 38 },
    { name: 'Harry Potter', pct: 91 },
  ]
  return (
    <div className="onboarding-albums-illus" aria-hidden>
      {rows.map((r) => (
        <div key={r.name} className="onboarding-albums-illus__row">
          <div className="onboarding-albums-illus__top">
            <span className="onboarding-albums-illus__name">{r.name}</span>
            <span className="onboarding-albums-illus__pct">{r.pct}%</span>
          </div>
          <div className="onboarding-albums-illus__track">
            <div className="onboarding-albums-illus__fill" style={{ width: `${r.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * @param {{ onComplete: () => void }} props
 */
export function OnboardingScreen({ onComplete }) {
  const [slide, setSlide] = useState(0)

  return (
    <div className="onboarding">
      {slide > 0 && slide < 3 && (
        <button type="button" className="onboarding-skip" onClick={() => setSlide(3)}>
          Saltar
        </button>
      )}

      <div className="onboarding-slides">
        {slide === 0 && (
          <div className="onboarding-slide fade-in">
            <FicusLogoMark />
            <h1 className="onboarding-brand">Ficus</h1>
            <p className="onboarding-slogan">Tu colección, siempre al día</p>
            <div className="onboarding-grid onboarding-grid--4" aria-hidden>
              {SLIDE1_GRID.flatMap((row, i) =>
                row.map((cell, j) => <DemoSticker key={`s1-${i}-${j}`} state={cell} />),
              )}
            </div>
            <button type="button" className="btn btn--primary onboarding-cta" onClick={() => setSlide(1)}>
              Empezar
            </button>
          </div>
        )}

        {slide === 1 && (
          <div className="onboarding-slide fade-in">
            <h2 className="onboarding-title">Seguí tus figuritas fácilmente</h2>
            <p className="onboarding-desc">
              Tocá cada casillero para marcar si te falta, si la tenés o si tenés duplicadas. Todo queda guardado en tu
              dispositivo.
            </p>
            <div className="onboarding-grid onboarding-grid--5" aria-hidden>
              {SLIDE2_GRID.flatMap((row, i) =>
                row.map((cell, j) => <DemoSticker key={`s2-${i}-${j}`} state={cell} />),
              )}
            </div>
            <StickerLegend />
            <div className="onboarding-nav-btns">
              <button type="button" className="btn btn--secondary" onClick={() => setSlide(0)}>
                Atrás
              </button>
              <button type="button" className="btn btn--primary" onClick={() => setSlide(2)}>
                Siguiente
              </button>
            </div>
          </div>
        )}

        {slide === 2 && (
          <div className="onboarding-slide fade-in">
            <h2 className="onboarding-title">Encontrá tiendas cerca tuyo</h2>
            <p className="onboarding-desc">
              Explorá kioscos, librerías y jugueterías con dirección, tipo y si están abiertos ahora.
            </p>
            <SlideStoresIllustration />
            <div className="onboarding-nav-btns">
              <button type="button" className="btn btn--secondary" onClick={() => setSlide(1)}>
                Atrás
              </button>
              <button type="button" className="btn btn--primary" onClick={() => setSlide(3)}>
                Siguiente
              </button>
            </div>
          </div>
        )}

        {slide === 3 && (
          <div className="onboarding-slide fade-in">
            <h2 className="onboarding-title">Seguí tu progreso en cada álbum</h2>
            <p className="onboarding-desc">
              Mirá cuántas figuritas llevás, el porcentaje completado y agregá nuevos álbumes cuando quieras.
            </p>
            <SlideAlbumsIllustration />
            <div className="onboarding-nav-btns onboarding-nav-btns--stack">
              <button type="button" className="btn btn--primary onboarding-cta" onClick={onComplete}>
                Empezar a coleccionar
              </button>
              <button type="button" className="btn btn--secondary" onClick={() => setSlide(2)}>
                Atrás
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="onboarding-dots" role="tablist" aria-label="Paso del tutorial">
        {Array.from({ length: 4 }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={slide === i}
            aria-label={`Paso ${i + 1} de 4`}
            className={`onboarding-dot ${slide === i ? 'onboarding-dot--active' : ''}`}
            onClick={() => setSlide(i)}
          />
        ))}
      </div>
    </div>
  )
}
