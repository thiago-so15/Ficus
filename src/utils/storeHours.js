/**
 * Horarios por día (lunes–domingo). null = cerrado ese día.
 * @typedef {{ open: string, close: string }} DaySlot
 * @typedef {{ sun: DaySlot | null, mon: DaySlot | null, tue: DaySlot | null, wed: DaySlot | null, thu: DaySlot | null, fri: DaySlot | null, sat: DaySlot | null }} WeeklyHours
 */

const SHORT_TO_KEY = /** @type {const} */ ({
  Sun: 'sun',
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
})

/**
 * @param {string} hm "HH:mm"
 */
function toMinutes(hm) {
  const [h, m] = hm.split(':').map((x) => parseInt(x, 10))
  return h * 60 + (m || 0)
}

/**
 * @param {WeeklyHours} weeklyHours
 * @param {string} timeZone IANA
 * @param {Date} [now]
 * @returns {{ open: boolean, closesAt?: string, opensAt?: string }}
 */
export function getOpenStatus(weeklyHours, timeZone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const wd = parts.find((p) => p.type === 'weekday')?.value
  const hourPart = parts.find((p) => p.type === 'hour')?.value
  const minutePart = parts.find((p) => p.type === 'minute')?.value
  if (!wd || hourPart == null || minutePart == null) {
    return { open: false }
  }

  const key = SHORT_TO_KEY[/** @type {keyof typeof SHORT_TO_KEY} */ (wd)]
  if (!key) return { open: false }

  const slot = weeklyHours[key]
  if (!slot) return { open: false, opensAt: undefined }

  const cur = parseInt(hourPart, 10) * 60 + parseInt(minutePart, 10)
  const o = toMinutes(slot.open)
  const c = toMinutes(slot.close)

  if (c > o) {
    const open = cur >= o && cur < c
    return { open, closesAt: open ? slot.close : undefined, opensAt: !open ? slot.open : undefined }
  }

  /* Cruza medianoche: poco común en retail; tratamos como cerrado si no está en el tramo simple */
  return { open: false }
}

const DAY_ORDER = /** @type {const} */ (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
const DAY_LABEL = {
  mon: 'Lun',
  tue: 'Mar',
  wed: 'Mié',
  thu: 'Jue',
  fri: 'Vie',
  sat: 'Sáb',
  sun: 'Dom',
}

/**
 * @param {WeeklyHours} weeklyHours
 */
export function formatWeeklyHoursLines(weeklyHours) {
  return DAY_ORDER.map((k) => {
    const slot = weeklyHours[k]
    const label = DAY_LABEL[k]
    if (!slot) return `${label}: cerrado`
    return `${label}: ${slot.open} – ${slot.close}`
  })
}
