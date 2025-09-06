'use client'

import { useState, useEffect } from 'react'

interface RecipientList {
  id: number
  ownerAddress: string
  name: string
  description?: string
  listType: 'fixed' | 'percentage' | 'variable' // Add variable
  totalRecipients: number
  totalAmount?: string // Add total amount
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface SavedRecipient {
  id: number
  listId: number
  name?: string
  address: string
  percentage?: string
  amount?: string // Add individual amount
  order: number
  createdAt: string
}

export function useRecipientLists(ownerAddress?: string) {
  const [lists, setLists] = useState<RecipientList[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLists = async () => {
    if (!ownerAddress) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ ownerAddress })
      const response = await fetch(`/api/recipient-lists?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch lists')
      }

      const data = await response.json()
      setLists(data.lists || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching lists:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createList = async (listData: {
    name: string
    description?: string
    listType?: 'fixed' | 'percentage' | 'variable'
    recipients: Array<{
      name?: string
      address: string
      percentage?: string
      amount?: string // Add amount field
    }>
  }) => {
    if (!ownerAddress) throw new Error('No owner address')

    try {
      const response = await fetch('/api/recipient-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerAddress,
          ...listData,
          listType: listData.listType || 'fixed'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create list')
      }

      const data = await response.json()
      await fetchLists() // Refresh the lists
      return data.list
    } catch (error) {
      console.error('Error creating list:', error)
      throw error
    }
  }

  const loadList = async (listId: number) => {
    if (!ownerAddress) throw new Error('No owner address')

    try {
      const response = await fetch(`/api/recipient-lists/${listId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load list')
      }

      const data = await response.json()
      
      console.log('🔍 API returned list data:', data) // Debug log
      
      return {
        list: data.list, // Make sure this includes listType
        recipients: data.recipients
      }
    } catch (error) {
      console.error('Error loading list:', error)
      throw error
    }
  }

  const updateList = async (listId: number, listData: {
    name: string
    description?: string
    listType?: 'fixed' | 'percentage' | 'variable'
    recipients: Array<{
      name?: string
      address: string
      percentage?: string
      amount?: string // Add amount field
    }>
  }) => {
    try {
      const response = await fetch(`/api/recipient-lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listData)
      })

      if (!response.ok) {
        throw new Error('Failed to update list')
      }

      const data = await response.json()
      await fetchLists() // Refresh the lists
      return data.list
    } catch (error) {
      console.error('Error updating list:', error)
      throw error
    }
  }

  const deleteList = async (listId: number) => {
    try {
      const response = await fetch(`/api/recipient-lists/${listId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete list')
      }

      await fetchLists() // Refresh the lists
    } catch (error) {
      console.error('Error deleting list:', error)
      throw error
    }
  }

  useEffect(() => {
    if (ownerAddress) {
      fetchLists()
    }
  }, [ownerAddress])

  return {
    lists,
    isLoading,
    error,
    fetchLists,
    createList,
    loadList,
    updateList,
    deleteList,
  }
}