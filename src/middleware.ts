import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(request) {
    const token = request.nextauth.token
    const pathname = request.nextUrl.pathname
    if (pathname === "/login") return NextResponse.next()
    if (!token) return NextResponse.redirect(new URL("/login", request.url))
    const role = (token as any).role
    if (pathname.startsWith("/admin") && !["acsi_admin"].includes(role)) {
      return NextResponse.redirect(new URL("/mentor", request.url))
    }
    return NextResponse.next()
  },
  { callbacks: { authorized: ({ token }) => !!token } }
)

export const config = {
  matcher: ["/mentor/:path*", "/school-admin/:path*", "/admin/:path*", "/schools/:path*"],
}
