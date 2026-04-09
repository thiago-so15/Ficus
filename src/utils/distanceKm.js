/**
 * Distancia en km entre dos puntos WGS84 (haversine).
 * @param {{ lat: number, lng: number }} a
 * @param {{ lat: number, lng: number }} b
 */
export function haversineKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return R * c
}

/**
 * @param {number} km
 */
export function formatDistanceEs(km) {
  if (!Number.isFinite(km) || km < 0) return ''
  if (km < 1) return `Aprox. ${Math.round(km * 1000)} m`
  return `Aprox. ${km.toLocaleString('es-AR', { maximumFractionDigits: 1 })} km`
}
