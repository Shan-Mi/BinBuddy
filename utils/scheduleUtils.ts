import baseSchedule from '../schedule/baseSchedule.json'
import overrides from '../schedule/overrides.json'
import fs from 'fs'
import path from 'path'

export function getSwedishWeek(date = new Date()) {
  const week = new Intl.DateTimeFormat('sv-SE', { week: 'numeric' }).format(
    date
  )
  return `${date.getFullYear()}-${week.padStart(2, '0')}`
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
