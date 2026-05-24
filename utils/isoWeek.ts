/** Returns the ISO week number (1–53) for a given date. */
export function getISOWeek(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Returns the ISO week-year (can differ from calendar year in weeks 1 and 52/53). */
export function getISOWeekYear(date: Date): number {
  const d = new Date(date)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  return d.getFullYear()
}
