/** Colores del avatar (ciclo: verde, azul, violeta, naranja, rosa) */
export const AVATAR_COLOR_CYCLE = /** @type {const} */ ([
  '#1D9E75',
  '#3B82F6',
  '#8B5CF6',
  '#F97316',
  '#EC4899',
])

/**
 * @param {number} idx
 */
export function normalizeAvatarColorIndex(idx) {
  const n = Math.floor(Number(idx))
  if (Number.isNaN(n)) return 0
  const m = ((n % AVATAR_COLOR_CYCLE.length) + AVATAR_COLOR_CYCLE.length) % AVATAR_COLOR_CYCLE.length
  return m
}

/**
 * @param {string} name
 */
export function getDisplayInitial(name) {
  const t = name.trim()
  if (!t) return '?'
  return t.charAt(0).toUpperCase()
}

/**
 * @param {string} isoDate
 * @param {string} [locale]
 */
export function formatCollectorSince(isoDate, locale = 'es') {
  try {
    const d = new Date(isoDate)
    if (Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat(locale === 'en' ? 'en' : locale === 'pt' ? 'pt' : 'es', {
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch {
    return ''
  }
}
