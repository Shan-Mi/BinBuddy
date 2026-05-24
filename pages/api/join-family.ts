import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { prisma } from '../../prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') return void res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return void res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  const { joinCode } = req.body as { joinCode?: string }
  if (!joinCode?.trim()) {
    return void res.status(400).json({ success: false, error: 'Join code is required' })
  }

  try {
    const family = await prisma.family.findUnique({ where: { joinCode: joinCode.trim() } })
    if (!family) {
      return void res.status(404).json({ success: false, error: 'Invalid join code' })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (user?.familyId) {
      return void res.status(400).json({ success: false, error: 'You are already part of a family' })
    }

    // Each family slot holds at most one user (familyId is @unique on User)
    const taken = await prisma.user.findFirst({ where: { familyId: family.id } })
    if (taken) {
      return void res.status(409).json({ success: false, error: 'That family slot is already taken' })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { familyId: family.id },
    })

    res.status(200).json({ success: true, data: { familyId: family.id, familyName: family.name } })
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
