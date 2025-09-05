import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'

// Add the GET handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nobleAddress = searchParams.get('nobleAddress')

    if (!nobleAddress) {
      return NextResponse.json({ error: 'Noble address is required' }, { status: 400 })
    }

    console.log('🔍 GET: Looking for user with Noble address:', nobleAddress)

    // Find user by Noble address
    const existingUser = await db.select().from(users).where(
      eq(users.nobleAddress, nobleAddress)
    ).limit(1)

    console.log('🔍 GET: Query result:', existingUser)

    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = existingUser[0]
    console.log('✅ GET: Returning user data:', user)

    return NextResponse.json({ user })
  } catch (error) {
    console.error('❌ GET: Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== API Route Called ===')
    const body = await request.json()
    console.log('API received full body:', body)
    console.log('Noble address from body:', body.nobleAddress)
    
    const { nobleAddress } = body

    if (!nobleAddress) {
      console.log('❌ No Noble address provided')
      return NextResponse.json({ error: 'Noble address is required' }, { status: 400 })
    }

    console.log('✅ Noble address received:', nobleAddress)

    // Check if user already exists with this Noble address
    console.log('🔍 Checking for existing user...')
    const existingUser = await db.select().from(users).where(
      eq(users.nobleAddress, nobleAddress)
    ).limit(1)

    console.log('Existing user query result:', existingUser)

    if (existingUser.length > 0) {
      console.log('📝 Updating existing user:', existingUser[0].id)
      
      // Update last login time
      const updatedUser = await db.update(users)
        .set({
          updatedAt: new Date(),
          lastLoginAt: new Date(),
        })
        .where(eq(users.id, existingUser[0].id))
        .returning()

      console.log('✅ User updated:', updatedUser[0])
      return NextResponse.json({ user: updatedUser[0], isNew: false })
    } else {
      console.log('🆕 Creating new user with address:', nobleAddress)
      
      // Create new user
      const newUser = await db.insert(users).values({
        nobleAddress,
        lastLoginAt: new Date(),
      }).returning()

      console.log('✅ New user created:', newUser[0])
      return NextResponse.json({ user: newUser[0], isNew: true })
    }
  } catch (error) {
    console.error('💥 API Error creating/updating user:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}