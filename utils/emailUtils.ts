import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const FROM = process.env.SENDGRID_EMAIL_FROM!

export async function sendSwapEmail(
  to: string,
  requesterName: string,
  weekNumber: number,
  year: number
): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  await sgMail.send({
    to,
    from: FROM,
    subject: `BinBuddy: Swap Request for Week ${weekNumber}`,
    html: `
      <p>Hi there,</p>
      <p><strong>${requesterName}</strong> wants to swap bin duty with you for week ${weekNumber}/${year}.</p>
      <p>Log in to approve or reject: <a href="${appUrl}">${appUrl}</a></p>
    `,
  })
}

export async function sendReminderEmail({
  to,
  familyName,
  weekNumber,
  message,
}: {
  to: string
  familyName: string
  weekNumber: number
  message?: string
}): Promise<void> {
  const body =
    message ??
    `Hi ${familyName}, it's your week for bin duty (week ${weekNumber}). Please put the bins out before Tuesday at 6:00 AM. Thanks! 🗑️`

  await sgMail.send({
    to,
    from: FROM,
    subject: `BinBuddy: Bin Duty Reminder — Week ${weekNumber}`,
    html: `<p>${body}</p>`,
  })
}
