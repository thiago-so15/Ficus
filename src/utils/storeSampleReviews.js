/**
 * Dos reseñas de ejemplo por tienda (catálogo incorporado).
 * @param {import('../data/storesCatalog').StoreDefinition} store
 */
export function getBuiltInSampleReviews(store) {
  const noteSnippet = store.note?.trim() ? store.note.trim() : 'Variedad según temporada.'
  return [
    {
      id: `builtin-${store.id}-a`,
      author: 'Ana R.',
      stars: 5,
      text: `Buena atención en ${store.name}. Encontré álbumes y sobres para la colección.`,
      createdAt: '2024-11-02T16:30:00.000Z',
    },
    {
      id: `builtin-${store.id}-b`,
      author: 'Diego M.',
      stars: 4,
      text: `Suele haber stock de colecciones populares. ${noteSnippet}`,
      createdAt: '2024-08-17T11:00:00.000Z',
    },
  ]
}
