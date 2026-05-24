import type { NextApiRequest, NextApiResponse } from 'next'
import { runWeeklyReminder } from '../../../utils/weeklyReminder'

/**
 * Cron endpoint — call this every Monday evening (e.g. "0 18 * * 1" in Vercel Cron).
 * Protect it with a shared secret: Authorization: Bearer <CRON_SECRET>.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') return void res.status(405).end()

  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return void res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  try {
    const result = await runWeeklyReminder()
    res.status(200).json({ success: true, ...result })
  } catch {
    res.status(500).json({ success: false, error: 'Reminder job failed' })
  }
}
