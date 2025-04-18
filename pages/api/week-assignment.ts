import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const assignments = await prisma.weekAssignment.findMany({
      include: {
        family: true,
      },
      orderBy: {
        week: 'asc',
      },
    })

    res.status(200).json(assignments)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch week assignments' })
  }
}
