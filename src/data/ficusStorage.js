import {
  STORAGE_APP_SETTINGS,
  STORAGE_ONBOARDING_COMPLETE,
  STORAGE_PROFILE,
  STORAGE_PROFILE_INTRO,
  STORAGE_STICKER_STATES,
  STORAGE_USER_ALBUMS,
  STORAGE_USER_PREFERENCES,
} from './storageKeys'

/** Todas las claves que usa Ficus en localStorage (exportar / borrar todo). */
export const FICUS_LOCAL_STORAGE_KEYS = /** @type {const} */ ([
  STORAGE_USER_ALBUMS,
  STORAGE_STICKER_STATES,
  STORAGE_ONBOARDING_COMPLETE,
  STORAGE_PROFILE,
  STORAGE_PROFILE_INTRO,
  STORAGE_APP_SETTINGS,
  STORAGE_USER_PREFERENCES,
])

/**
 * @returns {Record<string, string | null>}
 */
export function readAllFicusLocalStorage() {
  /** @type {Record<string, string | null>} */
  const out = {}
  for (const key of FICUS_LOCAL_STORAGE_KEYS) {
    try {
      out[key] = localStorage.getItem(key)
    } catch {
      out[key] = null
    }
  }
  return out
}

export function clearAllFicusLocalStorage() {
  for (const key of FICUS_LOCAL_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  }
}
