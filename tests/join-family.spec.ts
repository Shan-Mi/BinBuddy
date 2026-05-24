import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { loginAs, createTestFamily } from './helpers/db'

const prisma = new PrismaClient()

test('invalid join code shows an error', async ({ page, context }) => {
  const session = await loginAs(context)
  try {
    await page.goto('/')
    await page.getByRole('button', { name: 'Join Family' }).click()
    await page.getByLabel('Join Code').fill('invalid-code-xyz')
    await page.getByRole('button', { name: 'Join' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  } finally {
    await session.cleanup()
  }
})

test('valid join code joins the family and hides Join Family button', async ({ page, context }) => {
  const session = await loginAs(context)
  const family = await createTestFamily()
  try {
    await page.goto('/')
    await page.getByRole('button', { name: 'Join Family' }).click()
    await page.getByLabel('Join Code').fill(family.joinCode)
    await page.getByRole('button', { name: 'Join' }).click()

    // Success toast appears
    await expect(page.getByText(/joined/i)).toBeVisible({ timeout: 8_000 })

    // Join Family button disappears once linked
    await expect(page.getByRole('button', { name: 'Join Family' })).not.toBeVisible()
  } finally {
    await session.cleanup()
    await family.cleanup()
  }
})

test('joining a family that already has a member is rejected', async ({ page, context }) => {
  const family = await createTestFamily()

  // Directly link a DB user to that family slot — no browser session needed
  const occupant = await prisma.user.create({
    data: {
      email: `occupant-${randomUUID()}@binbuddy.test`,
      emailVerified: new Date(),
      familyId: family.id,
    },
  })

  const session = await loginAs(context)
  try {
    await page.goto('/')
    await page.getByRole('button', { name: 'Join Family' }).click()
    await page.getByLabel('Join Code').fill(family.joinCode)
    await page.getByRole('button', { name: 'Join' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  } finally {
    await session.cleanup()
    await prisma.user.update({ where: { id: occupant.id }, data: { familyId: null } }).catch(() => {})
    await prisma.user.delete({ where: { id: occupant.id } }).catch(() => {})
    await family.cleanup()
  }
})
