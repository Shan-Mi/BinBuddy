import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const families = await prisma.family.findMany({ orderBy: { order: 'asc' } })
    return res.json(families)
  }
  res.status(405).end()
}
