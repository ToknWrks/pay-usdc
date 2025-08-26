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

interface Batch {
  id: number
  senderAddress: string
  txHash: string
  totalAmount: string
  totalRecipients: number
  status: string
  createdAt: string
  confirmedAt?: string | null
  memo?: string | null
}

export function useTransactions(address?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [batches, setBatches] = useState<Batch[]>([]) // Add batches state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/transactions?address=${address}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      setTransactions(data.transactions || [])
      setBatches(data.batches || []) // Set batches data
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

  const refreshTransactions = () => {
    if (address) {
      fetchTransactions()
    }
  }

  useEffect(() => {
    if (address) {
      fetchTransactions()
    }
  }, [address])

  return {
    transactions,
    batches, // Return batches
    isLoading,
    error,
    fetchTransactions,
    createBatchTransaction,
    refreshTransactions: fetchTransactions,
  }
}