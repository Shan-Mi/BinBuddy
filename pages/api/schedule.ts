import type { NextApiRequest, NextApiResponse } from 'next'
import { getFamilyForWeek, getSwedishWeek } from '../../utils/scheduleUtils'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const week = getSwedishWeek()
  const schedule = [...Array(5)].map((_, i) => {
    const wk = getSwedishWeek(
      new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000)
    )
    return { week: wk, family: getFamilyForWeek(wk) }
  })

  res.status(200).json({ schedule, currentWeek: week })
}
