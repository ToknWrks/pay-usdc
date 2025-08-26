'use client'

import { useState, useEffect } from 'react'

interface Contact {
  id: number
  ownerAddress: string
  name: string
  address: string
  email?: string // Add email
  phone?: string // Add phone
  description?: string
  tags?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function useContacts(ownerAddress?: string) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = async (search?: string) => {
    if (!ownerAddress) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ ownerAddress })
      if (search) params.append('search', search)

      const response = await fetch(`/api/contacts?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch contacts')
      }

      const data = await response.json()
      setContacts(data.contacts || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching contacts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createContact = async (contactData: {
    name: string
    address: string
    email?: string
    phone?: string
    description?: string
    tags?: string
  }) => {
    if (!ownerAddress) throw new Error('No owner address')

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerAddress,
          ...contactData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create contact')
      }

      const data = await response.json()
      await fetchContacts()
      return data.contact
    } catch (error) {
      console.error('Error creating contact:', error)
      throw error
    }
  }

  const updateContact = async (contactId: number, contactData: {
    name: string
    address: string
    email?: string
    phone?: string
    description?: string
    tags?: string
  }) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update contact')
      }

      const data = await response.json()
      await fetchContacts()
      return data.contact
    } catch (error) {
      console.error('Error updating contact:', error)
      throw error
    }
  }

  const deleteContact = async (contactId: number) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete contact')
      }

      await fetchContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
      throw error
    }
  }

  useEffect(() => {
    if (ownerAddress) {
      fetchContacts()
    }
  }, [ownerAddress])

  return {
    contacts,
    isLoading,
    error,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  }
}