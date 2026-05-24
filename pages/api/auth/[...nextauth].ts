import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          credentials.email !== process.env.ADMIN_EMAIL ||
          credentials.password !== process.env.ADMIN_PASSWORD
        ) {
          return null
        }
        // Upsert so the account always exists, even on a fresh DB
        const user = await prisma.user.upsert({
          where: { email: credentials.email },
          update: { isAdmin: true },
          create: {
            email: credentials.email,
            name: 'Admin',
            isAdmin: true,
            emailVerified: new Date(),
          },
        })
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Populate on first sign-in
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { familyId: true, isAdmin: true },
        })
        token.id = user.id
        token.familyId = dbUser?.familyId ?? null
        token.isAdmin = dbUser?.isAdmin ?? false
      }
      // Re-fetch when updateSession() is called (e.g. after joining a family)
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { familyId: true, isAdmin: true },
        })
        token.familyId = dbUser?.familyId ?? null
        token.isAdmin = dbUser?.isAdmin ?? false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.familyId = token.familyId
        session.user.isAdmin = token.isAdmin
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
