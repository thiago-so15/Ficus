import { useMemo } from 'react'
import { StickerSquare } from '../components/StickerSquare'
import { countAlbumStats, getStickerState } from '../utils/albumStats'

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
 * @param {{
 *   album: import('../data/albumsCatalog').AlbumDefinition
 *   stickerMap: Record<string, string>
 *   onBack: () => void
 *   onStickerChange: (num: number, state: import('../components/StickerSquare').StickerState) => void
 * }} props
 */
export function AlbumDetailScreen({ album, stickerMap, onBack, onStickerChange }) {
  const stats = useMemo(() => countAlbumStats(album, stickerMap), [album, stickerMap])

  const sections = useMemo(() => {
    return album.sections.map((sec) => ({
      ...sec,
      numbers: Array.from({ length: sec.to - sec.from + 1 }, (_, i) => sec.from + i),
    }))
  }, [album])

  return (
    <div className="screen screen--detail fade-in">
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
    </div>
  )
}
