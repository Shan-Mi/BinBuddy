export function getMondayOfWeek(week: number, year: number): Date {
  const jan4 = new Date(year, 0, 4)
  const jan4Day = jan4.getDay() || 7
  const mon = new Date(jan4)
  mon.setDate(jan4.getDate() - (jan4Day - 1) + (week - 1) * 7)
  return mon
}

// Bins are due Tuesday 06:00 — all displayed dates show Tuesday
export function getTuesdayOfWeek(week: number, year: number): Date {
  const tue = getMondayOfWeek(week, year)
  tue.setDate(tue.getDate() + 1)
  return tue
}

export function weekDayLabel(week: number, year: number): string {
  return getTuesdayOfWeek(week, year).toLocaleDateString('sv-SE', { weekday: 'short' })
}

export function weekDateLabel(week: number, year: number): string {
  return getTuesdayOfWeek(week, year).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

export function weekFullDate(week: number, year: number): string {
  return getTuesdayOfWeek(week, year).toLocaleDateString('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
