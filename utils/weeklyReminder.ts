import { prisma } from '../prisma/client'
import { getISOWeek, getISOWeekYear } from './isoWeek'
import { sendReminderEmail } from './emailUtils'

/**
 * Finds this week's assigned family and sends a bin-duty reminder email.
 * Call from /api/cron/weekly-reminder on Monday evenings.
 */
export async function runWeeklyReminder(): Promise<{
  sent: boolean
  familyName?: string
  email?: string
}> {
  const now = new Date()
  const week = getISOWeek(now)
  const year = getISOWeekYear(now)

  const assignment = await prisma.weekAssignment.findUnique({
    where: { week_year: { week, year } },
    include: {
      family: {
        include: { user: { select: { email: true } } },
      },
    },
  })

  if (!assignment) return { sent: false }

  const email = assignment.family.user?.email
  if (!email) return { sent: false }

  await sendReminderEmail({ to: email, familyName: assignment.family.name, weekNumber: week })

  return { sent: true, familyName: assignment.family.name, email }
}
