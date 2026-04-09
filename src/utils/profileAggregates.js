import { getAlbumById } from '../data/albumsCatalog'
import { countAlbumStats } from './albumStats'

/**
 * @param {string[]} userAlbumIds
 * @param {Record<string, Record<string, string>>} stickerStates
 */
export function computeProfileAggregates(userAlbumIds, stickerStates) {
  const albums = userAlbumIds.map((id) => getAlbumById(id)).filter(Boolean)

  let totalOwned = 0
  let totalDuplicate = 0
  let sumPct = 0
  let completeAlbums = 0

  const albumRows = []

  for (const album of albums) {
    const s = countAlbumStats(album, stickerStates[album.id])
    totalOwned += s.owned
    totalDuplicate += s.duplicate
    sumPct += s.pct
    if (s.pct === 100) completeAlbums += 1
    albumRows.push({ album, stats: s })
  }

  const n = albums.length
  const avgPct = n ? Math.round(sumPct / n) : 0
  const totalFilled = totalOwned + totalDuplicate

  albumRows.sort((a, b) => b.stats.pct - a.stats.pct)

  return {
    albumCount: n,
    totalOwned,
    totalDuplicate,
    totalFilled,
    avgPct,
    completeAlbums,
    albumRowsSorted: albumRows,
  }
}

/**
 * @param {{
 *   albumCount: number
 *   totalFilled: number
 *   completeAlbums: number
 * }} s
 */
export function computeAchievementsUnlocked(s) {
  return {
    firstAlbum: s.albumCount >= 1,
    centenario: s.totalFilled >= 100,
    oneComplete: s.completeAlbums >= 1,
    fiveAlbums: s.albumCount >= 5,
    fiveHundred: s.totalFilled >= 500,
    legend: s.completeAlbums >= 3,
  }
}

/** Días desde la instalación (incluye el día de instalación). */
export function daysSinceInstall(isoDate) {
  const start = new Date(isoDate)
  const now = new Date()
  if (Number.isNaN(start.getTime())) return 1
  const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(1, Math.floor((b - a) / 86400000) + 1)
}
