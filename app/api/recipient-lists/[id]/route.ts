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

    // Get recipients with ALL fields including amount
    const recipients = await db
      .select({
        id: savedRecipients.id,
        listId: savedRecipients.listId,
        name: savedRecipients.name,
        address: savedRecipients.address,
        percentage: savedRecipients.percentage,
        amount: savedRecipients.amount, // Explicitly include amount
        order: savedRecipients.order,
        createdAt: savedRecipients.createdAt,
      })
      .from(savedRecipients)
      .where(eq(savedRecipients.listId, listId))
      .orderBy(savedRecipients.order)

    console.log('🔍 API returning recipients:', recipients) // Debug log

    return NextResponse.json({ 
      list: list[0], 
      recipients: recipients
    })
  } catch (error) {
    console.error('Error fetching recipient list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update a list and its recipients
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listId = parseInt(params.id)
    const body = await request.json()
    const { name, description, listType, recipients } = body

    // Calculate total amount for variable lists
    let totalAmount = null
    if (listType === 'variable') {
      totalAmount = recipients.reduce((sum: number, recipient: any) => {
        return sum + (parseFloat(recipient.amount) || 0)
      }, 0)
    }

    // Update the list
    await db.update(recipientLists)
      .set({
        name,
        description,
        listType,
        totalRecipients: recipients.length,
        totalAmount: totalAmount?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(recipientLists.id, listId))

    // Delete existing recipients
    await db.delete(savedRecipients).where(eq(savedRecipients.listId, listId))

    // Add updated recipients
    if (recipients.length > 0) {
      const recipientData = recipients.map((recipient: any, index: number) => ({
        listId,
        name: recipient.name || null,
        address: recipient.address,
        percentage: listType === 'percentage' ? (recipient.percentage || null) : null,
        amount: listType === 'variable' ? (recipient.amount || null) : null,
        order: index,
      }))

      await db.insert(savedRecipients).values(recipientData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating recipient list:', error)
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