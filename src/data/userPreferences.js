/**
 * Preferencias de apariencia, notificaciones e idioma (localStorage).
 * @typedef {{
 *   theme: 'dark' | 'light'
 *   notifAlbumAlmostComplete: boolean
 *   notifNewNearbyStores: boolean
 *   locale: 'es' | 'en' | 'pt'
 * }} UserPreferences
 */

/** @type {UserPreferences} */
export const DEFAULT_USER_PREFERENCES = {
  theme: 'dark',
  notifAlbumAlmostComplete: true,
  notifNewNearbyStores: true,
  locale: 'es',
}

/**
 * @param {unknown} raw
 * @returns {UserPreferences}
 */
export function normalizeUserPreferences(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_USER_PREFERENCES }
  const o = /** @type {Record<string, unknown>} */ (raw)
  const theme = o.theme === 'light' ? 'light' : 'dark'
  const locale = o.locale === 'en' || o.locale === 'pt' ? o.locale : 'es'
  return {
    theme,
    notifAlbumAlmostComplete:
      typeof o.notifAlbumAlmostComplete === 'boolean'
        ? o.notifAlbumAlmostComplete
        : DEFAULT_USER_PREFERENCES.notifAlbumAlmostComplete,
    notifNewNearbyStores:
      typeof o.notifNewNearbyStores === 'boolean'
        ? o.notifNewNearbyStores
        : DEFAULT_USER_PREFERENCES.notifNewNearbyStores,
    locale,
  }
}
