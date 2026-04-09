/**
 * @param {string} iso
 */
export function formatRelativeTimeEs(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diffMs = Date.now() - d.getTime()
  const sec = Math.floor(diffMs / 1000)
  if (sec < 45) return 'Hace un momento'
  const min = Math.floor(sec / 60)
  if (min < 60) return min <= 1 ? 'Hace 1 minuto' : `Hace ${min} minutos`
  const h = Math.floor(min / 60)
  if (h < 24) return h === 1 ? 'Hace 1 hora' : `Hace ${h} horas`
  const days = Math.floor(h / 24)
  if (days < 7) return days === 1 ? 'Hace 1 día' : `Hace ${days} días`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`
  const months = Math.floor(days / 30)
  if (months < 12) return months <= 1 ? 'Hace 1 mes' : `Hace ${months} meses`
  const years = Math.floor(days / 365)
  return years === 1 ? 'Hace 1 año' : `Hace ${years} años`
}
