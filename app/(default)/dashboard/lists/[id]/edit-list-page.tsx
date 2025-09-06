'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useChain } from '@cosmos-kit/react'
import { useRecipientLists } from '@/hooks/use-recipient-lists'
import Link from 'next/link'
import Toast03 from '@/components/toast-03'

interface EditableRecipient {
  id: string
  name: string
  address: string
  percentage?: string // For fund split lists
  amount?: string // For variable amount lists
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
  const [listType, setListType] = useState<'fixed' | 'percentage' | 'variable'>('fixed') // Define listType with default value
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'warning' | 'error' | 'success' | ''
    message: string
    open: boolean
  } | null>(null)

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
    if (!listId) return
    
    try {
      const { list, recipients: savedRecipients } = await loadList(listId)
      setListName(list.name)
      setListDescription(list.description || '')
      setListType(list.listType || 'fixed') // Load the list type from database
      
      const convertedRecipients = savedRecipients.map((r: any, index: number) => ({
        id: `recipient-${r.id}-${index}`,
        name: r.name || '',
        address: r.address,
        percentage: r.percentage || '', // Load percentage from database
        amount: r.amount || '', // ADD THIS: Load amount from database
        isValid: validateRecipient(r.address)
      }))
      
      setRecipients(convertedRecipients.length > 0 ? convertedRecipients : [
        { id: '1', name: '', address: '', 
          percentage: listType === 'percentage' ? '' : undefined,
          amount: listType === 'variable' ? '' : undefined, // ADD THIS
          isValid: false 
        }
      ])
    } catch (error) {
      console.error('Failed to load list:', error)
      showNotification('error', 'Failed to load list')
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
      percentage: listType === 'percentage' ? '' : undefined,
      amount: listType === 'variable' ? '' : undefined,
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
  const updateRecipient = (id: string, field: 'name' | 'address' | 'percentage' | 'amount', value: string) => {
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
    const percentageIndex = header.findIndex(h => h.includes('percentage') || h.includes('percent') || h.includes('%'))
    const amountIndex = header.findIndex(h => h.includes('amount') || h.includes('usdc') || h.includes('dollar'))
  
    if (addressIndex === -1) {
      throw new Error('CSV must contain Address column')
    }
  
    // Validation based on list type
    if (listType === 'percentage' && percentageIndex === -1) {
      throw new Error('CSV must contain Percentage column for fund split lists')
    }
    
    if (listType === 'variable' && amountIndex === -1) {
      throw new Error('CSV must contain Amount column for variable amount lists')
    }
  
    const parsedRecipients: EditableRecipient[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''))
      
      if (cells.length < addressIndex + 1) {
        continue
      }
  
      const name = nameIndex >= 0 ? cells[nameIndex] || '' : ''
      const address = cells[addressIndex] || ''
      const percentage = listType === 'percentage' && percentageIndex >= 0 ? cells[percentageIndex] || '' : undefined
      const amount = listType === 'variable' && amountIndex >= 0 ? cells[amountIndex] || '' : undefined
  
      if (address) {
        parsedRecipients.push({
          id: `imported-${i}-${Date.now()}`,
          name,
          address,
          percentage,
          amount,
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
      // Replace setImportError with notification
      showNotification('error', 'Please select a CSV file')
      return
    }
  
    setIsImporting(true)
  
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
        showNotification('warning', `Imported ${importedRecipients.length} recipients. ${invalidCount} have validation errors.`)
      } else {
        // Replace alert with notification
        showNotification('success', `Successfully imported ${validCount} valid recipients!`)
      }
  
    } catch (error) {
      // Replace setImportError with notification
      showNotification('error', error instanceof Error ? error.message : 'Failed to parse CSV')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Download CSV template
  const downloadTemplate = () => {
    const template = listType === 'percentage' 
    ? `Name,Address,Percentage
"John Doe","noble1abc123def456ghi789jkl012mno345pqr678stu","50.00"
"Jane Smith","noble1xyz789abc012def345ghi678jkl901mno234pqr","30.00"
"Team Payment","noble1qwe456rty789uio012asd345fgh678jkl901zxc","20.00"`
    : listType === 'variable'
    ? `Name,Address,Amount
"John Doe","noble1abc123def456ghi789jkl012mno345pqr678stu","25.00"
"Jane Smith","noble1xyz789abc012def345ghi678jkl901mno234pqr","50.00"
"Team Payment","noble1qwe456rty789uio012asd345fgh678jkl901zxc","10.00"`
    : `Name,Address
"John Doe","noble1abc123def456ghi789jkl012mno345pqr678stu"
"Jane Smith","noble1xyz789abc012def345ghi678jkl901mno234pqr"
"Team Payment","noble1qwe456rty789uio012asd345fgh678jkl901zxc"`
  
  const blob = new Blob([template], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `recipient-list-template-${listType}.csv`
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
        showNotification('success', 'List deleted successfully')
        // Small delay to show the notification before navigation
        setTimeout(() => {
          router.push('/dashboard/lists')
        }, 1000)
      } catch (error) {
        // Replace alert with notification
        showNotification('error', `Failed to delete list: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  const getTotalPercentage = () => {
    return recipients.reduce((sum, recipient) => {
      const percentage = parseFloat(recipient.percentage || '0');
      return sum + (isNaN(percentage) ? 0 : percentage);
    }, 0);
  };

  const getTotalAmount = () => {
    return recipients.reduce((sum, recipient) => {
      const amount = parseFloat(recipient.amount || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  const showNotification = (type: 'warning' | 'error' | 'success' | '', message: string) => {
    setNotification({ type, message, open: true })
    // Auto-hide after 5 seconds
    setTimeout(() => setNotification(null), 5000)
  }

  const handleSaveList = async () => {
    if (!listId) {
      showNotification('error', 'List ID is missing')
      return
    }
  
    if (!listName.trim()) {
      showNotification('warning', 'Please enter a list name')
      return
    }
  
    // Validate based on list type
    let validRecipients
    if (listType === 'percentage') {
      // For fund split: need address and percentage
      validRecipients = recipients.filter(r => r.address && r.percentage)
      
      // Validate percentages add up to 100%
      const totalPercentage = getTotalPercentage()
      if (Math.abs(totalPercentage - 100) > 0.01) {
        showNotification('error', `Percentages must add up to 100%. Current total: ${totalPercentage.toFixed(2)}%`)
        return
      }
    } else if (listType === 'variable') {
      // For variable amounts: need address and amount
      validRecipients = recipients.filter(r => r.address && r.amount)
      
      if (validRecipients.length === 0) {
        showNotification('warning', 'Please add recipients with amounts for variable amount lists')
        return
      }
    } else {
      // For fixed amount: need address (amount will be set in pay-multi)
      validRecipients = recipients.filter(r => r.address)
    }
    
    if (validRecipients.length === 0) {
      const confirmed = confirm('This list has no valid recipients. Save anyway?')
      if (!confirmed) return
    }
  
    setIsSaving(true)
    try {
      await updateList(listId, {
        name: listName.trim(),
        description: listDescription.trim() || undefined,
        listType: listType,
        recipients: validRecipients.map(r => ({
          name: r.name || undefined,
          address: r.address,
          percentage: listType === 'percentage' ? r.percentage : undefined,
          amount: listType === 'variable' ? r.amount : undefined
        }))
      })
      
      setHasUnsavedChanges(false)
      // Replace alert with notification
      showNotification('success', 'List saved successfully!')
    } catch (error) {
      // Replace alert with notification
      showNotification('error', `Failed to save list: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <Toast03
            type={notification.type}
            open={notification.open}
            setOpen={(open) => !open && setNotification(null)}
          >
            {notification.message}
          </Toast03>
        </div>
      )}

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

      {/* List Type Selection - Add this section after List Info */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          List Configuration
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            List Type *
          </label>
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setListType('fixed')}
              className={`flex-1 px-4 py-3 text-sm rounded-md transition-colors ${
                listType === 'fixed'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">Fixed Amounts</div>
                <div className="text-xs opacity-75">Same amount for everyone</div>
              </div>
            </button>
            <button
              onClick={() => setListType('percentage')}
              className={`flex-1 px-4 py-3 text-sm rounded-md transition-colors ${
                listType === 'percentage'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">Fund Split</div>
                <div className="text-xs opacity-75">Split total by percentages</div>
              </div>
            </button>
            <button
              onClick={() => setListType('variable')}
              className={`flex-1 px-4 py-3 text-sm rounded-md transition-colors ${
                listType === 'variable'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">Variable Amounts</div>
                <div className="text-xs opacity-75">Custom amount per person</div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {listType === 'fixed' ? (
              <>
                <strong>Fixed Amounts:</strong> You'll set a specific USDC amount per recipient when sending. All recipients get the same amount.
              </>
            ) : listType === 'percentage' ? (
              <>
                <strong>Fund Split:</strong> Recipients receive a percentage of the total amount sent. Percentages must add up to 100%.
              </>
            ) : (
              <>
                <strong>Variable Amounts:</strong> Each recipient has their own pre-set USDC amount. You pay the total of all amounts.
              </>
            )}
          </p>
        </div>

        {/* Percentage validation for fund lists */}
        {listType === 'percentage' && recipients.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total allocation: {getTotalPercentage().toFixed(2)}%
              </span>
              <span className={`text-sm font-medium ${
                Math.abs(getTotalPercentage() - 100) < 0.01 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {Math.abs(getTotalPercentage() - 100) < 0.01 ? '✓ Balanced' : '⚠ Must equal 100%'}
              </span>
            </div>
          </div>
        )}

        {listType === 'variable' && recipients.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total payment amount: ${getTotalAmount().toFixed(2)} USDC
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {recipients.filter(r => r.amount && parseFloat(r.amount) > 0).length} recipients with amounts
              </span>
            </div>
          </div>
        )}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m0 0l3-3m-3 3V10" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m0 0l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>CSV Format:</strong> Your file should have columns for Name, Address, and Amount.<br/>
            Example: <code>Name,Address,Amount</code> followed by recipient data.
          </p>
        </div>
      </div>

      {/* Recipients - Ultra Compact Layout */}
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
      
        {/* Header Row - Updated */}
        <div className="hidden md:grid grid-cols-12 gap-3 mb-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Name (Optional)</div>
          <div className={
            listType === 'percentage' ? 'col-span-5' : 
            listType === 'variable' ? 'col-span-5' : 
            'col-span-7'
          }>Noble Address</div>
          {listType === 'percentage' && <div className="col-span-2">Share %</div>}
          {listType === 'variable' && <div className="col-span-2">Amount (USDC)</div>}
          <div className="col-span-1">Actions</div>
        </div>
      
        <div className="space-y-2">
          {recipients.map((recipient, index) => (
            <div key={recipient.id} className={`p-3 border rounded-lg transition-colors ${
              recipient.isValid ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10' :
              recipient.address ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10' :
              'border-gray-200 dark:border-gray-600'
            }`}>
              
              {/* Desktop Layout - Single Row */}
              <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                {/* Recipient Number */}
                <div className="col-span-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {index + 1}
                  </span>
                </div>
                
                {/* Name Field */}
                <div className="col-span-3">
                  <input
                    type="text"
                    value={recipient.name}
                    onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                    placeholder="e.g., John Doe"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Address Field */}
                <div className={listType === 'percentage' ? 'col-span-5' : listType === 'variable' ? 'col-span-5' : 'col-span-7'}>
                  <input
                    type="text"
                    value={recipient.address}
                    onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                    placeholder="noble1..."
                    className="w-full px-2 py-1.5 text-sm font-mono border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Percentage Field (only for fund split) */}
                {listType === 'percentage' && (
                  <div className="col-span-2">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={recipient.percentage || ''}
                        onChange={(e) => updateRecipient(recipient.id, 'percentage', e.target.value)}
                        placeholder="25.00"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">%</span>
                    </div>
                  </div>
                )}

                {/* Amount Field (only for variable amounts) */}
                {listType === 'variable' && (
                  <div className="col-span-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={recipient.amount || ''}
                        onChange={(e) => updateRecipient(recipient.id, 'amount', e.target.value)}
                        placeholder="10.00"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-6"
                      />
                    </div>
                  </div>
                )}
                
                {/* Remove Button */}
                <div className="col-span-1 flex justify-center">
                  {recipients.length > 1 && (
                    <button
                      onClick={() => removeRecipient(recipient.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Remove recipient"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
      
              {/* Mobile Layout - Stacked */}
              <div className="md:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recipient {index + 1}
                    {recipient.name && (
                      <span className="ml-2 text-blue-600 dark:text-blue-400 font-normal">
                        • {recipient.name}
                      </span>
                    )}
                    {listType === 'percentage' && recipient.percentage && (
                      <span className="ml-2 text-green-600 dark:text-green-400 font-normal">
                        ({recipient.percentage}%)
                      </span>
                    )}
                  </span>
                  {recipients.length > 1 && (
                    <button
                      onClick={() => removeRecipient(recipient.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    value={recipient.name}
                    onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                    placeholder="Name (optional)"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    value={recipient.address}
                    onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                    placeholder="noble1..."
                    className="w-full px-2 py-1.5 text-sm font-mono border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {listType === 'percentage' && (
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={recipient.percentage || ''}
                        onChange={(e) => updateRecipient(recipient.id, 'percentage', e.target.value)}
                        placeholder="25.00"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">%</span>
                    </div>
                  )}

                  {listType === 'variable' && (
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={recipient.amount || ''}
                        onChange={(e) => updateRecipient(recipient.id, 'amount', e.target.value)}
                        placeholder="10.00"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-6"
                      />
                    </div>
                  )}
                </div>
              </div>
      
            
            </div>
          ))}
        </div>
      
        {/* Quick Actions for large lists */}
        {recipients.length > 5 && (
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {recipients.length} recipients • {validRecipients.length} valid
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const newRecipients = Array.from({ length: 5 }, (_, i) => ({
                    id: `bulk-${Date.now()}-${i}`,
                    name: '',
                    address: '',
                    percentage: listType === 'percentage' ? '' : undefined,
                    isValid: false
                  }))
                  setRecipients([...recipients, ...newRecipients])
                }}
                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400"
              >
                + Add 5 more
              </button>
              <button
                onClick={() => {
                  const emptyRecipients = recipients.filter(r => !r.address && !r.name)
                  if (emptyRecipients.length === 0) {
                    showNotification('', 'No empty recipients to remove')
                    return
                  }
                  
                  const confirmed = confirm(`Remove ${emptyRecipients.length} empty recipients?`)
                  if (confirmed) {
                    setRecipients(recipients.filter(r => r.address || r.name))
                    showNotification('success', `Removed ${emptyRecipients.length} empty recipients`)
                  }
                }}
                className="text-sm text-red-500 hover:text-red-700 dark:text-red-400"
              >
                Remove empty
              </button>
            </div>
            </div>
          )}
      </div>

      {/* Summary & Actions */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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