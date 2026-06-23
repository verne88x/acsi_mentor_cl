import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(request) {
    const token = request.nextauth.token
    const pathname = request.nextUrl.pathname
    if (!token) return NextResponse.redirect(new URL("/login", request.url))
    const role = (token as any).role

    if (pathname === "/") {
      if (role === "acsi_admin") return NextResponse.redirect(new URL("/admin", request.url))
      if (role === "regional_manager" || role === "mentor") return NextResponse.redirect(new URL("/mentor", request.url))
      if (role === "school_admin") return NextResponse.redirect(new URL("/school-admin", request.url))
    }

    if (pathname.startsWith("/admin") && role !== "acsi_admin" && !(pathname === "/admin/schools/new" && role === "regional_manager")) {
      if (role === "regional_manager" || role === "mentor") return NextResponse.redirect(new URL("/mentor", request.url))
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
  },
  { callbacks: { authorized: ({ token }) => !!token } }
)

export const config = {
  matcher: ["/", "/mentor/:path*", "/school-admin/:path*", "/admin/:path*", "/schools/:path*"],
}
