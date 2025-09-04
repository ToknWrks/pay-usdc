// components/profile-actions.tsx
'use client'

import { useState } from 'react'

interface ProfileActionsProps {
  username: string
  nobleAddress: string
}

export default function ProfileActions({ username, nobleAddress }: ProfileActionsProps) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendUSDC = async () => {
    if (!amount) return
    
    setIsLoading(true)
    try {
      // TODO: Implement USDC sending logic
      console.log('Sending', amount, 'USDC to', nobleAddress, 'with note:', note)
      alert(`Would send ${amount} USDC to @${username}`)
    } catch (error) {
      console.error('Error sending USDC:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://pay-usdc.app/${username}`)
      // You could add a toast notification here
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleContact = () => {
    alert('Contact feature coming soon!')
  }

  return (
    <>
      {/* Action Buttons */}
      <div className="flex space-x-2 sm:mb-2">
        <button 
          onClick={handleSendUSDC}
          className="btn-sm bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="fill-current shrink-0 mr-2" width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 0C3.6 0 0 3.1 0 7s3.6 7 8 7h.6l5.4 2v-4.4c1.2-1.2 2-2.8 2-4.6 0-3.9-3.6-7-8-7Zm4 10.8v2.3L8.9 12H8c-3.3 0-6-2.2-6-5s2.7-5 6-5 6 2.2 6 5c0 2.2-2 3.8-2 3.8Z" />
          </svg>
          <span>Send USDC</span>
        </button>
        <button 
          onClick={handleContact}
          className="btn-sm bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="fill-current shrink-0 mr-2" width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z"/>
          </svg>
          <span>Contact</span>
        </button>
      </div>

      {/* Payment Form */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
            Quick USDC Transfer
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Send USDC directly to this user's Noble wallet instantly.
          </p>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Amount in USDC"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button 
              onClick={handleSendUSDC}
              disabled={!amount || isLoading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
            >
              {isLoading ? 'Sending...' : 'Send USDC'}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
            Recipient Info
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Username:</span>
              <span className="ml-2 font-mono">@{username}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Address:</span>
              <span className="ml-2 font-mono text-xs break-all">{nobleAddress}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Network:</span>
              <span className="ml-2">Noble (Cosmos)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Profile */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            value={`pay-usdc.app/${username}`}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-mono text-sm"
          />
        </div>
        <button 
          onClick={handleCopyLink}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Copy Link
        </button>
      </div>
    </>
  )
}