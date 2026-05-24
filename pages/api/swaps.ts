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
    const { fromFamilyId, toFamilyId, weekNumber, toWeekNumber, year } = req.body as {
      fromFamilyId?: string
      toFamilyId?: string
      weekNumber?: number
      toWeekNumber?: number
      year?: number
    }

    if (!fromFamilyId || !toFamilyId || !weekNumber || !toWeekNumber) {
      return void res
        .status(400)
        .json({ success: false, error: 'fromFamilyId, toFamilyId, weekNumber, and toWeekNumber are required' })
    }

    try {
      const swap = await prisma.swap.create({
        data: {
          weekNumber,
          toWeekNumber,
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
      const existing = await prisma.swap.findUnique({ where: { id: swapId } })
      if (!existing) {
        return void res.status(404).json({ success: false, error: 'Swap not found' })
      }

      if (status === 'APPROVED') {
        // Swap the two WeekAssignment rows inside a transaction
        const [fromRow, toRow] = await Promise.all([
          prisma.weekAssignment.findFirst({
            where: { week: existing.weekNumber, year: existing.year, familyId: existing.fromFamilyId },
          }),
          prisma.weekAssignment.findFirst({
            where: { week: existing.toWeekNumber, year: existing.year, familyId: existing.toFamilyId },
          }),
        ])

        if (!fromRow || !toRow) {
          return void res.status(400).json({ success: false, error: 'Could not find matching schedule rows to swap' })
        }

        await prisma.$transaction([
          prisma.weekAssignment.update({ where: { id: fromRow.id }, data: { familyId: existing.toFamilyId } }),
          prisma.weekAssignment.update({ where: { id: toRow.id }, data: { familyId: existing.fromFamilyId } }),
          prisma.swap.update({ where: { id: swapId }, data: { status: 'APPROVED' } }),
        ])
      } else {
        await prisma.swap.update({ where: { id: swapId }, data: { status } })
      }

      const swap = await prisma.swap.findUnique({
        where: { id: swapId },
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
