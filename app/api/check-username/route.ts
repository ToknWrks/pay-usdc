// app/api/check-username/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserByCustomUrl } from '@/lib/users'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Use searchParams directly instead of new URL(request.url)
    const username = request.nextUrl.searchParams.get('username')

    if (!username) {
      return NextResponse.json({ exists: false })
    }

    // Check if user exists with this custom URL
    const user = await getUserByCustomUrl(username)

    return NextResponse.json({ 
      exists: !!user,
      username: user?.customUrl 
    })
  } catch (error) {
    console.error('Error checking username:', error)
    return NextResponse.json({ exists: false })
  }
}