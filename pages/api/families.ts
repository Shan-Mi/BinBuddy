import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') return void res.status(405).end()

  try {
    const families = await prisma.family.findMany({
      orderBy: { order: 'asc' },
    })
    res.status(200).json({ success: true, data: families })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch families' })
  }
}
