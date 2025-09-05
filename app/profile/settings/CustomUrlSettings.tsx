// app/(default)/profile/settings/CustomUrlSettings.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useChain } from '@cosmos-kit/react'

interface CustomUrlSettingsProps {
  currentUrl?: string
  userId?: string
}

export default function CustomUrlSettings({ currentUrl, userId }: CustomUrlSettingsProps) {
  const [customUrl, setCustomUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'taken' | 'checking' | 'current' | null>(null)
  const { address: nobleAddress } = useChain('noble')

  // Auto-load current URL when component mounts or currentUrl changes
  useEffect(() => {
    console.log('CustomUrlSettings received currentUrl:', currentUrl) // Debug log
    
    if (currentUrl) {
      console.log('Setting customUrl to:', currentUrl) // Debug log
      setCustomUrl(currentUrl)
      setAvailabilityStatus('current')
    } else {
      console.log('No currentUrl provided, clearing field') // Debug log
      setCustomUrl('')
      setAvailabilityStatus(null)
    }
  }, [currentUrl])

  // Debounced availability check
  const checkAvailability = useCallback(async (url: string) => {
    if (!url || url.length < 3) {
      setAvailabilityStatus(null)
      return
    }

    // If it's the current URL, mark as current
    if (url === currentUrl) {
      setAvailabilityStatus('current')
      return
    }

    setIsCheckingAvailability(true)
    setAvailabilityStatus('checking')

    try {
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(url)}`)
      const data = await response.json()

      if (data.exists) {
        setAvailabilityStatus('taken')
      } else {
        setAvailabilityStatus('available')
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailabilityStatus(null)
    } finally {
      setIsCheckingAvailability(false)
    }
  }, [currentUrl])

  // Debounce the availability check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (customUrl && customUrl !== currentUrl) {
        checkAvailability(customUrl)
      }
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [customUrl, currentUrl, checkAvailability])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setCustomUrl(value)
    setError('')
    setSuccess(false)

    // Reset availability status when typing
    if (value !== currentUrl) {
      setAvailabilityStatus(null)
    }
  }

  const getAvailabilityDisplay = () => {
    switch (availabilityStatus) {
      case 'checking':
        return (
          <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm mt-1">
            <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full mr-2"></div>
            Checking availability...
          </div>
        )
      case 'available':
        return (
          <div className="flex items-center text-green-600 dark:text-green-400 text-sm mt-1">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Available! payusdc.app/{customUrl}
          </div>
        )
      case 'taken':
        return (
          <div className="flex items-center text-red-600 dark:text-red-400 text-sm mt-1">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            This URL is already taken
          </div>
        )
      case 'current':
        return (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mt-1">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            This is your current URL
          </div>
        )
      default:
        return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nobleAddress) {
      setError('Please connect your Noble wallet first')
      return
    }

    if (customUrl === currentUrl) {
      setError('This is already your current URL')
      return
    }

    if (availabilityStatus === 'taken') {
      setError('This URL is not available')
      return
    }

    if (availabilityStatus !== 'available') {
      setError('Please wait for availability check to complete')
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
        setAvailabilityStatus('current')
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

  const isFormValid = customUrl.length >= 3 && 
                     customUrl !== currentUrl && 
                     availabilityStatus === 'available' && 
                     !isCheckingAvailability

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Custom Profile URL</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Choose your custom URL
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">payusdc.app/</span>
            <div className="flex-1 relative">
              <input
                type="text"
                value={customUrl}
                onChange={handleInputChange}
                placeholder={currentUrl || "your-username"} // Dynamic placeholder
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  availabilityStatus === 'available' 
                    ? 'border-green-300 dark:border-green-600' 
                    : availabilityStatus === 'taken'
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                pattern="[a-z0-9-]{3,30}"
                minLength={3}
                maxLength={30}
                required
              />
              
              {/* Loading indicator inside input */}
              {isCheckingAvailability && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            3-30 characters. Letters, numbers, and hyphens only.
          </p>
          
          {/* Availability Status */}
          {getAvailabilityDisplay()}
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
          disabled={!isFormValid || isLoading || !nobleAddress}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Updating...' : customUrl === currentUrl ? 'No Changes' : 'Update URL'}
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
