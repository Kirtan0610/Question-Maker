import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const adminAuthCookie = request.cookies.get('adminAuth')?.value

  // Protect admin routes
  if (path.startsWith('/admin') && !path.includes('/admin')) {
    if (!adminAuthCookie) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}
