import { useMemo, useState } from 'react'
import { StoreCard } from '../components/StoreCard'
import { StoreDetailModal } from '../components/StoreDetailModal'
import { STORE_TYPE_LABELS } from '../data/storesCatalog'
import { useNowTick } from '../hooks/useNowTick'
import { normalizeCountryName } from '../utils/validateLocation'
import { getOpenStatus } from '../utils/storeHours'

/**
 * @param {{
 *   allStores: import('../data/storesCatalog').StoreDefinition[]
 *   profilePais: string
 *   filterByProfileCountry?: boolean
 *   prioritizeOpenStores?: boolean
 *   showStoreCardHint?: boolean
 * }} props
 */
export function StoresScreen({
  allStores,
  profilePais,
  filterByProfileCountry = true,
  prioritizeOpenStores = true,
  showStoreCardHint = true,
}) {
  useNowTick(45000)

  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState(/** @type {'all' | 'kiosco' | 'libreria' | 'jugueteria'} */ ('all'))
  const [selectedId, setSelectedId] = useState(/** @type {string | null} */ (null))

  const byCountry = useMemo(() => {
    if (!filterByProfileCountry) return allStores
    const p = profilePais?.trim()
    if (!p) return allStores
    const n = normalizeCountryName(p)
    return allStores.filter((s) => normalizeCountryName(s.country) === n)
  }, [allStores, profilePais, filterByProfileCountry])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return byCountry.filter((s) => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false
      if (!q) return true
      const hay = `${s.name} ${s.address} ${s.city} ${s.note}`.toLowerCase()
      return hay.includes(q)
    })
  }, [byCountry, query, typeFilter])

  const sortedStores = useMemo(() => {
    if (!prioritizeOpenStores) return filtered
    return [...filtered].sort((a, b) => {
      const ao = getOpenStatus(a.weeklyHours, a.timezone).open ? 1 : 0
      const bo = getOpenStatus(b.weeklyHours, b.timezone).open ? 1 : 0
      return bo - ao
    })
  }, [filtered, prioritizeOpenStores])

  const selectedStore = selectedId ? allStores.find((s) => s.id === selectedId) ?? null : null

  const typeChips = /** @type {const} */ ([
    { id: 'all', label: 'Todas' },
    { id: 'kiosco', label: 'Kioscos' },
    { id: 'libreria', label: 'Librerías' },
    { id: 'jugueteria', label: 'Jugueterías' },
  ])

  const hasProfileCountry = Boolean(profilePais?.trim()) && filterByProfileCountry

  return (
    <div className="screen screen--stores fade-in">
      <header className="screen-header">
        <h1 className="app-title">Tiendas</h1>
        <p className="app-subtitle">Dónde conseguir álbumes y paquetes</p>
      </header>

      {!hasProfileCountry && (
        <p className="stores-country-hint">
          Configurá tu <strong>país</strong> en Perfil para ver primero tiendas de tu zona. Mostrando todas las
          regiones.
        </p>
      )}

      {hasProfileCountry && (
        <p className="stores-country-hint stores-country-hint--ok">
          Mostrando tiendas en <strong>{profilePais.trim()}</strong> (según tu perfil).
        </p>
      )}

      <div className="stores-toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="Buscar por nombre, ciudad o dirección"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar tiendas"
        />
      </div>

      <div className="filter-chips" role="group" aria-label="Tipo de tienda">
        {typeChips.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip ${typeFilter === c.id ? 'chip--active' : ''}`}
            onClick={() => setTypeFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul className="store-list">
        {sortedStores.map((store) => {
          const { open } = getOpenStatus(store.weeklyHours, store.timezone)
          return (
            <li key={store.id}>
              <StoreCard
                store={store}
                typeLabel={STORE_TYPE_LABELS[store.type]}
                isOpen={open}
                onOpen={() => setSelectedId(store.id)}
                showHint={showStoreCardHint}
              />
            </li>
          )
        })}
      </ul>

      {sortedStores.length === 0 && (
        <p className="stores-empty">
          {byCountry.length === 0
            ? 'No hay tiendas cargadas para el país de tu perfil. Revisá el país en Perfil o probá sin filtro borrando el país.'
            : 'No hay tiendas que coincidan con tu búsqueda.'}
        </p>
      )}

      {selectedStore && (
        <StoreDetailModal
          store={selectedStore}
          typeLabel={STORE_TYPE_LABELS[selectedStore.type]}
          isOpen={getOpenStatus(selectedStore.weeklyHours, selectedStore.timezone).open}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
