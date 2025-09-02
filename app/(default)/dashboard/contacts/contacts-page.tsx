'use client'

import { useState, useEffect } from 'react'
import { useChain } from '@cosmos-kit/react'
import { useContacts } from '@/hooks/use-contacts'
import Link from 'next/link'

interface CreateContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (contactData: {
    name: string
    address: string
    email?: string
    phone?: string
    description?: string
    tags?: string
  }) => void
  isSaving: boolean
  initialData?: any // Add this prop
}

function CreateContactModal({ isOpen, onClose, onSave, isSaving, initialData }: CreateContactModalProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [addressError, setAddressError] = useState('')
  const [emailError, setEmailError] = useState('')

  const validateAddress = (addr: string) => {
    return addr.startsWith('noble1') && addr.length >= 39 && addr.length <= 45
  }

  const validateEmail = (email: string) => {
    return email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleAddressChange = (value: string) => {
    setAddress(value)
    if (value && !validateAddress(value)) {
      setAddressError('Invalid Noble address format')
    } else {
      setAddressError('')
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value && !validateEmail(value)) {
      setEmailError('Invalid email format')
    } else {
      setEmailError('')
    }
  }

  const handleSave = () => {
    if (name.trim() && address.trim() && validateAddress(address) && validateEmail(email)) {
      onSave({
        name: name.trim(),
        address: address.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        description: description.trim() || undefined,
        tags: tags.trim() || undefined
      })
      setName('')
      setAddress('')
      setEmail('')
      setPhone('')
      setDescription('')
      setTags('')
      setAddressError('')
      setEmailError('')
    }
  }

  const handleClose = () => {
    setName('')
    setAddress('')
    setEmail('')
    setPhone('')
    setDescription('')
    setTags('')
    setAddressError('')
    setEmailError('')
    onClose()
  }

  // ADD THIS EFFECT TO POPULATE FORM WHEN EDITING
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setAddress(initialData.address || '')
      setEmail(initialData.email || '')
      setPhone(initialData.phone || '')
      setDescription(initialData.description || '')
      setTags(initialData.tags || '')
    } else {
      // Clear form for new contact
      setName('')
      setAddress('')
      setEmail('')
      setPhone('')
      setDescription('')
      setTags('')
    }
    setAddressError('')
    setEmailError('')
  }, [initialData, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {initialData ? 'Edit Contact' : 'Add New Contact'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Doe, Team Member"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isSaving}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Noble Address *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="noble1..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm ${
                addressError ? 'border-red-300 dark:border-red-600' : 'border-gray-300'
              }`}
              disabled={isSaving}
            />
            {addressError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{addressError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="john@example.com"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                  emailError ? 'border-red-300 dark:border-red-600' : 'border-gray-300'
                }`}
                disabled={isSaving}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                disabled={isSaving}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes about this contact"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isSaving}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="team, developer, frequent (comma separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !address.trim() || !!addressError || !!emailError || isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : (initialData ? 'Update Contact' : 'Add Contact')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  const [hasMounted, setHasMounted] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // ADD EDIT STATES
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingContact, setEditingContact] = useState<any>(null)

  // Noble wallet connection
  const { address: nobleAddress, isWalletConnected: nobleConnected } = useChain('noble')

  // Contacts management - ADD updateContact to the destructuring
  const { contacts, isLoading, error, fetchContacts, createContact, deleteContact, updateContact } = useContacts(nobleAddress)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const handleCreateContact = async (contactData: {
    name: string
    address: string
    email?: string
    phone?: string
    description?: string
    tags?: string
  }) => {
    setIsSaving(true)
    try {
      await createContact(contactData)
      setShowCreateModal(false)
    } catch (error) {
      alert(`Failed to create contact: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  // ADD THESE FUNCTIONS AFTER handleCreateContact
  const handleEditContact = (contact: any) => {
    setEditingContact(contact)
    setShowEditModal(true)
  }

  const handleUpdateContact = async (contactData: {
    name: string
    address: string
    email?: string
    phone?: string
    description?: string
    tags?: string
  }) => {
    if (!editingContact) return
    
    setIsSaving(true)
    try {
      await updateContact(editingContact.id, contactData)
      setShowEditModal(false)
      setEditingContact(null)
    } catch (error) {
      console.error('Failed to update contact:', error)
      alert('Failed to update contact. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteContact = async (contactId: number, contactName: string) => {
    const confirmed = confirm(`Are you sure you want to delete "${contactName}"? This action cannot be undone.`)
    if (confirmed) {
      try {
        await deleteContact(contactId)
      } catch (error) {
        alert(`Failed to delete contact: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (nobleAddress) {
      fetchContacts(term)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.description && contact.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.tags && contact.tags.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!hasMounted) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-500 dark:text-gray-100 font-bold">
            Contacts
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your saved contacts for quick USDC payments
          </p>
        </div>

        {/* Connection Status */}
        {!nobleConnected ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Connect your Noble wallet
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  You need to connect your Noble wallet to manage contacts.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                </span>
                
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Contact
                </button>
              </div>
            </div>

            {/* Contacts Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-48"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Failed to load contacts
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <button
                  onClick={() => fetchContacts()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {searchTerm ? 'No contacts found' : 'No contacts yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Add your first contact to get started with quick payments'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Your First Contact
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {contact.name}
                          </h3>
                          {contact.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {contact.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Add this Edit button alongside your existing action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditContact(contact)}
                          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                          Edit
                        </button>
                        
                        {/* Your existing Delete button */}
                        <button
                          onClick={() => handleDeleteContact(contact.id, contact.name)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete contact"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Noble Address</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                        {contact.address}
                      </p>
                    </div>

                    {(contact.email || contact.phone) && (
                      <div className="mb-4 space-y-2">
                        {contact.email && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.phone && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                            <a
                              href={`tel:${contact.phone}`}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {contact.tags && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.split(',').map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/pay?contact=${contact.id}`}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors text-center"
                      >
                        Send USDC
                      </Link>
                     
                    </div>

                    <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                      Added {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Contact Modal */}
      <CreateContactModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateContact}
        isSaving={isSaving}
      />

      {/* ADD THIS EDIT MODAL */}
      {showEditModal && editingContact && (
        <CreateContactModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingContact(null)
          }}
          onSave={handleUpdateContact}
          isSaving={isSaving}
          initialData={editingContact}
        />
      )}
    </>
  )
}