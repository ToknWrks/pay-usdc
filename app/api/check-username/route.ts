// app/api/check-username/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserByCustomUrl } from '@/lib/users'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

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