import { NextRequest, NextResponse } from 'next/server'
import { db, recipientLists, savedRecipients } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

// Get all lists for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerAddress = searchParams.get('ownerAddress')

    if (!ownerAddress) {
      return NextResponse.json({ error: 'Owner address required' }, { status: 400 })
    }

    const lists = await db
      .select()
      .from(recipientLists)
      .where(eq(recipientLists.ownerAddress, ownerAddress))
      .orderBy(desc(recipientLists.updatedAt))

    return NextResponse.json({ lists })
  } catch (error) {
    console.error('Error fetching recipient lists:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create a new list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ownerAddress, name, description, listType = 'fixed', recipients } = body

    if (!ownerAddress || !name || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate totals based on list type
    const totalRecipients = recipients.length
    let totalAmount = null

    if (listType === 'variable') {
      totalAmount = recipients.reduce((sum, recipient) => {
        return sum + (parseFloat(recipient.amount) || 0)
      }, 0)
    }

    // Create the list
    const newList = await db.insert(recipientLists).values({
      ownerAddress,
      name,
      description,
      listType,
      totalRecipients,
      totalAmount: totalAmount?.toString(),
    }).returning()

    const listId = newList[0].id

    // Add recipients with proper fields based on list type
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

    return NextResponse.json({ list: newList[0] })
  } catch (error) {
    console.error('Error creating recipient list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}