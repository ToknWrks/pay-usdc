import { NextRequest, NextResponse } from 'next/server'
import { db, contacts } from '@/lib/db'
import { eq } from 'drizzle-orm'

// Get a specific contact
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseInt(params.id)

    const contact = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1)

    if (contact.length === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({ contact: contact[0] })
  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update a contact
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseInt(params.id)
    const body = await request.json()
    const { name, address, email, phone, description, tags } = body

    if (!name || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate Noble address
    if (!address.startsWith('noble1') || address.length < 39 || address.length > 45) {
      return NextResponse.json({ error: 'Invalid Noble address' }, { status: 400 })
    }

    const updatedContact = await db
      .update(contacts)
      .set({
        name,
        address,
        email: email || null,
        phone: phone || null,
        description: description || null,
        tags: tags || null,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, contactId))
      .returning()

    if (updatedContact.length === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({ contact: updatedContact[0] })
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete a contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseInt(params.id)

    await db.delete(contacts).where(eq(contacts.id, contactId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}