import { NextRequest, NextResponse } from 'next/server'
import { db, recipientLists, savedRecipients } from '@/lib/db'
import { eq } from 'drizzle-orm'

// Get a specific list with recipients
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listId = parseInt(params.id)

    // Get the list
    const list = await db
      .select()
      .from(recipientLists)
      .where(eq(recipientLists.id, listId))
      .limit(1)

    if (list.length === 0) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    // Get recipients
    const recipients = await db
      .select()
      .from(savedRecipients)
      .where(eq(savedRecipients.listId, listId))
      .orderBy(savedRecipients.order)

    return NextResponse.json({ 
      list: list[0], 
      recipients 
    })
  } catch (error) {
    console.error('Error fetching recipient list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete a list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listId = parseInt(params.id)

    // Delete recipients first (foreign key constraint)
    await db.delete(savedRecipients).where(eq(savedRecipients.listId, listId))
    
    // Delete the list
    await db.delete(recipientLists).where(eq(recipientLists.id, listId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recipient list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}