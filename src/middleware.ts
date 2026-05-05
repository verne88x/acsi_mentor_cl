import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth(async (request) => {
  const session = request.auth
  const pathname = request.nextUrl.pathname
  const protectedRoutes = ['/mentor', '/school-admin', '/admin', '/schools']
  const isProtected = protectedRoutes.some(r => pathname.startsWith(r))
  if (isProtected && !session) return NextResponse.redirect(new URL('/login', request.url))
  if (pathname === '/login' && session) {
    const role = (session.user as any)?.role
    if (role === 'mentor') return NextResponse.redirect(new URL('/mentor', request.url))
    if (role === 'school_admin') return NextResponse.redirect(new URL('/school-admin', request.url))
    if (role === 'acsi_admin') return NextResponse.redirect(new URL('/admin', request.url))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/login', '/mentor/:path*', '/school-admin/:path*', '/admin/:path*', '/schools/:path*'],
}
