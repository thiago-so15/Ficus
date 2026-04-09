import { getNumbersForAlbum } from '../data/albumsCatalog'

/** @typedef {'missing' | 'owned' | 'duplicate'} StickerState */

/**
 * @param {Record<string, string> | undefined} map
 * @param {number} num
 * @returns {StickerState}
 */
export function getStickerState(map, num) {
  const s = map?.[String(num)]
  if (s === 'owned' || s === 'duplicate') return s
  return 'missing'
}

/**
 * @param {import('../data/albumsCatalog').AlbumDefinition} album
 * @param {Record<string, string> | undefined} stickerMap
 */
export function countAlbumStats(album, stickerMap) {
  let owned = 0
  let missing = 0
  let duplicate = 0
  const numbers = getNumbersForAlbum(album)
  for (const n of numbers) {
    const st = getStickerState(stickerMap, n)
    if (st === 'owned') owned += 1
    else if (st === 'duplicate') duplicate += 1
    else missing += 1
  }
  const total = album.totalStickers
  const filled = owned + duplicate
  const pct = total ? Math.round((filled / total) * 100) : 0
  return { owned, missing, duplicate, total, filled, pct }
}
