import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendMagicLink = async (email: string, url: string) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_EMAIL_FROM, // Use your verified email address here
    subject: 'Your Magic Link',
    text: `Click here to sign in: ${url}`,
    html: `<strong>Click here to sign in: <a href="${url}">Sign in</a></strong>`,
  }

  try {
    await sgMail.send(msg)
    console.log('Magic link sent to', email)
  } catch (error) {
    console.error('Error sending email', error)
  }
}
