/**
 * @typedef {{
 *   filterStoresByCountry: boolean
 *   confirmBeforeDeleteAlbum: boolean
 *   prioritizeOpenStores: boolean
 *   showStoreCardHint: boolean
 *   largeTextMode: boolean
 * }} AppSettings
 */

/** @type {AppSettings} */
export const DEFAULT_APP_SETTINGS = {
  filterStoresByCountry: true,
  confirmBeforeDeleteAlbum: true,
  prioritizeOpenStores: true,
  showStoreCardHint: true,
  largeTextMode: false,
}

/**
 * @param {unknown} raw
 * @returns {AppSettings}
 */
export function normalizeAppSettings(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_APP_SETTINGS }
  const o = /** @type {Record<string, unknown>} */ (raw)
  return {
    filterStoresByCountry:
      typeof o.filterStoresByCountry === 'boolean'
        ? o.filterStoresByCountry
        : DEFAULT_APP_SETTINGS.filterStoresByCountry,
    confirmBeforeDeleteAlbum:
      typeof o.confirmBeforeDeleteAlbum === 'boolean'
        ? o.confirmBeforeDeleteAlbum
        : DEFAULT_APP_SETTINGS.confirmBeforeDeleteAlbum,
    prioritizeOpenStores:
      typeof o.prioritizeOpenStores === 'boolean'
        ? o.prioritizeOpenStores
        : DEFAULT_APP_SETTINGS.prioritizeOpenStores,
    showStoreCardHint:
      typeof o.showStoreCardHint === 'boolean'
        ? o.showStoreCardHint
        : DEFAULT_APP_SETTINGS.showStoreCardHint,
    largeTextMode:
      typeof o.largeTextMode === 'boolean' ? o.largeTextMode : DEFAULT_APP_SETTINGS.largeTextMode,
  }
}
