import { test, expect } from '@playwright/test'
import { loginAs, createTestFamily } from './helpers/db'

test('non-admin is redirected away from /admin', async ({ page, context }) => {
  const session = await loginAs(context)
  try {
    await page.goto('/admin')
    await expect(page).not.toHaveURL('/admin')
  } finally {
    await session.cleanup()
  }
})

test('unauthenticated user is redirected away from /admin', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).not.toHaveURL('/admin')
})

test('admin can access /admin page', async ({ page, context }) => {
  const session = await loginAs(context, { isAdmin: true })
  try {
    await page.goto('/admin')
    await expect(page).toHaveURL('/admin')
    await expect(page.getByText('Family Rotation')).toBeVisible()
  } finally {
    await session.cleanup()
  }
})

test('admin can add a new family', async ({ page, context }) => {
  const session = await loginAs(context, { isAdmin: true })
  const uniqueName = `House-${Date.now()}`
  try {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Add Family' }).click()
    await page.getByLabel('House / Family name').fill(uniqueName)
    await page.getByRole('button', { name: 'Add' }).click()

    // New family appears in the table
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 8_000 })
  } finally {
    // Clean up via the UI then DB
    const { prisma } = await import('./helpers/db')
    const family = await prisma.family.findFirst({ where: { name: uniqueName } })
    if (family) {
      await prisma.weekAssignment.deleteMany({ where: { familyId: family.id } })
      await prisma.family.delete({ where: { id: family.id } }).catch(() => {})
    }
    await session.cleanup()
  }
})

test('adding a duplicate family name is rejected', async ({ page, context }) => {
  const family = await createTestFamily()
  const session = await loginAs(context, { isAdmin: true })
  try {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Add Family' }).click()
    await page.getByLabel('House / Family name').fill(family.name)
    await page.getByRole('button', { name: 'Add' }).click()

    // Error toast appears
    await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 8_000 })
  } finally {
    await session.cleanup()
    await family.cleanup()
  }
})

test('admin can edit a family name', async ({ page, context }) => {
  const family = await createTestFamily()
  const session = await loginAs(context, { isAdmin: true })
  const newName = `Edited-${Date.now()}`
  try {
    await page.goto('/admin')
    // Find the row and click its Edit button
    const row = page.getByRole('row', { name: new RegExp(family.name) })
    await row.getByRole('button', { name: 'Edit' }).click()
    await page.getByLabel('House / Family name').fill(newName)
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText(newName)).toBeVisible({ timeout: 8_000 })
  } finally {
    const { prisma } = await import('./helpers/db')
    // Update name back so cleanup works by id
    await prisma.family.update({ where: { id: family.id }, data: { name: family.name } }).catch(() => {})
    await session.cleanup()
    await family.cleanup()
  }
})

test('admin can delete a family', async ({ page, context }) => {
  const family = await createTestFamily()
  const session = await loginAs(context, { isAdmin: true })
  try {
    await page.goto('/admin')
    const row = page.getByRole('row', { name: new RegExp(family.name) })
    await row.getByRole('button', { name: 'Remove' }).click()
    // Confirm in the dialog
    await page.getByRole('button', { name: 'Remove' }).last().click()

    await expect(page.getByText(family.name)).not.toBeVisible({ timeout: 8_000 })
  } finally {
    await session.cleanup()
    await family.cleanup() // no-op if already deleted
  }
})
