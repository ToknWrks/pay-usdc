import { NextRequest, NextResponse } from 'next/server'
import { db, contacts } from '@/lib/db'
import { eq, desc, ilike, or, and } from 'drizzle-orm'

// Get all contacts for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerAddress = searchParams.get('ownerAddress')
    const search = searchParams.get('search')

    if (!ownerAddress) {
      return NextResponse.json({ error: 'Owner address required' }, { status: 400 })
    }

    let query = db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.ownerAddress, ownerAddress),
          search
            ? or(
                ilike(contacts.name, `%${search}%`),
                ilike(contacts.address, `%${search}%`),
                ilike(contacts.description, `%${search}%`),
                ilike(contacts.tags, `%${search}%`)
              )
            : undefined
        )
      )

    const contactsList = await query.orderBy(desc(contacts.updatedAt))

    return NextResponse.json({ contacts: contactsList })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create a new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ownerAddress, name, address, email, phone, description, tags } = body

    if (!ownerAddress || !name || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate Noble address
    if (!address.startsWith('noble1') || address.length < 39 || address.length > 45) {
      return NextResponse.json({ error: 'Invalid Noble address' }, { status: 400 })
    }

    // Check for duplicate address for this user
    const existing = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.ownerAddress, ownerAddress),
          eq(contacts.address, address)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Contact with this address already exists' }, { status: 400 })
    }

    const newContact = await db.insert(contacts).values({
      ownerAddress,
      name,
      address,
      email: email || null,
      phone: phone || null,
      description: description || null,
      tags: tags || null,
    }).returning()

    return NextResponse.json({ contact: newContact[0] })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}