// app/(default)/profile/settings/CustomUrlSettings.tsx
'use client'

import { useState } from 'react'
import { useChain } from '@cosmos-kit/react'

interface CustomUrlSettingsProps {
  currentUrl?: string
  userId?: string
}

export default function CustomUrlSettings({ currentUrl, userId }: CustomUrlSettingsProps) {
  const [customUrl, setCustomUrl] = useState(currentUrl || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { address: nobleAddress } = useChain('noble')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nobleAddress) {
      setError('Please connect your Noble wallet first')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/profile/custom-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customUrl: customUrl.toLowerCase().trim(),
          nobleAddress 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Optionally redirect to the new profile URL
        // window.location.href = `/${customUrl}`
      } else {
        setError(data.error || 'Failed to update custom URL')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Custom Profile URL</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Choose your custom URL
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">pay-usdc.app/</span>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="your-username"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              pattern="[a-z0-9-]{3,30}"
              minLength={3}
              maxLength={30}
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            3-30 characters. Letters, numbers, and hyphens only.
          </p>
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
            Custom URL updated! Your profile is now at: 
            <a href={`/${customUrl}`} className="underline ml-1 hover:text-green-700">
              pay-usdc.app/{customUrl}
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !customUrl.trim() || !nobleAddress}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Updating...' : 'Update URL'}
        </button>
        
        {!nobleAddress && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            Connect your Noble wallet to set a custom URL
          </p>
        )}
      </form>
    </div>
  )
}
