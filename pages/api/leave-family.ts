import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { prisma } from '../../prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') return void res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return void res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  // Admins don't belong to a family
  if (!session.user.familyId) {
    return void res.status(400).json({ success: false, error: 'You are not in a family' })
  }

  // Admin can unlink any user; regular users can only unlink themselves
  const targetId = session.user.isAdmin
    ? ((req.body as { userId?: string }).userId ?? session.user.id)
    : session.user.id

  await prisma.user.update({ where: { id: targetId }, data: { familyId: null } })
  res.status(200).json({ success: true })
}
