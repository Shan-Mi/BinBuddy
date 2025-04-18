// pages/api/swaps.ts (changed from swap.ts)
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../prisma/client'
import { getSwedishWeekNumber } from '../../utils/schedule'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const currentWeek = getSwedishWeekNumber(new Date())

  // Handle GET request to fetch swaps for a specific week
  if (req.method === 'GET') {
    const { week } = req.query

    // If no week is passed in the query string, use the current week
    const weekNumber = week ? Number(week) : currentWeek

    try {
      const swaps = await prisma.swap.findMany({
        where: { weekNumber },
        include: {
          fromFamily: true,
          toFamily: true,
        },
      })
      return res.status(200).json(swaps)
    } catch (error) {
      console.error('Error fetching swaps:', error)
      return res.status(500).json({ error: 'Failed to fetch swaps' })
    }
  }

  // Handle POST request to create a new swap
  if (req.method === 'POST') {
    const { fromFamilyId, toFamilyId } = req.body
    try {
      const swap = await prisma.swap.create({
        data: {
          weekNumber: currentWeek + 1, // Only allow swaps for next week
          fromFamilyId,
          toFamilyId,
          status: 'PENDING',
        },
      })
      return res.status(201).json(swap)
    } catch (error) {
      console.error('Error creating swap:', error)
      return res.status(500).json({ error: 'Failed to create swap request' })
    }
  }

  // Handle PATCH request to update swap status
  if (req.method === 'PATCH') {
    const { swapId, status } = req.body
    try {
      const swap = await prisma.swap.update({
        where: { id: swapId },
        data: { status },
      })
      return res.status(200).json(swap)
    } catch (error) {
      console.error('Error updating swap:', error)
      return res.status(500).json({ error: 'Failed to update swap status' })
    }
  }

  // Method Not Allowed for other HTTP methods
  res.status(405).end()
}
