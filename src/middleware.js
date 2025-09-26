import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  console.log('pathname', pathname)

  const protectedRoutePatterns = [
    '/en/asset-managements/',
    '/en/assetAudit/',

    '/en/assetreports/',
    '/en/auditConfirmation/',
    '/en/masters/',
    '/en/ticket/',
    '/en/role-permissions',
    '/en/config/',
    '/en/dashboard/'
  ]

  // Check if current path matches any protected pattern
  const isProtectedRoute = protectedRoutePatterns.some(pattern => {
    if (pattern.endsWith('/')) {
      return pathname.startsWith(pattern)
    }

    return pathname === pattern
  })

  // Protect all matching routes
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/en/login', request.url))
    }

    return NextResponse.next()
  }

  // Redirect from login page if already logged in
  if (pathname === '/en/login' && token) {
    return NextResponse.redirect(new URL('/en/dashboard', request.url))
  }

  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/en/dashboard', request.url))
  }

  if (pathname === '/login' && !token) {
    return NextResponse.redirect(new URL('/en/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/en/login',
    '/en/dashboard',

    '/login',
    '/en/asset-managements/:path*',
    '/en/assetAudit/:path*',
    '/en/assetreports/:path*',
    '/en/auditConfirmation/:path*',
    '/en/masters/:path*',
    '/en/ticket/:path*',
    '/en/role-permissions/:path*',
    '/en/config/:path*'
  ]
}
