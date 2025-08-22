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
    const senderAddress = searchParams.get('senderAddress')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!senderAddress) {
      return NextResponse.json({ error: 'Sender address required' }, { status: 400 })
    }

    // Get transactions with optional batch information (handles legacy transactions)
    const transactionList = await db
      .select({
        id: transactions.id,
        batchId: transactions.batchId,
        senderAddress: transactions.senderAddress,
        recipientName: transactions.recipientName,
        recipientAddress: transactions.recipientAddress,
        amount: transactions.amount,
        status: transactions.status,
        createdAt: transactions.createdAt,
        // Batch information (nullable for legacy transactions)
        txHash: batches.txHash,
        totalAmount: batches.totalAmount,
        totalRecipients: batches.totalRecipients,
        batchStatus: batches.status,
        blockHeight: batches.blockHeight,
        confirmedAt: batches.confirmedAt,
        memo: batches.memo,
      })
      .from(transactions)
      .leftJoin(batches, eq(transactions.batchId, batches.id)) // LEFT JOIN handles legacy transactions
      .where(eq(transactions.senderAddress, senderAddress))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)

    console.log('Fetching transactions for:', senderAddress)
    console.log('Query result:', transactionList)

    return NextResponse.json({ transactions: transactionList })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}