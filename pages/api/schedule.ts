import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../prisma/client'
import { getISOWeek, getISOWeekYear } from '../../utils/isoWeek'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') return void res.status(405).end()

  const now = new Date()
  const currentWeek = getISOWeek(now)
  const currentYear = getISOWeekYear(now)

  try {
    const rows = await prisma.weekAssignment.findMany({
      where: { year: currentYear },
      include: { family: true },
      orderBy: { week: 'asc' },
    })

    // Normalise field names and add display flags for the client
    const data = rows.map((a) => ({
      id: a.id,
      weekNumber: a.week,   // alias: UI uses weekNumber consistently
      year: a.year,
      familyId: a.familyId,
      family: {
        id: a.family.id,
        name: a.family.name,
        order: a.family.order,
      },
      isCurrent: a.week === currentWeek,
      isPast: a.week < currentWeek,
    }))

    res.status(200).json({ success: true, data, currentWeek, currentYear })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[schedule]', message)
    res.status(500).json({ success: false, error: message })
  }
}
