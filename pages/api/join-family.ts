import { getServerSession } from 'next-auth'

import { prisma } from '../../prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from './auth/[...nextauth]'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user?.email)
    return res.status(401).json({ error: 'Unauthorized' })

  const { joinCode } = req.body

  try {
    const family = await prisma.family.findUnique({ where: { joinCode } })
    if (!family) return res.status(404).json({ error: 'Invalid code' })

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { familyId: family.id },
    })

    res.status(200).json({ message: 'Family joined!', user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
