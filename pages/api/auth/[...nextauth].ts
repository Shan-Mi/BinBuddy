import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const allowedEmails = ['shan.mi.fanfan@gmail.com', 'fanfang2014@gmail.com'] // Optional: control who can log in

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return allowedEmails.includes(user.email ?? '') || false
    },
    async session({ session }) {
      return session
    },
  },
})
