import { ALBUMS_CATALOG } from '../data/albumsCatalog'

const CATEGORY_ORDER = /** @type {const} */ (['futbol', 'anime', 'peliculas'])
const CATEGORY_LABEL = {
  futbol: 'Fútbol',
  anime: 'Anime',
  peliculas: 'Películas y series',
}

/**
 * @param {{
 *   userAlbumIds: string[]
 *   onPick: (id: string) => void
 *   onBack: () => void
 * }} props
 */
export function AddAlbumScreen({ userAlbumIds, onPick, onBack }) {
  const setIds = new Set(userAlbumIds)
  const available = ALBUMS_CATALOG.filter((a) => !setIds.has(a.id))

  return (
    <div className="screen screen--add fade-in">
      <header className="detail-header">
        <button type="button" className="btn btn--ghost btn--back" onClick={onBack}>
          ← Volver
        </button>
        <div className="detail-header__text">
          <h1 className="detail-title">Agregar álbum</h1>
          <p className="detail-sub">Elegí un álbum del catálogo</p>
        </div>
      </header>

      {available.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <p className="empty-state__title">Ya tenés todos los álbumes</p>
          <p className="empty-state__text">No quedan álbumes nuevos para agregar en el catálogo.</p>
          <button type="button" className="btn btn--secondary" onClick={onBack}>
            Volver a mis álbumes
          </button>
        </div>
      ) : (
        <div className="catalog">
          {CATEGORY_ORDER.map((cat) => {
            const items = available.filter((a) => a.category === cat)
            if (items.length === 0) return null
            return (
              <section key={cat} className="catalog__block">
                <h2 className="catalog__heading">{CATEGORY_LABEL[cat]}</h2>
                <ul className="catalog-list">
                  {items.map((album) => (
                    <li key={album.id}>
                      <button type="button" className="catalog-item" onClick={() => onPick(album.id)}>
                        <div className="catalog-item__main">
                          <span className="catalog-item__name">{album.name}</span>
                          <span className="catalog-item__pub">{album.publisher}</span>
                          <span className="catalog-item__count">{album.totalStickers} figuritas</span>
                        </div>
                        <span className="catalog-item__action">Agregar</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
