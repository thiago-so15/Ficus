/**
 * Centro aproximado por ciudad (para distancia haversine desde geolocalización del usuario).
 * Claves deben coincidir exactamente con `store.city` del catálogo.
 */
export const STORE_CITY_CENTERS = /** @type {Record<string, { lat: number, lng: number }>} */ ({
  'Ciudad Autónoma de Buenos Aires': { lat: -34.6037, lng: -58.3816 },
  'La Plata, Buenos Aires': { lat: -34.9214, lng: -57.9544 },
  'Rosario, Santa Fe': { lat: -32.9442, lng: -60.6505 },
  'Martínez, Buenos Aires': { lat: -34.4875, lng: -58.5026 },
  'Avellaneda, Buenos Aires': { lat: -34.6628, lng: -58.3647 },
  Madrid: { lat: 40.4168, lng: -3.7038 },
  Barcelona: { lat: 41.3851, lng: 2.1734 },
  'Leganés, Madrid': { lat: 40.3267, lng: -3.7636 },
  'San Sebastián de los Reyes, Madrid': { lat: 40.5483, lng: -3.6282 },
  'Ciudad de México': { lat: 19.4326, lng: -99.1332 },
  'Guadalajara, Jalisco': { lat: 20.6597, lng: -103.3496 },
  Montevideo: { lat: -34.9011, lng: -56.1645 },
  'São Paulo': { lat: -23.5505, lng: -46.6333 },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
  Santiago: { lat: -33.4489, lng: -70.6693 },
})

/**
 * @param {{ city: string }} store
 */
export function getApproxCoordsForStore(store) {
  return STORE_CITY_CENTERS[store.city] ?? null
}
