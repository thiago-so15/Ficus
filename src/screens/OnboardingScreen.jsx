import { useEffect, useLayoutEffect, useState } from 'react'
import { formatOnboardingDotAria, getOnboardingCopy } from '../data/onboardingCopy'

/** @typedef {import('../data/userPreferences').UserPreferences} UserPreferences */

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

const LANG_NATIVE = /** @type {const} */ ({
  es: 'Español',
  en: 'English',
  pt: 'Português',
})

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

/**
 * @param {{ owned: string, duplicate: string, missing: string, className?: string }} props
 */
function StickerLegend({ owned, duplicate, missing, className = '' }) {
  return (
    <ul className={`sticker-legend ${className}`.trim()}>
      <li className="sticker-legend__item">
        <span className="sticker-legend__swatch sticker-legend__swatch--owned" />
        {owned}
      </li>
      <li className="sticker-legend__item">
        <span className="sticker-legend__swatch sticker-legend__swatch--duplicate" />
        {duplicate}
      </li>
      <li className="sticker-legend__item">
        <span className="sticker-legend__swatch sticker-legend__swatch--missing" />
        {missing}
      </li>
    </ul>
  )
}

/**
 * @param {{ openLabel: string, closedLabel: string }} props
 */
function SlideStoresIllustration({ openLabel, closedLabel }) {
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
              {c.open ? openLabel : closedLabel}
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
 *   userPrefs: UserPreferences
 *   onSaveUserPrefs: (next: UserPreferences) => void
 *   onComplete: () => void
 *   transitionMs: number
 *   reducedMotion: boolean
 * }} props
 */
export function OnboardingScreen({ userPrefs, onSaveUserPrefs, onComplete, transitionMs, reducedMotion }) {
  const [phase, setPhase] = useState(/** @type { 'language' | 'slides' } */ ('language'))
  const [slide, setSlide] = useState(0)
  const [navLock, setNavLock] = useState(false)
  /** @type {[{ from: number, to: number, dir: 'next' | 'back', step: 'prepare' | 'run' } | null, function]} */
  const [slideTrans, setSlideTrans] = useState(null)

  const t = getOnboardingCopy(userPrefs.locale)

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
   * @param {'es' | 'en' | 'pt'} code
   */
  const selectLanguage = (code) => {
    onSaveUserPrefs({ ...userPrefs, locale: code })
    setPhase('slides')
  }

  /**
   * @param {number} index
   */
  const renderSlideBody = (index) => {
    if (index === 0) {
      return (
        <div className="onboarding-slide">
          <FicusLogoMark />
          <h1 className="onboarding-brand">Ficus</h1>
          <p className="onboarding-slogan">{t.slide0Slogan}</p>
          <div className="onboarding-grid onboarding-grid--4" aria-hidden>
            {SLIDE1_GRID.flatMap((row, i) => row.map((cell, j) => <DemoSticker key={`s1-${i}-${j}`} state={cell} />))}
          </div>
          <button type="button" className="btn btn--primary onboarding-cta" onClick={() => goNextSlide()}>
            {t.slide0Start}
          </button>
        </div>
      )
    }
    if (index === 1) {
      return (
        <div className="onboarding-slide">
          <h2 className="onboarding-title">{t.slide1Title}</h2>
          <p className="onboarding-desc">{t.slide1Desc}</p>
          <div className="onboarding-grid onboarding-grid--5" aria-hidden>
            {SLIDE2_GRID.flatMap((row, i) => row.map((cell, j) => <DemoSticker key={`s2-${i}-${j}`} state={cell} />))}
          </div>
          <StickerLegend owned={t.legendOwned} duplicate={t.legendDuplicate} missing={t.legendMissing} />
          <div className="onboarding-nav-btns">
            <button type="button" className="btn btn--secondary" onClick={() => goPrevSlide()}>
              {t.back}
            </button>
            <button type="button" className="btn btn--primary" onClick={() => goNextSlide()}>
              {t.next}
            </button>
          </div>
        </div>
      )
    }
    if (index === 2) {
      return (
        <div className="onboarding-slide">
          <h2 className="onboarding-title">{t.slide2Title}</h2>
          <p className="onboarding-desc">{t.slide2Desc}</p>
          <SlideStoresIllustration openLabel={t.storeOpen} closedLabel={t.storeClosed} />
          <div className="onboarding-nav-btns">
            <button type="button" className="btn btn--secondary" onClick={() => goPrevSlide()}>
              {t.back}
            </button>
            <button type="button" className="btn btn--primary" onClick={() => goNextSlide()}>
              {t.next}
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="onboarding-slide">
        <h2 className="onboarding-title">{t.slide3Title}</h2>
        <p className="onboarding-desc">{t.slide3Desc}</p>
        <SlideAlbumsIllustration />
        <div className="onboarding-nav-btns onboarding-nav-btns--stack">
          <button type="button" className="btn btn--primary onboarding-cta" onClick={onComplete}>
            {t.slide3Cta}
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => goPrevSlide()}>
            {t.back}
          </button>
        </div>
      </div>
    )
  }

  const transClass = slideTrans
    ? `onboarding-slide-pair onboarding-slide-pair--${slideTrans.dir} onboarding-slide-pair--${slideTrans.step}`
    : ''

  if (phase === 'language') {
    return (
      <div className="onboarding onboarding--language">
        <div className="onboarding-slide onboarding-slide--language">
          <FicusLogoMark />
          <h1 className="onboarding-title onboarding-title--language">{t.pickTitle}</h1>
          <p className="onboarding-desc onboarding-desc--language">{t.pickSubtitle}</p>
          <ul className="onboarding-lang-list" role="list">
            {(/** @type {const} */ (['es', 'en', 'pt'])).map((code) => (
              <li key={code}>
                <button
                  type="button"
                  className="onboarding-lang-item"
                  onClick={() => selectLanguage(code)}
                >
                  {LANG_NATIVE[code]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

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
          {t.skip}
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

      <div className="onboarding-dots" role="tablist" aria-label={t.dotsListLabel}>
        {Array.from({ length: 4 }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={slide === i}
            aria-label={formatOnboardingDotAria(t.dotAria, i + 1, 4)}
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
