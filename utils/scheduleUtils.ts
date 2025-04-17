import baseSchedule from '../schedule/baseSchedule.json'
import overrides from '../schedule/overrides.json'
import fs from 'fs'
import path from 'path'

export function getSwedishWeek(date = new Date()) {
  // Copy date so we don't modify original
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  // Set to nearest Thursday: current date + 4 - current day number (0=Sunday → 4=Thursday)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  )

  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`
}

export function getFamilyForWeek(week: string): string {
  return (
    overrides[week] ||
    baseSchedule[(parseInt(week.split('-')[1]) - 1) % baseSchedule.length]
      .family
  )
}

export function overrideWeek(week: string, newFamily: string) {
  overrides[week] = newFamily
  fs.writeFileSync(
    path.resolve('schedule/overrides.json'),
    JSON.stringify(overrides, null, 2)
  )
}
