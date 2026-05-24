import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import type { BrowserContext } from '@playwright/test'

const prisma = new PrismaClient()

/**
 * Creates a real User + Session in the DB and sets the session cookie on the
 * browser context — simulates a logged-in user without going through OAuth.
 */
export async function loginAs(
  context: BrowserContext,
  opts: { isAdmin?: boolean; withFamily?: boolean } = {}
) {
  const email = `test-${randomUUID()}@binbuddy.test`

  let familyId: string | undefined
  if (opts.withFamily) {
    const family = await prisma.family.create({
      data: {
        name: `TestFamily-${randomUUID().slice(0, 6)}`,
        joinCode: `tf-${randomUUID().slice(0, 8)}`,
        order: 99,
        email: '',
        phone: '',
      },
    })
    familyId = family.id
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: 'Test User',
      emailVerified: new Date(),
      isAdmin: opts.isAdmin ?? false,
      ...(familyId ? { familyId } : {}),
    },
  })

  const sessionToken = randomUUID()
  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: sessionToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ])

  return {
    userId: user.id,
    familyId,
    email,
    async cleanup() {
      await prisma.session.deleteMany({ where: { userId: user.id } })
      await prisma.user.update({ where: { id: user.id }, data: { familyId: null } }).catch(() => {})
      if (familyId) {
        await prisma.weekAssignment.deleteMany({ where: { familyId } })
        await prisma.swap.deleteMany({
          where: { OR: [{ fromFamilyId: familyId }, { toFamilyId: familyId }] },
        })
        await prisma.family.delete({ where: { id: familyId } }).catch(() => {})
      }
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {})
    },
  }
}

/**
 * Creates a temporary Family for join-code tests. Call cleanup() when done.
 */
export async function createTestFamily() {
  const joinCode = `tf-${randomUUID().slice(0, 8)}`
  const family = await prisma.family.create({
    data: {
      name: `TestFamily-${joinCode}`,
      joinCode,
      order: 98,
      email: '',
      phone: '',
    },
  })
  return {
    id: family.id,
    name: family.name,
    joinCode: family.joinCode,
    async cleanup() {
      await prisma.user.updateMany({ where: { familyId: family.id }, data: { familyId: null } })
      await prisma.weekAssignment.deleteMany({ where: { familyId: family.id } })
      await prisma.swap.deleteMany({
        where: { OR: [{ fromFamilyId: family.id }, { toFamilyId: family.id }] },
      })
      await prisma.family.delete({ where: { id: family.id } }).catch(() => {})
    },
  }
}

export { prisma }
