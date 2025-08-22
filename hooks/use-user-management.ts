'use client'

import { useState, useEffect } from 'react'
import { useCosmosWallet } from './use-cosmos-wallet'

interface User {
  id: number
  nobleAddress: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export function useUserManagement() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only Noble wallet matters
  const noble = useCosmosWallet('noble')

  const createOrUpdateUser = async () => {
    console.log('createOrUpdateUser called')
    console.log('Noble connected:', noble.isConnected, 'Address:', noble.address)

    if (!noble.address || !noble.isConnected) {
      console.log('No Noble address available, skipping user creation')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const userData = {
        nobleAddress: noble.address,
      }

      console.log('Sending user data:', userData)

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      console.log('API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error:', errorText)
        throw new Error(`Failed to create/update user: ${response.status}`)
      }

      const data = await response.json()
      console.log('API response data:', data)
      setUser(data.user)
      
      if (data.isNew) {
        console.log('New user created:', data.user)
      } else {
        console.log('User updated:', data.user)
      }

      return data.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error creating/updating user:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isLoading,
    error,
    createOrUpdateUser,
  }
}