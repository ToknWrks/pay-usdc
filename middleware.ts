// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip API routes, static files, and Next.js internal routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Skip reserved routes
  const reservedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/contacts',
    '/pay',
    '/wallets',
    '/admin',
    '/auth',
    '/login',
    '/signup'
  ]

  if (reservedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Extract potential username (remove leading slash)
  const username = pathname.slice(1)
  
  // Check if username exists in database
  try {
    // Use request.nextUrl.origin instead of constructing from request.url
    const apiUrl = `${request.nextUrl.origin}/api/check-username?username=${username}`
    
    const response = await fetch(apiUrl)
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.exists) {
        // Rewrite to profile page
        return NextResponse.rewrite(new URL(`/profile/${username}`, request.url))
      }
    }
  } catch (error) {
    console.error('Error checking username:', error)
  }

  // If username doesn't exist, continue to 404
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}