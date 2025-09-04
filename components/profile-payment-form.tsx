// components/profile-payment-form.tsx
'use client'

import { useState } from 'react'

interface PaymentFormProps {
  recipientAddress: string
  recipientUsername: string
}

export default function PaymentForm({ recipientAddress, recipientUsername }: PaymentFormProps) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setIsLoading(true)
    
    try {
      // TODO: Implement actual USDC sending logic
      console.log('Sending USDC:', { amount, note, recipientAddress })
      alert(`Sending ${amount} USDC to @${recipientUsername}`)
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in USDC"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        required
      />
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
      />
      <button 
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
      >
        {isLoading ? 'Sending...' : 'Send USDC'}
      </button>
    </form>
  )
}