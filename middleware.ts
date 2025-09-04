// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔍 Middleware checking:', pathname) // DEBUG LOG
  
  // Skip API routes, static files, and Next.js internal routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname === '/'
  ) {
    console.log('⏭️ Skipping:', pathname) // DEBUG LOG
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
    console.log('🚫 Reserved route:', pathname) // DEBUG LOG
    return NextResponse.next()
  }

  // Extract potential username (remove leading slash)
  const username = pathname.slice(1)
  console.log('👤 Checking username:', username) // DEBUG LOG
  
  // Check if username exists in database
  try {
    const apiUrl = `${request.nextUrl.origin}/api/check-username?username=${username}`
    console.log('🌐 API call:', apiUrl) // DEBUG LOG
    
    const response = await fetch(apiUrl)
    
    if (response.ok) {
      const data = await response.json()
      console.log('📊 API response:', data) // DEBUG LOG
      
      if (data.exists) {
        const rewriteUrl = `/profile/${username}`
        console.log('✅ Rewriting to:', rewriteUrl) // DEBUG LOG
        return NextResponse.rewrite(new URL(rewriteUrl, request.url))
      }
    }
  } catch (error) {
    console.error('❌ Error checking username:', error)
  }

  console.log('🚫 Username not found, showing 404') // DEBUG LOG
  return NextResponse.next() // This will show the regular 404 page
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}