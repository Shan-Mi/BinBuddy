import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { userId, joinCode } = req.body

    if (!userId || !joinCode) {
      return res
        .status(400)
        .json({ error: 'User ID and join code are required' })
    }

    try {
      // 1. Find the family by joinCode
      const family = await prisma.family.findUnique({
        where: { joinCode },
      })

      if (!family) {
        return res
          .status(404)
          .json({ error: 'Family not found with the provided join code' })
      }

      // 2. Check if the user is already part of a family
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (existingUser?.familyId) {
        return res
          .status(400)
          .json({ error: 'User is already part of a family' })
      }

      // 3. Assign the user to the family
      await prisma.user.update({
        where: { id: userId },
        data: { familyId: family.id },
      })

      return res
        .status(200)
        .json({ message: 'User successfully joined family' })
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
}
