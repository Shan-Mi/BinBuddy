import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { sendMagicLink } from '../send-magic-link'
import { prisma } from '../../../prisma/client'

// const allowedEmails = ['shan.mi.fanfan@gmail.com', 'fanfang2014@gmail.com'] // Optional: control who can log in

export const authOptions = {
  providers: [
    EmailProvider({
      server: {
        host: 'smtp.sendgrid.net', // SMTP host for SendGrid
        port: 587, // SMTP port for SendGrid
        auth: {
          user: 'apikey', // For SendGrid, use 'apikey' as the username
          pass: process.env.SENDGRID_API_KEY, // Use your SendGrid API key here
        },
      },
      from: process.env.SENDGRID_EMAIL_FROM, // Email to be used as sender
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        // Send the magic link email via SendGrid
        await sendMagicLink(email, url)
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  // callbacks: {
  //   async signIn({ user }) {
  //     // Only allow sign-in for specific email addresses
  //     return allowedEmails.includes(user.email ?? '') || false
  //   },
  //   async session({ session }) {
  //     return session
  //   },
  // },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for session management
}

export default NextAuth(authOptions)
