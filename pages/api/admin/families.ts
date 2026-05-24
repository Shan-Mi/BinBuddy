import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../prisma/client'
import { generateJoinCode } from '../../../utils/generateJoinCode'

async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) {
    res.status(403).json({ success: false, error: 'Forbidden' })
    return null
  }
  return session
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // --- GET: list all families with linked member info ---
  if (req.method === 'GET') {
    const session = await requireAdmin(req, res)
    if (!session) return

    try {
      const families = await prisma.family.findMany({
        orderBy: { order: 'asc' },
        include: {
          user: { select: { id: true, email: true, name: true } },
          _count: { select: { assignments: true } },
        },
      })
      return void res.status(200).json({ success: true, data: families })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return void res.status(500).json({ success: false, error: message })
    }
  }

  // --- POST: add a new family ---
  if (req.method === 'POST') {
    const session = await requireAdmin(req, res)
    if (!session) return

    const { name } = req.body as { name?: string }
    if (!name?.trim()) {
      return void res.status(400).json({ success: false, error: 'Name is required' })
    }

    try {
      const existing = await prisma.family.findFirst({
        where: { name: { equals: name.trim(), mode: 'insensitive' } },
      })
      if (existing) {
        return void res.status(409).json({ success: false, error: `"${existing.name}" already exists` })
      }

      // Place new family at the end of the rotation
      const last = await prisma.family.findFirst({ orderBy: { order: 'desc' } })
      const order = (last?.order ?? 0) + 1

      // Generate a unique join code
      let joinCode = generateJoinCode()
      while (await prisma.family.findUnique({ where: { joinCode } })) {
        joinCode = generateJoinCode()
      }

      const family = await prisma.family.create({
        data: { name: name.trim(), joinCode, order, email: '', phone: '' },
      })
      return void res.status(201).json({ success: true, data: family })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return void res.status(500).json({ success: false, error: message })
    }
  }

  // --- PATCH: update a family's name or rotation order ---
  if (req.method === 'PATCH') {
    const session = await requireAdmin(req, res)
    if (!session) return

    const { id, name, order } = req.body as {
      id?: string
      name?: string
      order?: number
    }

    if (!id) {
      return void res.status(400).json({ success: false, error: 'id is required' })
    }

    try {
      const family = await prisma.family.update({
        where: { id },
        data: {
          ...(name?.trim() ? { name: name.trim() } : {}),
          ...(order !== undefined ? { order } : {}),
        },
      })
      return void res.status(200).json({ success: true, data: family })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return void res.status(500).json({ success: false, error: message })
    }
  }

  // --- DELETE: remove a family and clean up related data ---
  if (req.method === 'DELETE') {
    const session = await requireAdmin(req, res)
    if (!session) return

    const { id } = req.query as { id?: string }
    if (!id) {
      return void res.status(400).json({ success: false, error: 'id is required' })
    }

    try {
      await prisma.$transaction([
        // Unlink any user assigned to this family
        prisma.user.updateMany({ where: { familyId: id }, data: { familyId: null } }),
        // Remove week assignments
        prisma.weekAssignment.deleteMany({ where: { familyId: id } }),
        // Remove swap requests involving this family
        prisma.swap.deleteMany({ where: { OR: [{ fromFamilyId: id }, { toFamilyId: id }] } }),
        // Delete the family
        prisma.family.delete({ where: { id } }),
      ])
      return void res.status(200).json({ success: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return void res.status(500).json({ success: false, error: message })
    }
  }

  res.status(405).end()
}
