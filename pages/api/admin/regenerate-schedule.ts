import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../prisma/client'
import { getISOWeekYear } from '../../../utils/isoWeek'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') return void res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) {
    return void res.status(403).json({ success: false, error: 'Forbidden' })
  }

  const year: number = req.body?.year ?? getISOWeekYear(new Date())

  try {
    const families = await prisma.family.findMany({ orderBy: { order: 'asc' } })
    if (families.length === 0) {
      return void res.status(400).json({ success: false, error: 'No families found' })
    }

    // Rebuild 52 weeks — rotation resets to order-1 family at week 1 every year
    const upserts = []
    for (let week = 1; week <= 52; week++) {
      const family = families[(week - 1) % families.length]
      upserts.push(
        prisma.weekAssignment.upsert({
          where: { week_year: { week, year } },
          update: { familyId: family.id },
          create: { week, year, familyId: family.id },
        })
      )
    }

    await prisma.$transaction(upserts)
    return void res.status(200).json({ success: true, weeks: 52, year, families: families.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return void res.status(500).json({ success: false, error: message })
  }
}
