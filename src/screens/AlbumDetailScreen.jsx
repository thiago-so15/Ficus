import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { getNumbersForAlbum } from '../data/albumsCatalog'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { StickerSquare } from '../components/StickerSquare'
import { countAlbumStats, getStickerState } from '../utils/albumStats'

const SCAN_PANEL_MS = 300

/** @typedef {'closed' | 'opening' | 'open' | 'closing'} ScanPhase */

function StickerLegend() {
  return (
    <ul className="sticker-legend sticker-legend--detail" aria-label="Leyenda de estados">
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

/**
 * @param {string} s
 * @returns {number | null | typeof NaN} null vacío, NaN inválido
 */
function parseBound(s) {
  const t = s.trim()
  if (t === '') return null
  const n = Number.parseInt(t, 10)
  if (Number.isNaN(n)) return Number.NaN
  return n
}

/**
 * @param {import('../data/albumsCatalog').AlbumDefinition} album
 * @param {Record<string, string>} stickerMap
 * @param {number} from
 * @param {number} to
 */
function countMissingInRange(album, stickerMap, from, to) {
  let c = 0
  for (const n of getNumbersForAlbum(album)) {
    if (n >= from && n <= to && getStickerState(stickerMap, n) === 'missing') c += 1
  }
  return c
}

/**
 * @param {{
 *   album: import('../data/albumsCatalog').AlbumDefinition
 *   stickerMap: Record<string, string>
 *   onBack: () => void
 *   onStickerChange: (num: number, state: import('../components/StickerSquare').StickerState) => void
 *   onMarkRangeMissingAsOwned: (from: number, to: number) => number
 * }} props
 */
export function AlbumDetailScreen({ album, stickerMap, onBack, onStickerChange, onMarkRangeMissingAsOwned }) {
  const reducedMotion = usePrefersReducedMotion()
  const panelMs = reducedMotion ? 0 : SCAN_PANEL_MS

  const [scanPhase, setScanPhase] = useState(/** @type {ScanPhase} */ ('closed'))
  const [fromStr, setFromStr] = useState('')
  const [toStr, setToStr] = useState('')
  const [scanToast, setScanToast] = useState(/** @type {string | null} */ (null))

  const stats = useMemo(() => countAlbumStats(album, stickerMap), [album, stickerMap])

  const sections = useMemo(() => {
    return album.sections.map((sec) => ({
      ...sec,
      numbers: Array.from({ length: sec.to - sec.from + 1 }, (_, i) => sec.from + i),
    }))
  }, [album])

  const validation = useMemo(() => {
    const desde = parseBound(fromStr)
    const hasta = parseBound(toStr)
    const max = album.totalStickers

    if (desde === null || hasta === null) {
      return { ok: false, error: '', preview: null }
    }
    if (Number.isNaN(desde) || Number.isNaN(hasta)) {
      return { ok: false, error: 'Ingresá números válidos', preview: null }
    }
    if (desde < 1 || hasta < 1 || desde > max || hasta > max) {
      return { ok: false, error: `Los números deben estar entre 1 y ${max}`, preview: null }
    }
    if (desde > hasta) {
      return { ok: false, error: '«Desde» no puede ser mayor que «Hasta»', preview: null }
    }
    const nMissing = countMissingInRange(album, stickerMap, desde, hasta)
    return { ok: true, error: '', preview: nMissing }
  }, [fromStr, toStr, album, stickerMap])

  useLayoutEffect(() => {
    if (scanPhase !== 'opening') return undefined
    if (panelMs === 0) {
      const id = window.setTimeout(() => setScanPhase('open'), 0)
      return () => clearTimeout(id)
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setScanPhase('open'))
    })
    return () => cancelAnimationFrame(id)
  }, [scanPhase, panelMs])

  useEffect(() => {
    if (scanPhase !== 'closing') return undefined
    if (panelMs === 0) {
      const id = window.setTimeout(() => setScanPhase('closed'), 0)
      return () => clearTimeout(id)
    }
    const t = window.setTimeout(() => setScanPhase('closed'), panelMs)
    return () => clearTimeout(t)
  }, [scanPhase, panelMs])

  useEffect(() => {
    if (!scanToast) return undefined
    const t = window.setTimeout(() => setScanToast(null), 2000)
    return () => clearTimeout(t)
  }, [scanToast])

  const openScan = () => {
    setFromStr('')
    setToStr('')
    if (reducedMotion || panelMs === 0) {
      setScanPhase('open')
      return
    }
    setScanPhase('opening')
  }

  const closeScan = () => {
    if (scanPhase === 'closed') return
    if (reducedMotion || panelMs === 0) {
      setScanPhase('closed')
      return
    }
    setScanPhase('closing')
  }

  const confirmScan = () => {
    if (!validation.ok) return
    const desde = /** @type {number} */ (parseBound(fromStr))
    const hasta = /** @type {number} */ (parseBound(toStr))
    const changed = onMarkRangeMissingAsOwned(desde, hasta)
    closeScan()
    if (changed > 0) {
      setScanToast(changed === 1 ? '1 figurita marcada' : `${changed} figuritas marcadas`)
    }
  }

  const showScanOverlay = scanPhase !== 'closed'
  const scanModalVisible = scanPhase === 'open' || scanPhase === 'closing'

  return (
    <div className="screen screen--detail fade-in detail-screen">
      {scanToast && (
        <div className="detail-scan-toast" role="status" aria-live="polite">
          {scanToast}
        </div>
      )}

      <header className="detail-header">
        <button type="button" className="btn btn--ghost btn--back" onClick={onBack}>
          ← Volver
        </button>
        <div className="detail-header__text">
          <h1 className="detail-title">{album.name}</h1>
          <p className="detail-sub">{album.publisher}</p>
        </div>
      </header>

      <section className="stats-grid stats-grid--3" aria-label="Estadísticas del álbum">
        <div className="stat-cell">
          <span className="stat-cell__value stat-cell__value--green">{stats.owned}</span>
          <span className="stat-cell__label">Conseguidas</span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell__value">{stats.missing}</span>
          <span className="stat-cell__label">Faltan</span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell__value">{stats.pct}%</span>
          <span className="stat-cell__label">Completado</span>
        </div>
      </section>

      <StickerLegend />

      <div className="sticker-sections">
        {sections.map((sec) => (
          <section key={sec.name} className="sticker-section">
            <h2 className="sticker-section__title">
              {sec.name}{' '}
              <span className="sticker-section__range">
                ({sec.from}–{sec.to})
              </span>
            </h2>
            <div className="sticker-grid">
              {sec.numbers.map((num) => {
                const state = getStickerState(stickerMap, num)
                return (
                  <StickerSquare
                    key={num}
                    number={num}
                    state={state}
                    onToggle={(next) => onStickerChange(num, next)}
                  />
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="detail-scan-fab-wrap" inert={showScanOverlay ? true : undefined}>
        <button type="button" className="detail-scan-fab" onClick={openScan} aria-label="Marcar rango de figuritas">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              fill="currentColor"
              d="M13 2L3 14h7l-1 8 11-12h-7l1-8z"
            />
          </svg>
        </button>
      </div>

      {showScanOverlay && (
        <div
          className={[
            'detail-scan-modal',
            scanModalVisible && 'detail-scan-modal--visible',
            scanPhase === 'closing' && 'detail-scan-modal--exit',
            scanPhase === 'open' && 'transition-will-change',
          ]
            .filter(Boolean)
            .join(' ')}
          role="presentation"
        >
          <button type="button" className="detail-scan-modal__backdrop" aria-label="Cerrar" onClick={closeScan} />
          <div
            className="detail-scan-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-scan-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-scan-panel__handle" aria-hidden />
            <h2 id="detail-scan-title" className="detail-scan-panel__title">
              Marcar rango
            </h2>
            <p className="detail-scan-panel__subtitle">
              Todas las figuritas del rango quedarán marcadas como conseguidas
            </p>
            <div className="detail-scan-fields">
              <label className="detail-scan-field">
                <span className="detail-scan-field__label">Desde</span>
                <input
                  className="detail-scan-field__input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  value={fromStr}
                  onChange={(e) => setFromStr(e.target.value.replace(/\D/g, ''))}
                  placeholder="1"
                />
              </label>
              <label className="detail-scan-field">
                <span className="detail-scan-field__label">Hasta</span>
                <input
                  className="detail-scan-field__input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  value={toStr}
                  onChange={(e) => setToStr(e.target.value.replace(/\D/g, ''))}
                  placeholder={String(album.totalStickers)}
                />
              </label>
            </div>
            {validation.ok && validation.preview !== null && (
              <p className="detail-scan-hint detail-scan-hint--ok">
                {validation.preview === 0
                  ? 'No hay figuritas faltantes en este rango'
                  : `Se marcarán ${validation.preview} ${validation.preview === 1 ? 'figurita' : 'figuritas'}`}
              </p>
            )}
            {!validation.ok && validation.error ? (
              <p className="detail-scan-hint detail-scan-hint--error">{validation.error}</p>
            ) : null}
            <button
              type="button"
              className="btn btn--primary btn--block detail-scan-submit"
              disabled={!validation.ok}
              onClick={confirmScan}
            >
              Marcar como conseguidas
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
