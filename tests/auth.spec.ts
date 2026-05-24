import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/db'

test('unauthenticated user sees Sign in button', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})

test('unauthenticated user can still view the schedule', async ({ page }) => {
  await page.goto('/')
  // Schedule list loads even without auth
  await expect(page.getByText(/W\d+/)).toBeVisible({ timeout: 10_000 })
})

test('authenticated user lands on dashboard and sees their email', async ({ page, context }) => {
  const session = await loginAs(context)
  try {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Sign in' })).not.toBeVisible()
    await expect(page.getByText(session.email)).toBeVisible()
  } finally {
    await session.cleanup()
  }
})

test('authenticated user without a family sees Join Family button', async ({ page, context }) => {
  const session = await loginAs(context)
  try {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Join Family' })).toBeVisible()
  } finally {
    await session.cleanup()
  }
})

test('authenticated user with a family does not see Join Family button', async ({
  page,
  context,
}) => {
  const session = await loginAs(context, { withFamily: true })
  try {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Join Family' })).not.toBeVisible()
  } finally {
    await session.cleanup()
  }
})

test('sign out returns to page with Sign in button', async ({ page, context }) => {
  const session = await loginAs(context)
  try {
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible({ timeout: 10_000 })
  } finally {
    await session.cleanup()
  }
})

test('non-admin user does not see Admin button', async ({ page, context }) => {
  const session = await loginAs(context)
  try {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Admin' })).not.toBeVisible()
  } finally {
    await session.cleanup()
  }
})

test('admin user sees Admin button', async ({ page, context }) => {
  const session = await loginAs(context, { isAdmin: true })
  try {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Admin' })).toBeVisible()
  } finally {
    await session.cleanup()
  }
})
