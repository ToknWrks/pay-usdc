'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useCosmosWallet } from '@/hooks/use-cosmos-wallet'
import { useCosmosBalance } from '@/hooks/use-cosmos-balance'
import CosmosWalletModal from '@/components/cosmos-wallet-modal'
import { useTransactions } from '@/hooks/use-transactions'
import { useChain } from '@cosmos-kit/react'
import Link from 'next/link'

interface Recipient {
  id: string
  name: string
  address: string
  amount: string
  isValid: boolean
}

export default function PayMultiPage() {
  const [hasMounted, setHasMounted] = useState(false)
  const [isCosmosModalOpen, setIsCosmosModalOpen] = useState(false)
  const [selectedCosmosChain, setSelectedCosmosChain] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', name: '', address: '', amount: '', isValid: false }
  ])
  const [isSending, setIsSending] = useState(false)
  const [sendingProgress, setSendingProgress] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // EVM Wallet
  const { isConnected: evmConnected, address: evmAddress, connector } = useAccount()
  const { disconnect: evmDisconnect } = useDisconnect()
  const { open } = useAppKit()
  
  // Cosmos Wallets
  const osmosis = useCosmosWallet('osmosis')
  const cosmoshub = useCosmosWallet('cosmoshub')
  
  // Use useChain directly for Noble instead of useCosmosWallet
  const { 
    address: nobleAddress,
    isWalletConnected: nobleConnected,
    getSigningStargateClient,
    connect: connectNoble,
    disconnect: disconnectNoble
  } = useChain('noble')

  // Cosmos Balances
  const nobleBalance = useCosmosBalance('noble')

  // Transactions hook
  const { transactions, createBatchTransaction, isLoading: transactionsLoading } = useTransactions(nobleAddress)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Handle cosmos connect
  const handleCosmosConnect = (chainName: string) => {
    setSelectedCosmosChain(chainName)
    setIsCosmosModalOpen(true)
  }

  // Add new recipient
  const addRecipient = () => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: '',
      address: '',
      amount: '',
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
  const updateRecipient = (id: string, field: 'name' | 'address' | 'amount', value: string) => {
    setRecipients(recipients.map(recipient => {
      if (recipient.id === id) {
        const updated = { ...recipient, [field]: value }
        updated.isValid = validateRecipient(updated.address, updated.amount)
        return updated
      }
      return recipient
    }))
  }

  // Validate recipient
  const validateRecipient = (address: string, amount: string) => {
    const isValidAddress = address.startsWith('noble1') && address.length >= 39 && address.length <= 45
    const isValidAmount = parseFloat(amount) > 0 && !isNaN(parseFloat(amount))
    return isValidAddress && isValidAmount
  }

  // Parse CSV
  const parseCSV = (csvText: string): Recipient[] => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row')
    }

    // Parse header to determine column positions
    const header = lines[0].toLowerCase().split(',').map(h => h.trim())
    const nameIndex = header.findIndex(h => h.includes('name'))
    const addressIndex = header.findIndex(h => h.includes('address') || h.includes('wallet'))
    const amountIndex = header.findIndex(h => h.includes('amount') || h.includes('usdc'))

    if (addressIndex === -1 || amountIndex === -1) {
      throw new Error('CSV must contain Address and Amount columns')
    }

    const parsedRecipients: Recipient[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''))
      
      if (cells.length < Math.max(addressIndex, amountIndex) + 1) {
        continue // Skip malformed rows
      }

      const name = nameIndex >= 0 ? cells[nameIndex] || '' : ''
      const address = cells[addressIndex] || ''
      const amount = cells[amountIndex] || ''

      if (address && amount) {
        parsedRecipients.push({
          id: `imported-${i}-${Date.now()}`,
          name: name,
          address: address,
          amount: amount,
          isValid: validateRecipient(address, amount)
        })
      }
    }

    return parsedRecipients
  }

  // Handle file import
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

      // Replace current recipients with imported ones
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
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      'Name,Address,Amount', // Header
      ...recipients.map(r => `"${r.name}","${r.address}","${r.amount}"`)
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `usdc-recipients-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Clear all recipients
  const clearAllRecipients = () => {
    if (recipients.length > 1) {
      const confirmed = confirm(`Clear all ${recipients.length} recipients?`)
      if (confirmed) {
        setRecipients([{ id: '1', name: '', address: '', amount: '', isValid: false }])
      }
    }
  }

  // Calculate totals
  const totalAmount = recipients.reduce((sum, recipient) => {
    const amount = parseFloat(recipient.amount) || 0
    return sum + amount
  }, 0)

  const validRecipients = recipients.filter(r => r.isValid)
  const canSend = validRecipients.length > 0 && nobleConnected && totalAmount > 0

  // Handle send with real Noble transactions
  const handleSend = async () => {
    if (!canSend || !nobleAddress) return
  
    setIsSending(true)
    setSendingProgress('Preparing batch transaction...')
    
    try {
      // Get the signing client using useChain hook
      const signingClient = await getSigningStargateClient()
      
      if (!signingClient) {
        throw new Error('Failed to get signing client. Please reconnect your wallet.')
      }
  
      setSendingProgress(`Sending to ${validRecipients.length} recipients...`)
      
      // This would be for a true batch send (all in one tx)
      const multiSendMsg = {
        typeUrl: "/cosmos.bank.v1beta1.MsgMultiSend",
        value: {
          inputs: [{
            address: nobleAddress,
            coins: [{
              denom: 'uusdc',
              amount: Math.floor(totalAmount * 1_000_000).toString()
            }]
          }],
          outputs: validRecipients.map(recipient => ({
            address: recipient.address,
            coins: [{
              denom: 'uusdc',
              amount: Math.floor(parseFloat(recipient.amount) * 1_000_000).toString()
            }]
          }))
        }
      }
  
      // Send the multi-send transaction
      const result = await signingClient.signAndBroadcast(
        nobleAddress,
        [multiSendMsg],
        {
          amount: [{ denom: 'uusdc', amount: '2000' }], // Higher fee for batch
          gas: (200000 * validRecipients.length).toString()
        }
      )
  
      console.log(`Transaction sent:`, result.transactionHash)
      
      const transactionResults = validRecipients.map((recipient, i) => ({
        recipient,
        success: true,
        txHash: result.transactionHash,
        result
      }))
      const totalSuccessful = validRecipients.length
      const totalFailed = 0
  
      setSendingProgress('Recording batch transaction...')
  
      const batchTxHash = result.transactionHash
      const batchSuccess = totalSuccessful > 0
  
      console.log('Batch results:', {
        successful: totalSuccessful,
        failed: totalFailed,
        batchTxHash,
        results: transactionResults
      })
  
      // Record the batch transaction in database with all recipients
      await createBatchTransaction({
        senderAddress: nobleAddress,
        recipients: validRecipients.map(r => ({
          name: r.name || undefined,
          address: r.address,
          amount: r.amount
        })),
        txHash: batchTxHash,
        totalAmount: totalAmount,
        memo: `Batch payment to ${validRecipients.length} recipients`,
        status: batchSuccess ? 'confirmed' : 'failed'
      })
  
      // Show appropriate success/failure message
      if (totalSuccessful === validRecipients.length) {
        alert(`✅ Successfully sent USDC to all ${totalSuccessful} recipients!`)
      } else if (totalSuccessful > 0) {
        alert(`⚠️ Sent USDC to ${totalSuccessful} out of ${validRecipients.length} recipients. ${totalFailed} transactions failed.`)
      } else {
        alert(`❌ All ${totalFailed} transactions failed. Please check your wallet and try again.`)
      }
  
      // Reset form if any transactions succeeded
      if (totalSuccessful > 0) {
        setRecipients([{ id: '1', name: '', address: '', amount: '', isValid: false }])
      }
  
      // Refresh balance
      nobleBalance.refetch()
  
    } catch (error) {
      console.error('Error sending batch USDC:', error)
      alert(`Failed to send USDC: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSending(false)
      setSendingProgress('')
    }
  }

  // Check if user has sufficient balance
  const currentBalance = parseFloat(nobleBalance.native?.formatted || '0')
  const hasInsufficientBalance = totalAmount > currentBalance

  if (!hasMounted) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            Send USDC to Multiple Recipients
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Send USDC to multiple Noble addresses in a single transaction
          </p>
        </div>

        {/* Main Layout - Two Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Side - Payment Form */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Connection Status */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Wallet Status
                  </h2>
                  {nobleConnected ? (
                    <div className="flex items-center mt-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Noble connected • Balance: ${nobleBalance.native?.formatted || '0.00'} USDC
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center mt-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Noble wallet not connected
                      </span>
                    </div>
                  )}
                </div>
                {!nobleConnected && (
                  <button
                    onClick={() => handleCosmosConnect('noble')}
                    className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    Connect Noble
                  </button>
                )}
              </div>
            </div>

            {/* Recipients Form */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recipients
                </h2>
                <div className="flex items-center space-x-2">
                  <Link
                    href="/dashboard/lists"
                    className="px-3 py-2 bg-purple-500 text-white hover:bg-purple-600 rounded-lg transition-colors flex items-center text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Manage Lists
                  </Link>
                  
                  <button
                    onClick={addRecipient}
                    className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Recipient
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Export CSV
                  </button>
                  <button
                    onClick={clearAllRecipients}
                    className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear All
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {recipients.map((recipient, index) => (
                  <div key={recipient.id} className={`p-4 border rounded-lg ${
                    recipient.isValid ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10' :
                    recipient.address || recipient.amount ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10' :
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
                      {/* Name Field */}
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
                      
                      {/* Address and Amount Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Amount (USDC)
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            min="0"
                            value={recipient.amount}
                            onChange={(e) => updateRecipient(recipient.id, 'amount', e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Import CSV */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Import Recipients from CSV
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Import CSV
                  </button>
                  {isImporting && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Importing...
                    </span>
                  )}
                </div>
                {importError && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                    {importError}
                  </p>
                )}
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Transaction Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${totalAmount.toFixed(6)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Amount
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ~$0.10
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Est. Gas Fee
                  </div>
                </div>
              </div>
            </div>

            {/* Send Button */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
              {hasInsufficientBalance && totalAmount > 0 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    ⚠️ Insufficient balance. You need ${totalAmount.toFixed(6)} USDC but only have ${currentBalance.toFixed(6)} USDC.
                  </p>
                </div>
              )}
              
              <button
                onClick={handleSend}
                disabled={!canSend || isSending || hasInsufficientBalance}
                className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-all ${
                  canSend && !isSending && !hasInsufficientBalance
                    ? 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-[1.02]'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSending ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {sendingProgress || 'Sending USDC...'}
                  </div>
                ) : canSend && !hasInsufficientBalance ? (
                  `Send ${totalAmount.toFixed(6)} USDC to ${validRecipients.length} Recipients`
                ) : !nobleConnected ? (
                  'Connect Noble Wallet to Continue'
                ) : hasInsufficientBalance ? (
                  'Insufficient USDC Balance'
                ) : validRecipients.length === 0 ? (
                  'Add Valid Recipients to Continue'
                ) : (
                  'Enter Amount to Continue'
                )}
              </button>
              
              {!nobleConnected && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                  You need to connect your Noble wallet to send USDC
                </p>
              )}
            </div>
          </div>

          {/* Right Side - Transaction History */}
          <div className="xl:col-span-1">
  <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4 sticky top-8">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Recent Transactions
      </h2>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {transactions.length}
        </span>
        <button
          onClick={() => window.location.reload()}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    {!nobleConnected ? (
      <div className="text-center py-6">
        <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Connect Noble to view history
        </p>
      </div>
    ) : transactionsLoading ? (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    ) : transactions.length === 0 ? (
      <div className="text-center py-6">
        <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">No transactions yet</p>
      </div>
    ) : (
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {transactions.slice(0, 15).map((transaction) => {
          const isBatch = transaction.batchId && transaction.totalRecipients && transaction.totalRecipients > 1
          const statusColor = transaction.status === 'confirmed' ? 'green' :
                             transaction.status === 'pending' ? 'yellow' : 'red'
          
          return (
            <div key={transaction.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors">
              <div className="flex items-start justify-between">
                {/* Left: Status + Info */}
                <div className="flex items-start space-x-2 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    statusColor === 'green' ? 'bg-green-500' :
                    statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Batch info */}
                    {isBatch && (
                      <div className="flex items-center mb-1">
                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {transaction.totalRecipients}x BATCH
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ${parseFloat(transaction.totalAmount || '0').toFixed(1)}
                        </span>
                      </div>
                    )}
                    
                    {/* Recipient info */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {transaction.recipientName || 'Payment'}
                      </span>
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100 ml-2">
                        ${parseFloat(transaction.amount).toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Address + Time */}
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                        {transaction.recipientAddress.slice(0, 8)}...{transaction.recipientAddress.slice(-6)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                        {new Date(transaction.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Explorer link - only visible on hover */}
              {transaction.txHash && transaction.txHash !== 'failed' && (
                <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={`https://mintscan.io/noble/txs/${transaction.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Explorer
                  </a>
                </div>
              )}
            </div>
          )
        })}
        
        {transactions.length > 15 && (
          <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-600">
            <button className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
              View All ({transactions.length})
            </button>
          </div>
        )}
      </div>
    )}

    {/* Quick Stats */}
    {transactions.length > 0 && (
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {transactions.filter(tx => tx.status === 'confirmed').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Completed
            </div>
            {transactions.filter(tx => tx.status === 'failed').length > 0 && (
              <div className="text-xs text-red-500 dark:text-red-400">
                {transactions.filter(tx => tx.status === 'failed').length} failed
              </div>
            )}
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              ${transactions
                .filter(tx => tx.status === 'confirmed')
                .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0)
                .toFixed(0)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Successfully Sent
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
        </div>
      </div>

      {/* Cosmos Wallet Modal */}
      <CosmosWalletModal 
        isOpen={isCosmosModalOpen} 
        onClose={() => setIsCosmosModalOpen(false)}
        chainName={selectedCosmosChain}
      />
    </>
  )
}