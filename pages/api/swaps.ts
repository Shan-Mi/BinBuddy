import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { prisma } from '../../prisma/client'
import { getISOWeek, getISOWeekYear } from '../../utils/isoWeek'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const now = new Date()
  const currentWeek = getISOWeek(now)
  const currentYear = getISOWeekYear(now)

  // --- GET: fetch swaps (year required; week optional) ---
  if (req.method === 'GET') {
    const { week, year } = req.query
    const yearNumber = year ? Number(year) : currentYear

    try {
      const swaps = await prisma.swap.findMany({
        where: {
          year: yearNumber,
          ...(week ? { weekNumber: Number(week) } : {}),
        },
        include: { fromFamily: true, toFamily: true },
        orderBy: { weekNumber: 'asc' },
      })
      return void res.status(200).json({ success: true, data: swaps })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[swaps GET]', message)
      return void res.status(500).json({ success: false, error: message })
    }
  }

  // Mutating routes require authentication
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return void res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  // --- POST: create a new swap request ---
  if (req.method === 'POST') {
    const { fromFamilyId, toFamilyId, weekNumber, year } = req.body as {
      fromFamilyId?: string
      toFamilyId?: string
      weekNumber?: number
      year?: number
    }

    if (!fromFamilyId || !toFamilyId) {
      return void res
        .status(400)
        .json({ success: false, error: 'fromFamilyId and toFamilyId are required' })
    }

    try {
      const swap = await prisma.swap.create({
        data: {
          weekNumber: weekNumber ?? currentWeek + 1,
          year: year ?? currentYear,
          fromFamilyId,
          toFamilyId,
          status: 'PENDING',
        },
        include: { fromFamily: true, toFamily: true },
      })
      return void res.status(201).json({ success: true, data: swap })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[swaps POST]', message)
      return void res.status(500).json({ success: false, error: message })
    }
  }

  // --- PATCH: approve or reject ---
  if (req.method === 'PATCH') {
    const { swapId, status } = req.body as { swapId?: string; status?: string }

    if (!swapId || !['APPROVED', 'REJECTED'].includes(status ?? '')) {
      return void res
        .status(400)
        .json({ success: false, error: 'swapId and valid status (APPROVED|REJECTED) required' })
    }

    try {
      const swap = await prisma.swap.update({
        where: { id: swapId },
        data: { status },
        include: { fromFamily: true, toFamily: true },
      })
      return void res.status(200).json({ success: true, data: swap })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[swaps PATCH]', message)
      return void res.status(500).json({ success: false, error: message })
    }
  }

  res.status(405).end()
}
