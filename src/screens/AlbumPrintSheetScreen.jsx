import { useMemo, useState } from 'react'
import { STORAGE_STICKER_STATES } from '../data/storageKeys'
import { countAlbumStats, getStickerState } from '../utils/albumStats'

/**
 * @param {{
 *   album: import('../data/albumsCatalog').AlbumDefinition
 *   stickerMap: Record<string, string>
 * }} props
 */
export function AlbumPrintSheetScreen({ album, stickerMap }) {
  const [sheetMap, setSheetMap] = useState(stickerMap || {})

  const stats = useMemo(() => countAlbumStats(album, sheetMap), [album, sheetMap])

  const toggleSticker = (num) => {
    setSheetMap((prev) => {
      const nextAlbumMap = { ...(prev || {}) }
      const key = String(num)
      const current = getStickerState(nextAlbumMap, num)
      if (current === 'missing') nextAlbumMap[key] = 'owned'
      else delete nextAlbumMap[key]

      let root = {}
      try {
        const raw = localStorage.getItem(STORAGE_STICKER_STATES)
        const parsed = raw ? JSON.parse(raw) : {}
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) root = parsed
      } catch {
        root = {}
      }
      const nextRoot = { ...root, [album.id]: nextAlbumMap }
      localStorage.setItem(STORAGE_STICKER_STATES, JSON.stringify(nextRoot))
      return nextAlbumMap
    })
  }

  return (
    <div className="print-sheet">
      <header className="print-sheet__header">
        <div className="print-sheet__brand">
          <span className="print-sheet__logo" aria-hidden>
            F
          </span>
          <div>
            <h1 className="print-sheet__title">{album.name}</h1>
            <p className="print-sheet__meta">
              {album.publisher} · {album.totalStickers} figuritas · Generado con Ficus
            </p>
          </div>
        </div>
        <button type="button" className="btn btn--primary print-sheet__print-btn no-print" onClick={() => window.print()}>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
            <path
              fill="currentColor"
              d="M7 3h10v4H7V3zm10 14H7v4h10v-4zm2-9H5a2 2 0 0 0-2 2v6h4v-3h10v3h4v-6a2 2 0 0 0-2-2z"
            />
          </svg>
          Imprimir hoja
        </button>
      </header>

      <section className="print-stats" aria-label="Estadísticas de la hoja">
        <div className="print-stats__cell">
          <strong>{stats.owned}</strong>
          <span>Conseguidas</span>
        </div>
        <div className="print-stats__cell">
          <strong>{stats.missing}</strong>
          <span>Faltan</span>
        </div>
        <div className="print-stats__cell">
          <strong>{stats.pct}%</strong>
          <span>Completado</span>
        </div>
      </section>

      <main className="print-sections">
        {album.sections.map((sec) => {
          const numbers = Array.from({ length: sec.to - sec.from + 1 }, (_, i) => sec.from + i)
          return (
            <section key={sec.name} className="print-section">
              <h2 className="print-section__title">
                {sec.name} <span>({sec.from}–{sec.to})</span>
              </h2>
              <div className="print-grid">
                {numbers.map((num) => {
                  const checked = getStickerState(sheetMap, num) !== 'missing'
                  return (
                    <button
                      key={num}
                      type="button"
                      className={`print-item ${checked ? 'print-item--checked' : ''}`}
                      onClick={() => toggleSticker(num)}
                    >
                      <span className={`print-item__box ${checked ? 'print-item__box--checked' : ''}`} aria-hidden>
                        {checked ? (
                          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
                            <path fill="currentColor" d="M6.4 11.4L2.7 7.7l1.2-1.2 2.5 2.5 5.6-5.6 1.2 1.2z" />
                          </svg>
                        ) : null}
                      </span>
                      <span className="print-item__num">{num}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </main>

      <footer className="print-sheet__footer no-print">Tocá un número para marcarlo como conseguido.</footer>
    </div>
  )
}
