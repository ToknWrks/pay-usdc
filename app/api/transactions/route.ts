import { NextRequest, NextResponse } from 'next/server'
import { db, transactions, batches } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

// Create a batch transaction with multiple recipients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating batch transaction:', body)
    
    const { 
      senderAddress, 
      recipients, // Array of {name?, address, amount}
      txHash, 
      totalAmount,
      memo,
      status = 'pending' 
    } = body

    if (!senderAddress || !recipients || !Array.isArray(recipients) || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create batch record first
    const newBatch = await db.insert(batches).values({
      senderAddress,
      txHash,
      totalAmount: totalAmount.toString(),
      totalRecipients: recipients.length,
      status,
      memo,
    }).returning()

    const batchId = newBatch[0].id

    // Create individual transaction records
    const transactionRecords = await db.insert(transactions).values(
      recipients.map((recipient: any) => ({
        batchId,
        senderAddress,
        recipientName: recipient.name || null,
        recipientAddress: recipient.address,
        amount: recipient.amount,
        status,
      }))
    ).returning()

    console.log('Batch transaction created:', {
      batch: newBatch[0],
      transactions: transactionRecords
    })

    return NextResponse.json({ 
      batch: newBatch[0], 
      transactions: transactionRecords 
    })
  } catch (error) {
    console.error('Error creating batch transaction:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// Get transactions with batch information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 })
    }

    // Fetch transactions
    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.senderAddress, address))
      .orderBy(desc(transactions.createdAt))

    // Fetch batches
    const userBatches = await db
      .select()
      .from(batches)
      .where(eq(batches.senderAddress, address))
      .orderBy(desc(batches.createdAt))

    return NextResponse.json({ 
      transactions: userTransactions,
      batches: userBatches 
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}