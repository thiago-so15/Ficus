/** @typedef {{ id: string, label: string }} TipoColeccionOption */

/** Opciones alineadas con el catálogo de álbumes */
export const TIPOS_COLECCION_OPTIONS = /** @type {const} */ ([
  { id: 'futbol', label: 'Fútbol' },
  { id: 'anime', label: 'Anime' },
  { id: 'peliculas', label: 'Películas o series' },
  { id: 'otros', label: 'Otros' },
])

/**
 * @typedef {{
 *   nombre: string
 *   apellido: string
 *   fechaNacimiento: string
 *   pais: string
 *   region: string
 *   basicsSaved: boolean
 *   tiposColeccion: string[]
 * }} UserProfile
 */

/** @type {UserProfile} */
export const DEFAULT_PROFILE = {
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  pais: '',
  region: '',
  basicsSaved: false,
  tiposColeccion: [],
}

/**
 * @param {unknown} raw
 * @returns {UserProfile}
 */
export function normalizeProfile(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PROFILE }

  const o = /** @type {Record<string, unknown>} */ (raw)

  if ('nombre' in o || 'apellido' in o) {
    const tipos = o.tiposColeccion
    const tiposArr = Array.isArray(tipos) ? tipos.map(String) : []

    let basicsSaved = Boolean(o.basicsSaved)
    if (!('basicsSaved' in o)) {
      const n = String(o.nombre ?? '').trim()
      const a = String(o.apellido ?? '').trim()
      const p = String(o.pais ?? '').trim()
      if (n && a && p) basicsSaved = true
    }

    return {
      nombre: String(o.nombre ?? ''),
      apellido: String(o.apellido ?? ''),
      fechaNacimiento: String(o.fechaNacimiento ?? ''),
      pais: String(o.pais ?? ''),
      region: String(o.region ?? ''),
      basicsSaved,
      tiposColeccion: tiposArr,
    }
  }

  if ('name' in o && typeof o.name === 'string') {
    const parts = o.name.trim().split(/\s+/).filter(Boolean)
    return {
      ...DEFAULT_PROFILE,
      nombre: parts[0] ?? '',
      apellido: parts.slice(1).join(' ') ?? '',
    }
  }

  return { ...DEFAULT_PROFILE }
}
