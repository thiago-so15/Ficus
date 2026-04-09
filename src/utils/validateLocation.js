import { PAISES_ES } from '../data/paisesEs'

/**
 * @param {string} s
 */
function normalize(s) {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

/** Compara países (perfil vs tienda) sin importar tildes ni mayúsculas */
export function normalizeCountryName(s) {
  return normalize(s)
}

const PAISES_NORMALIZADOS = new Set(PAISES_ES.map((p) => normalize(p)))

/**
 * @param {string} pais
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validatePais(pais) {
  const p = pais.trim()

  if (!p) {
    return { ok: false, message: 'Escribí el nombre del país.' }
  }

  if (!PAISES_NORMALIZADOS.has(normalize(p))) {
    return {
      ok: false,
      message:
        'El país no coincide con un nombre reconocido. Ejemplos: Argentina, Uruguay, España, México. Revisá mayúsculas y tildes.',
    }
  }

  return { ok: true }
}

/**
 * @deprecated Mantener por compatibilidad; usar validatePais para pantallas nuevas.
 * @param {string} pais
 * @param {string} _region
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validatePaisRegion(pais, _region) {
  void _region
  return validatePais(pais)
}
