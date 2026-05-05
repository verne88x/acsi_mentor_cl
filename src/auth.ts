import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import sql from '@/lib/db'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const users = await sql`
          SELECT u.id, u.email, u.password_hash, p.full_name, p.role
          FROM users u JOIN profiles p ON p.id = u.id
          WHERE u.email = ${credentials.email as string}
        `
        const user = users[0]
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password as string, user.password_hash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.full_name, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as any).role }
      return token
    },
    session({ session, token }) {
      if (session.user) { session.user.id = token.id as string; (session.user as any).role = token.role }
      return session
    },
  },
})
