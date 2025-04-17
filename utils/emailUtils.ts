import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendSwapEmail(
  to: string,
  requester: string,
  week: string
) {
  const approvalUrl = `https://your-app.com/approve?week=${week}&from=${requester}`

  await sgMail.send({
    to,
    from: 'binbuddy@example.com',
    subject: `Swap Request for Week ${week}`,
    text: `${requester} wants to swap garbage duty for week ${week}. Approve here: ${approvalUrl}`,
  })
}
