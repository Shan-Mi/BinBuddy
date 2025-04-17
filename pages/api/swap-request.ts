import type { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { sendSwapEmail } from '../../utils/emailUtils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req })
  if (!token) return res.status(401).end('Unauthorized')

  const { targetEmail, requester, week } = req.body

  try {
    await sendSwapEmail(targetEmail, requester, week)
    res.status(200).json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to send swap request.' })
  }
}
