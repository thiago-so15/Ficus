/** @typedef {'futbol' | 'anime' | 'peliculas'} AlbumCategory */

/**
 * @typedef {{ name: string, from: number, to: number }} AlbumSection
 * @typedef {{
 *   id: string
 *   name: string
 *   publisher: string
 *   totalStickers: number
 *   category: AlbumCategory
 *   sections: AlbumSection[]
 * }} AlbumDefinition
 */

/** @type {AlbumDefinition[]} */
export const ALBUMS_CATALOG = [
  {
    id: 'copa-america-2024',
    name: 'Copa América USA 2024',
    publisher: 'Panini',
    totalStickers: 200,
    category: 'futbol',
    sections: [
      { name: 'Estadios', from: 1, to: 40 },
      { name: 'Escudos', from: 41, to: 80 },
      { name: 'Figuritas de jugador', from: 81, to: 160 },
      { name: 'Leyendas y especiales', from: 161, to: 200 },
    ],
  },
  {
    id: 'lpf-2025',
    name: 'Liga Profesional Argentina 2025',
    publisher: 'Ad Álbum',
    totalStickers: 180,
    category: 'futbol',
    sections: [
      { name: 'Equipos A–J', from: 1, to: 90 },
      { name: 'Equipos K–Z', from: 91, to: 150 },
      { name: 'Especiales', from: 151, to: 180 },
    ],
  },
  {
    id: 'ucl-2024-25',
    name: 'UEFA Champions League 2024/25',
    publisher: 'Topps',
    totalStickers: 220,
    category: 'futbol',
    sections: [
      { name: 'Fase de grupos A–D', from: 1, to: 80 },
      { name: 'Fase de grupos E–H', from: 81, to: 160 },
      { name: 'Playoffs y final', from: 161, to: 220 },
    ],
  },
  {
    id: 'demon-slayer-legacy',
    name: 'Demon Slayer: Kimetsu no Yaiba',
    publisher: 'Panini',
    totalStickers: 160,
    category: 'anime',
    sections: [
      { name: 'Cazadores y aliados', from: 1, to: 60 },
      { name: 'Demonios', from: 61, to: 120 },
      { name: 'Arco final', from: 121, to: 160 },
    ],
  },
  {
    id: 'one-piece-wano',
    name: 'One Piece: Saga de Wano',
    publisher: 'Bandai',
    totalStickers: 200,
    category: 'anime',
    sections: [
      { name: 'Piratas del Sombrero de Paja', from: 1, to: 50 },
      { name: 'Samuráis y Kozuki', from: 51, to: 110 },
      { name: 'Bestias piratas', from: 111, to: 170 },
      { name: 'Tesoros y barcos', from: 171, to: 200 },
    ],
  },
  {
    id: 'attack-on-titan-final',
    name: 'Attack on Titan: Temporada final',
    publisher: 'Ensky',
    totalStickers: 120,
    category: 'anime',
    sections: [
      { name: 'Cuerpo de exploración', from: 1, to: 50 },
      { name: 'Titanes y misterios', from: 51, to: 90 },
      { name: 'Epílogo', from: 91, to: 120 },
    ],
  },
  {
    id: 'harry-potter-hogwarts',
    name: 'Harry Potter: Hogwarts',
    publisher: 'Panini',
    totalStickers: 180,
    category: 'peliculas',
    sections: [
      { name: 'Casas y profesores', from: 1, to: 60 },
      { name: 'Hechizos y criaturas', from: 61, to: 120 },
      { name: 'Reliquias y momentos', from: 121, to: 180 },
    ],
  },
  {
    id: 'star-wars-obiwan',
    name: 'Star Wars: Obi-Wan Kenobi',
    publisher: 'Topps',
    totalStickers: 150,
    category: 'peliculas',
    sections: [
      { name: 'Jedi y Sith', from: 1, to: 50 },
      { name: 'Inquisidores', from: 51, to: 90 },
      { name: 'Planetas y naves', from: 91, to: 150 },
    ],
  },
  {
    id: 'stranger-things-4',
    name: 'Stranger Things 4',
    publisher: 'Netflix × Panini',
    totalStickers: 140,
    category: 'peliculas',
    sections: [
      { name: 'Hawkins', from: 1, to: 50 },
      { name: 'El otro lado', from: 51, to: 100 },
      { name: 'Vecna y el grupo', from: 101, to: 140 },
    ],
  },
]

/** @param {string} id */
export function getAlbumById(id) {
  return ALBUMS_CATALOG.find((a) => a.id === id) ?? null
}

/** @param {AlbumDefinition} album */
export function getNumbersForAlbum(album) {
  const nums = []
  for (const s of album.sections) {
    for (let n = s.from; n <= s.to; n += 1) nums.push(n)
  }
  return nums
}
