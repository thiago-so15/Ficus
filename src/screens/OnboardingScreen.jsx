import { useEffect, useLayoutEffect, useState } from 'react'

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
 * @param {{
 *   onComplete: () => void
 *   transitionMs: number
 *   reducedMotion: boolean
 * }} props
 */
export function OnboardingScreen({ onComplete, transitionMs, reducedMotion }) {
  const [slide, setSlide] = useState(0)
  const [navLock, setNavLock] = useState(false)
  /** @type {[{ from: number, to: number, dir: 'next' | 'back', step: 'prepare' | 'run' } | null, function]} */
  const [slideTrans, setSlideTrans] = useState(null)

  const tDur = reducedMotion ? 0 : transitionMs

  useLayoutEffect(() => {
    if (!slideTrans || slideTrans.step !== 'prepare') return undefined
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSlideTrans((s) => (s && s.step === 'prepare' ? { ...s, step: 'run' } : s)))
    })
    return () => cancelAnimationFrame(id)
  }, [slideTrans])

  useEffect(() => {
    if (!slideTrans || slideTrans.step !== 'run') return undefined
    if (tDur === 0) {
      const to = slideTrans.to
      const id = window.setTimeout(() => {
        setSlide(to)
        setSlideTrans(null)
        setNavLock(false)
      }, 0)
      return () => clearTimeout(id)
    }
    const timer = window.setTimeout(() => {
      setSlide(slideTrans.to)
      setSlideTrans(null)
      setNavLock(false)
    }, tDur)
    return () => clearTimeout(timer)
  }, [slideTrans, tDur])

  const goTo = (to, dir) => {
    if (navLock || slide === to) return
    if (to < 0 || to > 3) return
    if (reducedMotion || tDur === 0) {
      setSlide(to)
      return
    }
    setNavLock(true)
    setSlideTrans({ from: slide, to, dir, step: 'prepare' })
  }

  const goNextSlide = () => goTo(slide + 1, 'next')
  const goPrevSlide = () => goTo(slide - 1, 'back')

  /**
   * @param {number} index
   */
  const renderSlideBody = (index) => {
    if (index === 0) {
      return (
        <div className="onboarding-slide">
          <FicusLogoMark />
          <h1 className="onboarding-brand">Ficus</h1>
          <p className="onboarding-slogan">Tu colección, siempre al día</p>
          <div className="onboarding-grid onboarding-grid--4" aria-hidden>
            {SLIDE1_GRID.flatMap((row, i) => row.map((cell, j) => <DemoSticker key={`s1-${i}-${j}`} state={cell} />))}
          </div>
          <button type="button" className="btn btn--primary onboarding-cta" onClick={() => goNextSlide()}>
            Empezar
          </button>
        </div>
      )
    }
    if (index === 1) {
      return (
        <div className="onboarding-slide">
          <h2 className="onboarding-title">Seguí tus figuritas fácilmente</h2>
          <p className="onboarding-desc">
            Tocá cada casillero para marcar si te falta, si la tenés o si tenés duplicadas. Todo queda guardado en tu
            dispositivo.
          </p>
          <div className="onboarding-grid onboarding-grid--5" aria-hidden>
            {SLIDE2_GRID.flatMap((row, i) => row.map((cell, j) => <DemoSticker key={`s2-${i}-${j}`} state={cell} />))}
          </div>
          <StickerLegend />
          <div className="onboarding-nav-btns">
            <button type="button" className="btn btn--secondary" onClick={() => goPrevSlide()}>
              Atrás
            </button>
            <button type="button" className="btn btn--primary" onClick={() => goNextSlide()}>
              Siguiente
            </button>
          </div>
        </div>
      )
    }
    if (index === 2) {
      return (
        <div className="onboarding-slide">
          <h2 className="onboarding-title">Encontrá tiendas cerca tuyo</h2>
          <p className="onboarding-desc">
            Explorá kioscos, librerías y jugueterías con dirección, tipo y si están abiertos ahora.
          </p>
          <SlideStoresIllustration />
          <div className="onboarding-nav-btns">
            <button type="button" className="btn btn--secondary" onClick={() => goPrevSlide()}>
              Atrás
            </button>
            <button type="button" className="btn btn--primary" onClick={() => goNextSlide()}>
              Siguiente
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="onboarding-slide">
        <h2 className="onboarding-title">Seguí tu progreso en cada álbum</h2>
        <p className="onboarding-desc">
          Mirá cuántas figuritas llevás, el porcentaje completado y agregá nuevos álbumes cuando quieras.
        </p>
        <SlideAlbumsIllustration />
        <div className="onboarding-nav-btns onboarding-nav-btns--stack">
          <button type="button" className="btn btn--primary onboarding-cta" onClick={onComplete}>
            Empezar a coleccionar
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => goPrevSlide()}>
            Atrás
          </button>
        </div>
      </div>
    )
  }

  const transClass = slideTrans
    ? `onboarding-slide-pair onboarding-slide-pair--${slideTrans.dir} onboarding-slide-pair--${slideTrans.step}`
    : ''

  return (
    <div className="onboarding">
      {slide > 0 && slide < 3 && (
        <button
          type="button"
          className="onboarding-skip"
          onClick={() => {
            if (navLock) return
            if (reducedMotion || tDur === 0) setSlide(3)
            else goTo(3, 'next')
          }}
          disabled={navLock}
        >
          Saltar
        </button>
      )}

      <div className="onboarding-slides">
        {slideTrans ? (
          <div className={['onboarding-slide-viewport', transClass, slideTrans.step === 'run' && 'transition-will-change'].filter(Boolean).join(' ')}>
            <div className="onboarding-slide-panel onboarding-slide-panel--out" inert="" aria-hidden>
              {renderSlideBody(slideTrans.from)}
            </div>
            <div className="onboarding-slide-panel onboarding-slide-panel--in">{renderSlideBody(slideTrans.to)}</div>
          </div>
        ) : (
          <div className="onboarding-slide-viewport onboarding-slide-viewport--single">{renderSlideBody(slide)}</div>
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
            disabled={navLock}
            className={`onboarding-dot ${slide === i ? 'onboarding-dot--active' : ''}`}
            onClick={() => {
              if (navLock) return
              if (i === slide) return
              if (reducedMotion || tDur === 0) {
                setSlide(i)
                return
              }
              goTo(i, i > slide ? 'next' : 'back')
            }}
          />
        ))}
      </div>
    </div>
  )
}
