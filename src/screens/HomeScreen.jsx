import { useEffect, useRef, useState } from 'react'
import { getAlbumById } from '../data/albumsCatalog'
import { countAlbumStats } from '../utils/albumStats'
import { ProgressBar } from '../components/ProgressBar'

/**
 * @param {{
 *   userAlbumIds: string[]
 *   stickerStates: Record<string, Record<string, string>>
 *   onOpenAlbum: (id: string) => void
 *   onAddAlbum: () => void
 *   onDeleteAlbum: (id: string) => void
 *   confirmBeforeDelete?: boolean
 * }} props
 */
export function HomeScreen({
  userAlbumIds,
  stickerStates,
  onOpenAlbum,
  onAddAlbum,
  onDeleteAlbum,
  confirmBeforeDelete = true,
}) {
  const albums = userAlbumIds.map((id) => getAlbumById(id)).filter(Boolean)

  const [ctxMenu, setCtxMenu] = useState(/** @type {{ albumId: string, x: number, y: number } | null} */ (null))
  const menuRef = useRef(/** @type {HTMLDivElement | null} */ (null))

  useEffect(() => {
    if (!ctxMenu) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setCtxMenu(null)
    }

    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(/** @type {Node} */ (e.target))) {
        setCtxMenu(null)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [ctxMenu])

  let totalAlbums = 0
  let totalFilled = 0
  let sumPct = 0
  for (const album of albums) {
    totalAlbums += 1
    const s = countAlbumStats(album, stickerStates[album.id])
    totalFilled += s.filled
    sumPct += s.pct
  }
  const avgPct = totalAlbums ? Math.round(sumPct / totalAlbums) : 0

  /**
   * @param {import('react').MouseEvent} e
   * @param {string} albumId
   */
  const handleAlbumContextMenu = (e, albumId) => {
    e.preventDefault()
    const pad = 8
    const mw = 200
    const mh = 48
    const x = Math.min(e.clientX, window.innerWidth - mw - pad)
    const y = Math.min(e.clientY, window.innerHeight - mh - pad)
    setCtxMenu({ albumId, x, y })
  }

  const handleDelete = () => {
    if (!ctxMenu) return
    if (confirmBeforeDelete) {
      const ok = window.confirm('¿Seguro que querés eliminar este álbum de tu colección?')
      if (!ok) {
        setCtxMenu(null)
        return
      }
    }
    onDeleteAlbum(ctxMenu.albumId)
    setCtxMenu(null)
  }

  return (
    <div className="screen screen--home fade-in">
      <header className="screen-header">
        <h1 className="app-title">Ficus</h1>
        <p className="app-subtitle">Tu colección de álbumes</p>
      </header>

      <section className="stats-row" aria-label="Resumen">
        <div className="stat-pill">
          <span className="stat-pill__value">{totalAlbums}</span>
          <span className="stat-pill__label">Álbumes</span>
        </div>
        <div className="stat-pill">
          <span className="stat-pill__value">{totalFilled}</span>
          <span className="stat-pill__label">Figuritas conseguidas</span>
        </div>
        <div className="stat-pill">
          <span className="stat-pill__value">{avgPct}%</span>
          <span className="stat-pill__label">Promedio</span>
        </div>
      </section>

      <div className="screen-toolbar">
        <h2 className="section-title">Mis álbumes</h2>
        <button type="button" className="btn btn--primary" onClick={onAddAlbum}>
          Agregar álbum
        </button>
      </div>

      {albums.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon" aria-hidden>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="10" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M16 18h16M16 24h12M16 30h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="empty-state__title">Todavía no tenés álbumes</p>
          <p className="empty-state__text">
            Agregá un álbum del catálogo y empezá a marcar figuritas conseguidas, faltantes y duplicadas.
          </p>
          <button type="button" className="btn btn--primary empty-state__cta" onClick={onAddAlbum}>
            Elegir mi primer álbum
          </button>
        </div>
      ) : (
        <ul className="album-list">
          {albums.map((album) => {
            const s = countAlbumStats(album, stickerStates[album.id])
            return (
              <li key={album.id}>
                <button
                  type="button"
                  className="album-card"
                  onClick={() => onOpenAlbum(album.id)}
                  onContextMenu={(e) => handleAlbumContextMenu(e, album.id)}
                >
                  <p className="album-card__name">{album.name}</p>
                  <p className="album-card__publisher">{album.publisher}</p>
                  <p className="album-card__total">{album.totalStickers} figuritas en el álbum</p>
                  <p className="album-card__progress-text">
                    {s.filled} de {album.totalStickers} conseguidas ({s.pct}%)
                  </p>
                  <ProgressBar value={s.filled} max={album.totalStickers} />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {ctxMenu && (
        <div
          ref={menuRef}
          className="context-menu"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          role="menu"
          aria-label="Acciones del álbum"
        >
          <button type="button" className="context-menu__item" role="menuitem" onClick={handleDelete}>
            Eliminar álbum
          </button>
        </div>
      )}
    </div>
  )
}
