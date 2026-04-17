import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getAlbumById } from '../data/albumsCatalog'
import { countAlbumStats, getStickerState } from '../utils/albumStats'
import { ShareOptionsSheet } from '../components/ShareOptionsSheet'
import { ProgressBar } from '../components/ProgressBar'

/**
 * @param {string} s
 */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * @param {string} name
 * @param {string} query
 */
function renderHighlightedAlbumName(name, query) {
  const q = query.trim()
  if (!q) return name
  const re = new RegExp(`(${escapeRegExp(q)})`, 'gi')
  const parts = name.split(re)
  return parts.map((part, i) => {
    if (part.toLowerCase() === q.toLowerCase()) {
      return (
        <mark key={i} className="global-search-hit">
          {part}
        </mark>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

/**
 * @param {import('../data/albumsCatalog').AlbumDefinition} album
 * @param {number} num
 */
function findSectionNameForSticker(album, num) {
  for (const sec of album.sections) {
    if (num >= sec.from && num <= sec.to) return sec.name
  }
  return null
}

/** @type {Record<'owned' | 'duplicate' | 'missing', string>} */
const STICKER_STATE_LABEL = {
  owned: 'Conseguida',
  duplicate: 'Duplicada',
  missing: 'Falta',
}

/**
 * @param {{
 *   userAlbumIds: string[]
 *   stickerStates: Record<string, Record<string, string>>
 *   onOpenAlbum: (id: string, options?: { focusSticker?: number | null }) => void
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

  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(/** @type {HTMLInputElement | null} */ (null))

  const [ctxMenu, setCtxMenu] = useState(/** @type {{ albumId: string, x: number, y: number } | null} */ (null))
  const menuRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const [deleteAlbumId, setDeleteAlbumId] = useState(/** @type {string | null} */ (null))
  const [shareToast, setShareToast] = useState(/** @type {string | null} */ (null))
  const [sharePayload, setSharePayload] = useState(/** @type {{ title: string, text: string } | null} */ (null))

  const trimmedQuery = searchQuery.trim()
  const isSearching = trimmedQuery.length > 0

  const pureDigitQuery = /^\d+$/.test(trimmedQuery)
  const stickerNumber = pureDigitQuery ? Number.parseInt(trimmedQuery, 10) : null

  const albumTextMatches = useMemo(() => {
    if (!isSearching) return []
    const q = trimmedQuery.toLowerCase()
    return albums.filter((a) => a.name.toLowerCase().includes(q) || a.publisher.toLowerCase().includes(q))
  }, [albums, isSearching, trimmedQuery])

  const stickerRows = useMemo(() => {
    if (!isSearching || stickerNumber == null || Number.isNaN(stickerNumber)) return []
    const rows = []
    for (const album of albums) {
      const sectionName = findSectionNameForSticker(album, stickerNumber)
      if (!sectionName) continue
      const state = getStickerState(stickerStates[album.id], stickerNumber)
      rows.push({ album, sectionName, state })
    }
    return rows
  }, [albums, isSearching, stickerNumber, stickerStates])

  const showAlbumSection = albumTextMatches.length > 0
  const showStickerSection = stickerNumber != null && !Number.isNaN(stickerNumber) && stickerRows.length > 0
  const searchHasNoResults = isSearching && !showAlbumSection && !showStickerSection

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

  useEffect(() => {
    if (!deleteAlbumId) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setDeleteAlbumId(null)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [deleteAlbumId])

  useEffect(() => {
    if (!shareToast) return undefined
    const t = window.setTimeout(() => setShareToast(null), 2600)
    return () => clearTimeout(t)
  }, [shareToast])

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
    const albumId = ctxMenu.albumId
    setCtxMenu(null)
    if (!confirmBeforeDelete) {
      onDeleteAlbum(albumId)
      return
    }
    setDeleteAlbumId(albumId)
  }

  const closeDeleteModal = () => setDeleteAlbumId(null)

  const confirmDeleteInModal = () => {
    if (!deleteAlbumId) return
    const id = deleteAlbumId
    setDeleteAlbumId(null)
    onDeleteAlbum(id)
  }

  const pendingDeleteAlbum = deleteAlbumId ? getAlbumById(deleteAlbumId) : null

  const openShareCollectionSheet = () => {
    if (totalAlbums === 0) return
    setSharePayload({
      title: 'Mi progreso en Ficus',
      text: [
        'Mi progreso en Ficus',
        '',
        `${totalAlbums} ${totalAlbums === 1 ? 'álbum' : 'álbumes'} en colección`,
        `${totalFilled} figuritas conseguidas`,
        `${avgPct}% de completado promedio`,
      ].join('\n'),
    })
  }

  const clearSearch = () => {
    setSearchQuery('')
    searchInputRef.current?.focus()
  }

  const deleteModal =
    deleteAlbumId &&
    createPortal(
      <div className="app-modal app-modal--visible home-delete-modal" role="presentation">
        <button type="button" className="app-modal__backdrop" aria-label="Cancelar" onClick={closeDeleteModal} />
        <div
          className="ajustes-sheet ajustes-sheet--danger app-modal__sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-delete-album-title"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 id="home-delete-album-title" className="ajustes-sheet__title">
            Eliminar álbum
          </h3>
          <p className="ajustes-sheet__body">
            {pendingDeleteAlbum
              ? `¿Seguro que querés eliminar «${pendingDeleteAlbum.name}» de tu colección?`
              : '¿Seguro que querés eliminar este álbum de tu colección?'}
          </p>
          <div className="ajustes-sheet__actions">
            <button type="button" className="btn btn--danger btn--block" onClick={confirmDeleteInModal}>
              Eliminar
            </button>
            <button type="button" className="btn btn--muted btn--block" onClick={closeDeleteModal}>
              Cancelar
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )

  return (
    <div className="screen screen--home fade-in">
      {shareToast && (
        <div className="detail-scan-toast home-share-toast" role="status" aria-live="polite">
          {shareToast}
        </div>
      )}
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

      {totalAlbums > 0 && (
        <div className="home-share-row">
          <button type="button" className="btn btn--secondary btn--share-progress" onClick={openShareCollectionSheet}>
            <svg className="btn--share-progress__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
              <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
              <path
                d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Compartir progreso
          </button>
        </div>
      )}

      <div className={`home-albums-head ${albums.length > 0 ? 'home-albums-head--with-search' : ''}`}>
        <h2 className="section-title home-albums-head__title">Mis álbumes</h2>
        {albums.length > 0 ? (
          <div className="global-search home-albums-head__search" role="search">
            <label className="global-search__label visually-hidden" htmlFor="global-album-search">
              Buscar álbumes o número de figurita
            </label>
            <span className="global-search__icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              ref={searchInputRef}
              id="global-album-search"
              type="text"
              role="searchbox"
              inputMode="search"
              enterKeyHint="search"
              className="global-search__input"
              placeholder="Buscar por álbum o número…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                className="global-search__clear"
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : null}
        <button type="button" className="btn btn--primary home-albums-head__cta" onClick={onAddAlbum}>
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
      ) : isSearching ? (
        <div
          className={[
            'global-search-results',
            showAlbumSection && showStickerSection ? 'global-search-results--two-panels' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {searchHasNoResults ? (
            <div className="global-search-empty">
              <p className="global-search-empty__title">Sin resultados para «{trimmedQuery}»</p>
              <p className="global-search-empty__hint">Probá con otro término o número.</p>
            </div>
          ) : (
            <>
              {showAlbumSection && (
                <section className="global-search-section" aria-label="Álbumes">
                  <h3 className="global-search-section__title">Álbumes</h3>
                  <ul className="global-search-list">
                    {albumTextMatches.map((album) => {
                      const s = countAlbumStats(album, stickerStates[album.id])
                      return (
                        <li key={album.id}>
                          <button
                            type="button"
                            className="global-search-album-row"
                            onClick={() => onOpenAlbum(album.id)}
                          >
                            <p className="global-search-album-row__name">{renderHighlightedAlbumName(album.name, trimmedQuery)}</p>
                            <p className="global-search-album-row__publisher">{album.publisher}</p>
                            <p className="global-search-album-row__meta">
                              {album.totalStickers} figuritas · {s.pct}% completado
                            </p>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )}
              {showStickerSection && stickerNumber != null && (
                <section className="global-search-section" aria-label="Figuritas">
                  <h3 className="global-search-section__title">Figurita #{stickerNumber}</h3>
                  <ul className="global-search-list">
                    {stickerRows.map((row) => (
                      <li key={row.album.id}>
                        <button
                          type="button"
                          className="global-search-sticker-row"
                          onClick={() => onOpenAlbum(row.album.id, { focusSticker: stickerNumber })}
                        >
                          <span
                            className={[
                              'global-search-sticker-mini',
                              row.state === 'owned' && 'global-search-sticker-mini--owned',
                              row.state === 'duplicate' && 'global-search-sticker-mini--duplicate',
                              row.state === 'missing' && 'global-search-sticker-mini--missing',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {stickerNumber}
                          </span>
                          <span className="global-search-sticker-row__body">
                            <span className="global-search-sticker-row__album">{row.album.name}</span>
                            <span className="global-search-sticker-row__section">{row.sectionName}</span>
                          </span>
                          <span
                            className={[
                              'global-search-badge',
                              row.state === 'owned' && 'global-search-badge--owned',
                              row.state === 'duplicate' && 'global-search-badge--duplicate',
                              row.state === 'missing' && 'global-search-badge--missing',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {STICKER_STATE_LABEL[row.state]}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
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

      {deleteModal}

      <ShareOptionsSheet
        open={sharePayload != null}
        onClose={() => setSharePayload(null)}
        shareTitle={sharePayload?.title ?? ''}
        shareText={sharePayload?.text ?? ''}
        onFeedback={setShareToast}
      />
    </div>
  )
}
