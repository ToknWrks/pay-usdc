'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useChain } from '@cosmos-kit/react'
import { useRecipientLists } from '@/hooks/use-recipient-lists'
import Link from 'next/link'

interface EditableRecipient {
  id: string
  name: string
  address: string
  isValid: boolean
}

export default function EditRecipientListPage({ listId }: { listId: number }) {
  const router = useRouter()
  const [hasMounted, setHasMounted] = useState(false)
  const [listName, setListName] = useState('')
  const [listDescription, setListDescription] = useState('')
  const [recipients, setRecipients] = useState<EditableRecipient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Noble wallet connection
  const { address: nobleAddress, isWalletConnected: nobleConnected } = useChain('noble')

  // Lists management
  const { loadList, deleteList, updateList } = useRecipientLists(nobleAddress)

  useEffect(() => {
    setHasMounted(true)
    if (nobleAddress) {
      loadListData()
    }
  }, [nobleAddress, listId])

  const loadListData = async () => {
    try {
      const { list, recipients: savedRecipients } = await loadList(listId)
      setListName(list.name)
      setListDescription(list.description || '')
      
      const convertedRecipients = savedRecipients.map((r: any, index: number) => ({
        id: `recipient-${r.id}-${index}`,
        name: r.name || '',
        address: r.address,
        isValid: validateRecipient(r.address)
      }))
      
      setRecipients(convertedRecipients.length > 0 ? convertedRecipients : [
        { id: '1', name: '', address: '', isValid: false }
      ])
    } catch (error) {
      console.error('Failed to load list:', error)
      alert('Failed to load list')
      router.push('/dashboard/lists')
    } finally {
      setIsLoading(false)
    }
  }

  // Validation function
  const validateRecipient = (address: string) => {
    const isValidAddress = address.startsWith('noble1') && address.length >= 39 && address.length <= 45
    return isValidAddress
  }

  // Add new recipient
  const addRecipient = () => {
    const newRecipient: EditableRecipient = {
      id: Date.now().toString(),
      name: '',
      address: '',
      isValid: false
    }
    setRecipients([...recipients, newRecipient])
  }

  // Remove recipient
  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter(r => r.id !== id))
    }
  }

  // Update recipient
  const updateRecipient = (id: string, field: 'name' | 'address', value: string) => {
    setRecipients(recipients.map(recipient => {
      if (recipient.id === id) {
        const updated = { ...recipient, [field]: value }
        updated.isValid = validateRecipient(updated.address)
        return updated
      }
      return recipient
    }))
  }

  // CSV Import functionality
  const parseCSV = (csvText: string): EditableRecipient[] => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row')
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim())
    const nameIndex = header.findIndex(h => h.includes('name'))
    const addressIndex = header.findIndex(h => h.includes('address') || h.includes('wallet'))

    if (addressIndex === -1) {
      throw new Error('CSV must contain Address column')
    }

    const parsedRecipients: EditableRecipient[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''))
      
      if (cells.length < addressIndex + 1) {
        continue
      }

      const name = nameIndex >= 0 ? cells[nameIndex] || '' : ''
      const address = cells[addressIndex] || ''

      if (address) {
        parsedRecipients.push({
          id: `imported-${i}-${Date.now()}`,
          name,
          address,
          isValid: validateRecipient(address)
        })
      }
    }

    return parsedRecipients
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportError('Please select a CSV file')
      return
    }

    setIsImporting(true)
    setImportError(null)

    try {
      const text = await file.text()
      const importedRecipients = parseCSV(text)
      
      if (importedRecipients.length === 0) {
        throw new Error('No valid recipients found in CSV')
      }

      if (importedRecipients.length > 100) {
        throw new Error('Maximum 100 recipients allowed per import')
      }

      setRecipients(importedRecipients)
      
      const validCount = importedRecipients.filter(r => r.isValid).length
      const invalidCount = importedRecipients.length - validCount
      
      if (invalidCount > 0) {
        setImportError(`Imported ${importedRecipients.length} recipients. ${invalidCount} have validation errors.`)
      } else {
        alert(`✅ Successfully imported ${validCount} valid recipients!`)
      }

    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to parse CSV')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Download CSV template
  const downloadTemplate = () => {
    const template = `Name,Address
"John Doe","noble1abc123def456ghi789jkl012mno345pqr678stu"
"Jane Smith","noble1xyz789abc012def345ghi678jkl901mno234pqr"
"Team Payment","noble1qwe456rty789uio012asd345fgh678jkl901zxc"`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'recipient-list-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Export current list
  const exportToCSV = () => {
    const csvContent = [
      'Name,Address',
      ...recipients.map(r => `"${r.name}","${r.address}"`)
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${listName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-recipients.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Delete list
  const handleDeleteList = async () => {
    const confirmed = confirm(`Are you sure you want to delete "${listName}"? This action cannot be undone.`)
    if (confirmed) {
      try {
        await deleteList(listId)
        router.push('/dashboard/lists')
      } catch (error) {
        alert(`Failed to delete list: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  // Calculate stats
  const validRecipients = recipients.filter(r => r.isValid)

  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [listName, listDescription, recipients])

  // Warn user about unsaved changes when leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleSaveList = async () => {
    if (!listName.trim()) {
      alert('Please enter a list name')
      return
    }

    const validRecipients = recipients.filter(r => r.address) // Only need address
    
    if (validRecipients.length === 0) {
      const confirmed = confirm('This list has no recipients with addresses. Save anyway?')
      if (!confirmed) return
    }

    setIsSaving(true)
    try {
      await updateList(listId, {
        name: listName.trim(),
        description: listDescription.trim() || undefined,
        recipients: validRecipients.map(r => ({
          name: r.name || undefined,
          address: r.address
        }))
      })
      
      setHasUnsavedChanges(false)
      alert('✅ List saved successfully!')
    } catch (error) {
      alert(`❌ Failed to save list: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (!hasMounted || isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Link 
            href="/dashboard/lists"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <span className="text-gray-900 dark:text-gray-100">Edit List</span>
        </div>
        
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Edit Recipient List
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Modify your recipient list and manage payment details
        </p>
      </div>

      {/* List Info */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              List Name *
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Import/Export Actions */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Import & Export
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CSV Import */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Import from CSV
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center"
            >
              {isImporting ? (
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              )}
              {isImporting ? 'Importing...' : 'Import CSV'}
            </button>
          </div>

          {/* Download Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CSV Template
            </label>
            <button
              onClick={downloadTemplate}
              className="w-full px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Template
            </button>
          </div>

          {/* Export Current */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Current List
            </label>
            <button
              onClick={exportToCSV}
              className="w-full px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {importError && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ {importError}
            </p>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>CSV Format:</strong> Your file should have columns for Name and Address.<br/>
            Example: <code>Name,Address</code> followed by recipient data. You'll set the payment amount when sending.
          </p>
        </div>
      </div>

      {/* Recipients */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recipients ({recipients.length})
          </h2>
          <button
            onClick={addRecipient}
            className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Recipient
          </button>
        </div>

        <div className="space-y-4">
          {recipients.map((recipient, index) => (
            <div key={recipient.id} className={`p-4 border rounded-lg ${
              recipient.isValid ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10' :
              recipient.address ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10' :
              'border-gray-200 dark:border-gray-600'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recipient {index + 1}
                  {recipient.name && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                      ({recipient.name})
                    </span>
                  )}
                </span>
                {recipients.length > 1 && (
                  <button
                    onClick={() => removeRecipient(recipient.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={recipient.name}
                    onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                    placeholder="e.g., John Doe, Team Member, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Noble Address
                  </label>
                  <input
                    type="text"
                    value={recipient.address}
                    onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                    placeholder="noble1..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary & Actions */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {recipients.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Recipients
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {validRecipients.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Valid Recipients
            </div>
          </div>
        </div>
        
        {/* Keep the action buttons the same */}
        <div className="flex flex-col md:flex-row gap-3">
          <Link
            href={`/dashboard/pay?loadList=${listId}`}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center"
          >
            Use for Payment
          </Link>
          
          <button
            onClick={handleSaveList}
            disabled={isSaving || !listName.trim()}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              hasUnsavedChanges 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } disabled:opacity-50`}
          >
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes*' : 'Save Changes'}
          </button>
          
          <button
            onClick={handleDeleteList}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete List
          </button>
        </div>
      </div>
    </div>
  )
}