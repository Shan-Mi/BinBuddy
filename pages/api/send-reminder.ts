import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { prisma } from '../../prisma/client'
import { sendReminderEmail } from '../../utils/emailUtils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') return void res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return void res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  const { familyId, weekNumber, message } = req.body as {
    familyId?: string
    weekNumber?: number
    message?: string
  }

  if (!familyId || !weekNumber) {
    return void res.status(400).json({ success: false, error: 'familyId and weekNumber are required' })
  }

  try {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: { user: { select: { email: true } } },
    })

    if (!family?.user?.email) {
      return void res.status(404).json({ success: false, error: 'No email found for this family' })
    }

    await sendReminderEmail({
      to: family.user.email,
      familyName: family.name,
      weekNumber,
      message,
    })

    res.status(200).json({ success: true })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to send reminder' })
  }
}
