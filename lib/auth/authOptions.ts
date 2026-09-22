import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { realDb } from '@/lib/db/real'

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const customer = await realDb.customer.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!customer) return null

        const valid = await bcrypt.compare(credentials.password, customer.passwordHash)
        if (!valid) return null

        return {
          id: customer.id,
          name: customer.fullName,
          email: customer.email,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id: string }).id = token.id as string
      }
      return session
    },
  },
}
