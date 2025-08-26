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
import { useRecipientLists } from '@/hooks/use-recipient-lists'
import { useSearchParams } from 'next/navigation'
import { useContacts } from '@/hooks/use-contacts'

interface Recipient {
  id: string
  name: string
  address: string
  amount?: string // Optional for loaded lists
  percentage?: string // For fund split lists
  isValid: boolean
}

export default function PayMultiPage() {
  const [hasMounted, setHasMounted] = useState(false)
  const [isCosmosModalOpen, setIsCosmosModalOpen] = useState(false)
  const [selectedCosmosChain, setSelectedCosmosChain] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', name: '', address: '', isValid: false }
  ])
  const [isSending, setIsSending] = useState(false)
  const [sendingProgress, setSendingProgress] = useState('')
  const [showListSelector, setShowListSelector] = useState(false)
  const [selectedListForSaving, setSelectedListForSaving] = useState<number | null>(null)
  const [saveListName, setSaveListName] = useState('')
  const [saveListDescription, setSaveListDescription] = useState('')
  const [isSavingList, setIsSavingList] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [listType, setListType] = useState<'fixed' | 'percentage'>('fixed')
  const [loadedListType, setLoadedListType] = useState<'fixed' | 'percentage'>('fixed')
  const [showContactSelector, setShowContactSelector] = useState(false)

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

  // Recipient Lists hook
  const { lists, isLoading: listsLoading, createList, loadList } = useRecipientLists(nobleAddress)

  // Contacts hook
  const { contacts } = useContacts(nobleAddress)

  // URL params handling for loading lists
  const searchParams = useSearchParams()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Only load list if explicitly specified in URL
  useEffect(() => {
    const loadListId = searchParams.get('loadList')
    const contactId = searchParams.get('contact')
    
    if (loadListId && nobleAddress && hasMounted) {
      handleLoadList(parseInt(loadListId))
    }
    
    if (contactId && nobleAddress && hasMounted && contacts.length > 0) {
      const contact = contacts.find(c => c.id === parseInt(contactId))
      if (contact) {
        handleLoadContact(contact)
      }
    }
  }, [searchParams, nobleAddress, hasMounted, contacts])

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
  const updateRecipient = (id: string, field: 'name' | 'address' | 'percentage', value: string | number) => {
    setRecipients(recipients.map(recipient => {
      if (recipient.id === id) {
        const updated = { ...recipient, [field]: value }
        updated.isValid = validateRecipient(updated.address)
        return updated
      }
      return recipient
    }))
  }

  // Validate recipient
  const validateRecipient = (address: string) => {
    const isValidAddress = address.startsWith('noble1') && address.length >= 39 && address.length <= 45
    return isValidAddress
  }

  // Calculate totals
  
  const getTotalPercentage = () => {
    return recipients.reduce((sum, recipient) => sum + (parseFloat(recipient.percentage as string) || 0), 0)
  }

  const validRecipients = recipients.filter(r => r.isValid)

  const totalAmount = loadedListType === 'percentage' 
    ? parseFloat(paymentAmount || '0') // Total fund amount for percentage lists
    : validRecipients.length * parseFloat(paymentAmount || '0') // Per recipient × count for fixed lists

  const canSend = validRecipients.length > 0 && nobleConnected && totalAmount > 0 && parseFloat(paymentAmount || '0') > 0

  // For percentage lists, also check that percentages are valid
  const percentageValid = loadedListType === 'percentage' 
    ? Math.abs(getTotalPercentage() - 100) < 0.01 
    : true

  // Update canSend to include percentage validation
  const finalCanSend = canSend && percentageValid

  // Handle send with real Noble transactions
  const handleSend = async () => {
    if (!finalCanSend || !nobleAddress) return
  
    setIsSending(true)
    setSendingProgress('Preparing batch transaction...')
    
    try {
      // Get the signing client using useChain hook
      const signingClient = await getSigningStargateClient()
      
      if (!signingClient) {
        throw new Error('Failed to get signing client. Please reconnect your wallet.')
      }
  
      setSendingProgress(`Sending to ${validRecipients.length} recipients...`)
      
      // Calculate individual amounts based on list type
      let recipientAmounts: { address: string; amount: string; name?: string }[] = []
      
      if (loadedListType === 'percentage') {
        // For percentage lists, calculate each recipient's share
        const totalFund = parseFloat(paymentAmount) * 1_000_000 // Convert to uusdc
        
        recipientAmounts = validRecipients.map(recipient => {
          const percentage = parseFloat(recipient.percentage || '0') / 100
          const individualAmount = Math.floor(totalFund * percentage)
          return {
            address: recipient.address,
            amount: individualAmount.toString(),
            name: recipient.name
          }
        })
        
        // Validate percentage totals before sending
        const totalPercentage = getTotalPercentage()
        if (Math.abs(totalPercentage - 100) > 0.01) {
          throw new Error(`Percentages must add up to 100%. Current total: ${totalPercentage.toFixed(2)}%`)
        }
        
      } else {
        // For fixed amount lists, everyone gets the same amount
        const individualAmount = Math.floor(parseFloat(paymentAmount) * 1_000_000) // Convert to uusdc
        
        recipientAmounts = validRecipients.map(recipient => ({
          address: recipient.address,
          amount: individualAmount.toString(),
          name: recipient.name
        }))
      }
  
      // Calculate total amount for the transaction
      const totalTransactionAmount = recipientAmounts.reduce((sum, r) => sum + parseInt(r.amount), 0)
      
      // Build the multi-send message
      const multiSendMsg = {
        typeUrl: "/cosmos.bank.v1beta1.MsgMultiSend",
        value: {
          inputs: [{
            address: nobleAddress,
            coins: [{
              denom: 'uusdc',
              amount: totalTransactionAmount.toString()
            }]
          }],
          outputs: recipientAmounts.map(recipient => ({
            address: recipient.address,
            coins: [{
              denom: 'uusdc',
              amount: recipient.amount
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
      
      setSendingProgress('Recording batch transaction...')
  
      // Record the batch transaction in database with all recipients
      await createBatchTransaction({
        senderAddress: nobleAddress,
        recipients: recipientAmounts.map(r => ({
          name: r.name || undefined,
          address: r.address,
          amount: (parseInt(r.amount) / 1_000_000).toString(), // Convert back to USDC for database
        })),
        txHash: result.transactionHash,
        totalAmount: totalAmount,
        memo: loadedListType === 'percentage' 
          ? `Fund split payment to ${validRecipients.length} recipients`
          : `Batch payment to ${validRecipients.length} recipients`,
        status: 'confirmed'
      })
  
      // Show success message
      if (loadedListType === 'percentage') {
        alert(`✅ Successfully split $${totalAmount.toFixed(2)} USDC among ${validRecipients.length} recipients!`)
      } else {
        alert(`✅ Successfully sent $${parseFloat(paymentAmount).toFixed(2)} USDC to each of ${validRecipients.length} recipients!`)
      }
      
      // Reset form
      setRecipients([{ id: '1', name: '', address: '', isValid: false }])
      setPaymentAmount('')
      setLoadedListType('fixed')
  
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

  // Handle list loading
  const handleLoadList = async (listId: number) => {
    try {
      const { list, recipients } = await loadList(listId)
      
      setLoadedListType(list.listType || 'fixed') // Set the loaded list type
      
      const convertedRecipients = recipients.map((r: any, index: number) => ({
        id: `loaded-${r.id}-${Date.now()}-${index}`,
        name: r.name || '',
        address: r.address,
        percentage: r.percentage || undefined,
        isValid: validateRecipient(r.address)
      }))

      setRecipients(convertedRecipients)
      setShowListSelector(false)
      alert(`✅ Loaded "${list.name}" (${list.listType === 'percentage' ? 'Fund Split' : 'Fixed Amount'}) with ${recipients.length} recipients`)
    } catch (error) {
      alert(`❌ Failed to load list: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Handle save to list
  const handleSaveToList = async () => {
    if (validRecipients.length === 0) return

    setIsSavingList(true)
    try {
      await createList({
        name: saveListName.trim(),
        description: saveListDescription.trim() || undefined,
        recipients: validRecipients.map(r => ({
          name: r.name || undefined,
          address: r.address,
        }))
      })
      
      setSaveListName('')
      setSaveListDescription('')
      setSelectedListForSaving(null)
      alert(`✅ Saved as new list "${saveListName}"`)
    } catch (error) {
      alert(`❌ Failed to save list: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSavingList(false)
    }
  }

  // Handle contact loading
  const handleLoadContact = (contact: any) => {
    // Check if contact is already in recipients
    const existingRecipient = recipients.find(r => r.address === contact.address)
    if (existingRecipient) {
      alert(`${contact.name} is already in your recipient list`)
      setShowContactSelector(false)
      return
    }

    const newRecipient = {
      id: `contact-${contact.id}-${Date.now()}`,
      name: contact.name,
      address: contact.address,
      isValid: validateRecipient(contact.address)
    }
    setRecipients([...recipients, newRecipient])
    setShowContactSelector(false)
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

            {/* Payment Amount, Summary & Send Button - Complete section */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Payment Details
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Amount Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {loadedListType === 'percentage' ? 'Total Fund Amount (USDC)' : 'Amount per Recipient (USDC)'}
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {loadedListType === 'percentage' 
                      ? 'Split among recipients based on their %'
                      : 'This amount will be sent to each recipient in your list'
                    }
                  </p>
                </div>
                
                {/* Summary Stats */}
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl pt-7 font-bold text-gray-900 dark:text-gray-100">
                        {validRecipients.length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Recipients
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl pt-7 font-bold text-blue-600">
                        ${totalAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Total Amount
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance Check */}
              {paymentAmount && validRecipients.length > 0 && (
                <div className="mt-4">
                  {hasInsufficientBalance ? (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        ⚠️ Insufficient balance. You need ${totalAmount.toFixed(6)} USDC but only have ${currentBalance.toFixed(6)} USDC.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        ✅ Sufficient balance for this transaction.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Send Button */}
              <div className="mt-6">
                <button
                  onClick={handleSend}
                  disabled={!finalCanSend || isSending || hasInsufficientBalance}
                  className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-all ${
                    finalCanSend && !isSending && !hasInsufficientBalance
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
                  ) : !finalCanSend ? (
                    loadedListType === 'percentage' && Math.abs(getTotalPercentage() - 100) > 0.01
                      ? `Percentages must equal 100% (currently ${getTotalPercentage().toFixed(1)}%)`
                      : !nobleConnected 
                        ? 'Connect Noble Wallet to Continue'
                        : validRecipients.length === 0 
                          ? 'Add Valid Recipients to Continue'
                          : !paymentAmount 
                            ? 'Enter Payment Amount to Continue'
                            : 'Complete Details to Continue'
                  ) : loadedListType === 'percentage' ? (
                    `Split $${totalAmount.toFixed(2)} USDC among ${validRecipients.length} Recipients`
                  ) : (
                    `Send $${totalAmount.toFixed(2)} USDC to ${validRecipients.length} Recipients`
                  )}
                </button>
              </div>
            </div>

            {/* Recipients Form - Ultra Compact Layout */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recipients ({recipients.length})
                </h2>
                <div className="flex items-center space-x-1">
                  {/* Contact Selector - Icon Only */}
                  <div className="relative">
                    <button
                      onClick={() => setShowContactSelector(!showContactSelector)}
                      className="p-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors"
                      title="Add from Contacts"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                    
                    {showContactSelector && (
                      <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select a Contact</span>
                            <Link
                              href="/dashboard/contacts"
                              className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400"
                            >
                              Manage Contacts
                            </Link>
                          </div>
                        </div>
                        
                        {contacts.length === 0 ? (
                          <div className="p-4">
                            <div className="text-center">
                              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No contacts found</p>
                              <Link
                                href="/dashboard/contacts"
                                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400"
                              >
                                Create your first contact
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="py-1">
                            {contacts.map((contact) => (
                              <button
                                key={contact.id}
                                onClick={() => handleLoadContact(contact)}
                                className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                              >
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
                                    {contact.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {contact.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                                      {contact.address.slice(0, 12)}...{contact.address.slice(-8)}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Load List Dropdown - Icon Only */}
                  <div className="relative">
                    <button
                      onClick={() => setShowListSelector(!showListSelector)}
                      className="p-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
                      title="Load Recipient List"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    
                    {showListSelector && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                        <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select a List</span>
                            <Link
                              href="/dashboard/lists"
                              className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400"
                            >
                              Manage Lists
                            </Link>
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {listsLoading ? (
                            <div className="p-3 text-sm text-gray-500">Loading lists...</div>
                          ) : lists.length === 0 ? (
                            <div className="p-3">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No saved lists</p>
                              <Link
                                href="/dashboard/lists"
                                className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400"
                              >
                                Create your first list
                              </Link>
                            </div>
                          ) : (
                            lists.map((list) => (
                              <button
                                key={list.id}
                                onClick={() => handleLoadList(list.id)}
                                className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {list.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {list.totalRecipients} recipients • {list.listType === 'percentage' ? 'Fund Split' : 'Fixed Amount'}
                                    </div>
                                  </div>
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save as List - Icon Only */}
                  {validRecipients.length > 0 && (
                    <button
                      onClick={() => {
                        const name = prompt('Enter a name for this recipient list:')
                        if (name) {
                          setSaveListName(name)
                          setSaveListDescription('')
                          handleSaveToList()
                        }
                      }}
                      className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                      title="Save as List"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Manage Lists Link - Icon Only */}
                  <Link
                    href="/dashboard/lists"
                    className="p-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
                    title="Manage Lists"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                  
                  {/* Add Recipient - Icon Only */}
                  <button
                    onClick={addRecipient}
                    className="p-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors"
                    title="Add Recipient"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Updated Tip with Icon References */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Quick Actions:</strong> 
                  <span className="inline-flex items-center mx-1">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Contacts
                  </span>
                  •
                  <span className="inline-flex items-center mx-1">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Lists
                  </span>
                  •
                  <span className="inline-flex items-center mx-1">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Save
                  </span>
                  •
                  <span className="inline-flex items-center mx-1">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add
                  </span>
                </p>
              </div>

              {/* Rest of the recipients form... */}
              {/* Header Row - Desktop Only */}
              <div className="hidden md:grid grid-cols-12 gap-3 mb-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400">
                <div className="col-span-1">#</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-7">Noble Address</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Recipients List */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="space-y-1 p-2">
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
                        <div className="col-span-7">
                          <input
                            type="text"
                            value={recipient.address}
                            onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                            placeholder="noble1..."
                            className="w-full px-2 py-1.5 text-sm font-mono border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        
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
                      <div className="md:hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Recipient {index + 1}
                            {recipient.name && (
                              <span className="ml-2 text-blue-600 dark:text-blue-400 font-normal">
                                • {recipient.name}
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
                        </div>
                      </div>

                      {/* Status Indicator */}
                      {recipient.address && (
                        <div className="mt-2 flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            recipient.isValid ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className={`text-xs ${
                            recipient.isValid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                          }`}>
                            {recipient.isValid ? 'Valid address' : 'Invalid Noble address'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions for large lists */}
              {recipients.length > 5 && (
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Showing all {recipients.length} recipients • {validRecipients.length} valid
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const newRecipients = Array.from({ length: 5 }, (_, i) => ({
                          id: `bulk-${Date.now()}-${i}`,
                          name: '',
                          address: '',
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
                        const confirmed = confirm('Remove all empty recipients?')
                        if (confirmed) {
                          setRecipients(recipients.filter(r => r.address || r.name))
                        }
                      }}
                      className="text-sm text-red-500 hover:text-red-700 dark:text-red-400"
                    >
                      Remove empty
                    </button>
                    <button
                      onClick={() => {
                        const element = document.querySelector('.max-h-96')
                        element?.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400"
                    >
                      Scroll to top
                    </button>
                  </div>
                </div>
              )}

              {/* Large List Warning */}
              {recipients.length > 100 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    ⚠️ <strong>Large recipient list:</strong> Consider splitting into smaller batches for better performance and reliability.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Distribution Preview and Transaction History */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Distribution Preview Card */}
            {loadedListType === 'percentage' && validRecipients.length > 0 && paymentAmount && (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
                <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                    Distribution Preview
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ${parseFloat(paymentAmount).toFixed(2)} total split by percentages
                  </p>
                </header>
                <div className="p-5">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {validRecipients.map((recipient) => {
                      const recipientAmount = (parseFloat(paymentAmount) || 0) * (parseFloat(recipient.percentage || '0') / 100)
                      return (
                        <div key={recipient.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/60 last:border-b-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
                                {recipient.name?.charAt(0) || (recipient.address.slice(6, 8).toUpperCase())}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {recipient.name || `Recipient ${validRecipients.indexOf(recipient) + 1}`}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                                  {recipient.address.slice(0, 12)}...{recipient.address.slice(-8)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              ${recipientAmount.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {recipient.percentage}%
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Total Validation */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Allocation
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          ${parseFloat(paymentAmount).toFixed(2)}
                        </div>
                        <div className={`text-xs font-medium ${
                          Math.abs(getTotalPercentage() - 100) < 0.01 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {getTotalPercentage().toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction History Card */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl sticky top-8">
              <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                    Recent Transactions
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {transactions.filter(tx => tx.status === 'confirmed').length}
                      </span>
                      {transactions.filter(tx => tx.status === 'failed').length > 0 && (
                        <>
                          <span className="text-xs text-gray-400">/</span>
                          <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                            {transactions.filter(tx => tx.status === 'failed').length} failed
                          </span>
                        </>
                      )}
                    </div>
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
              </header>

              <div className="p-5">
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
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
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
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {transactions.slice(0, 15).map((transaction) => {
                      const isBatch = transaction.batchId && transaction.totalRecipients && transaction.totalRecipients > 1
                      const statusColor = transaction.status === 'confirmed' ? 'green' :
                                         transaction.status === 'pending' ? 'yellow' : 'red'
                      
                      return (
                        <div key={transaction.id} className="group">
                          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/60 last:border-b-0">
                            <div className="flex items-center min-w-0 flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3 ${
                                statusColor === 'green' ? 'bg-green-500' :
                                statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}>
                                {transaction.recipientName?.charAt(0) || '$'}
                              </div>
                              
                              <div className="min-w-0 flex-1">
                                {/* Batch info */}
                                {isBatch && (
                                  <div className="flex items-center mb-1">
                                    <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-medium">
                                      {transaction.totalRecipients}x BATCH
                                    </span>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {transaction.recipientName || 'Payment'}
                                  </p>
                                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-2">
                                    ${parseFloat(transaction.amount).toFixed(2)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                                    {transaction.recipientAddress.slice(0, 8)}...{transaction.recipientAddress.slice(-6)}
                                  </p>
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
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity pl-11 pb-2">
                              <a
                                href={`https://mintscan.io/noble/txs/${transaction.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View on Explorer
                              </a>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    
                    {transactions.length > 15 && (
                      <div className="text-center pt-3 border-t border-gray-100 dark:border-gray-700/60">
                        <button className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                          View All ({transactions.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Stats */}
                {transactions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
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
      </div>

      {/* Cosmos Wallet Modal */}
      {isCosmosModalOpen && (
        <CosmosWalletModal 
          isOpen={isCosmosModalOpen}
          onClose={() => setIsCosmosModalOpen(false)}
          chainName={selectedCosmosChain}
        />
      )}
    </>
  )
}