import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../prisma/client'

// One-time admin claim — only works if no admin exists yet.
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') return void res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return void res.status(401).json({ success: false, error: 'Not signed in' })
  }

  const existingAdmin = await prisma.user.findFirst({ where: { isAdmin: true } })
  if (existingAdmin) {
    return void res.status(403).json({ success: false, error: 'An admin already exists' })
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { isAdmin: true } })
  return void res.status(200).json({ success: true })
}
