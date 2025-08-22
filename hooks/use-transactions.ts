'use client'

import { useState, useEffect } from 'react'

interface Transaction {
  id: number
  batchId?: number | null
  senderAddress: string
  recipientName?: string
  recipientAddress: string
  amount: string
  status: 'pending' | 'confirmed' | 'failed'
  createdAt: string
  // Batch information (may be null for legacy transactions)
  txHash?: string | null
  totalAmount?: string | null
  totalRecipients?: number | null
  batchStatus?: string | null
  blockHeight?: string | null
  confirmedAt?: string | null
  memo?: string | null
}

export function useTransactions(senderAddress?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    if (!senderAddress) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ senderAddress })
      const response = await fetch(`/api/transactions?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      console.log('Fetched transactions:', data.transactions) // Debug log
      setTransactions(data.transactions || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching transactions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createBatchTransaction = async (batchData: {
    senderAddress: string
    recipients: Array<{
      name?: string
      address: string
      amount: string
    }>
    txHash: string
    totalAmount: number
    memo?: string
    status?: string
  }) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData)
      })

      if (!response.ok) {
        throw new Error('Failed to create batch transaction')
      }

      const data = await response.json()
      
      // Refresh the transactions list
      await fetchTransactions()
      
      return data
    } catch (error) {
      console.error('Error creating batch transaction:', error)
      throw error
    }
  }

  useEffect(() => {
    if (senderAddress) {
      fetchTransactions()
    }
  }, [senderAddress])

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createBatchTransaction,
  }
}