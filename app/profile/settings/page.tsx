// app/(default)/profile/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useChain } from '@cosmos-kit/react'
import CustomUrlSettings from './CustomUrlSettings'
import { getUserByNobleAddress } from '@/lib/users'

export default function ProfileSettingsPage() {
  const { address: nobleAddress, isWalletConnected } = useChain('noble')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchUserData() {
      if (!nobleAddress) return
      
      setIsLoading(true)
      try {
        // You might need to create an API endpoint for this
        const response = await fetch(`/api/user?nobleAddress=${nobleAddress}`)
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (nobleAddress) {
      fetchUserData()
    }
  }, [nobleAddress])
  
  if (!isWalletConnected) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            Please connect your Noble wallet to manage your profile settings.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your profile and custom URL
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Profile Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Noble Address
              </label>
              <input
                type="text"
                value={nobleAddress || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Custom URL Settings */}
        <CustomUrlSettings 
          currentUrl={user?.customUrl} 
          userId={user?.id?.toString()} 
        />
      </div>
    </div>
  )
}

