// app/profile/[username]/ProfileClient.tsx (CLIENT COMPONENT)
'use client'

import { useState, useEffect } from 'react'
import { useChain } from '@cosmos-kit/react'
import QRCodeModal from '@/components/qr-code-modal'
import CosmosWalletModal from '@/components/cosmos-wallet-modal'
import AssetSelector from '@/components/asset-selector'
import { useOsmosisAssets } from '@/hooks/use-osmosis-assets'
import { TOKENS } from '@/lib/tokens'

interface User {
  id: number
  nobleAddress: string
  customUrl: string | null
  isActive: boolean | null
  createdAt: Date | null
  updatedAt: Date | null
  lastLoginAt: Date | null
}

interface ProfileClientProps {
  user: User
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [isCosmosModalOpen, setIsCosmosModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'send' | 'swap'>('send')
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [swapAmount, setSwapAmount] = useState('')
  const [transactionStep, setTransactionStep] = useState<1 | 2 | 3>(1)
  const [swapTxHash, setSwapTxHash] = useState('')
  const [transferTxHash, setTransferTxHash] = useState('')
  
  // Noble wallet connection
  const { address: nobleAddress, isWalletConnected } = useChain('noble')

  // Osmosis assets
  const { assets, isLoading, error, refetch, connect, isConnected, highestValueAsset } = useOsmosisAssets()

  // Auto-select highest value asset when available
  useEffect(() => {
    console.log('🔍 Auto-select check:', {
      highestValueAsset: highestValueAsset?.symbol,
      selectedAsset: selectedAsset?.symbol,
      shouldSelect: !!(highestValueAsset && !selectedAsset)
    })
    
    if (highestValueAsset && !selectedAsset) {
      console.log('✅ Auto-selecting:', highestValueAsset.symbol)
      setSelectedAsset(highestValueAsset)
    }
  }, [highestValueAsset, selectedAsset])

  // HELPER FUNCTIONS 
  const getSwapPoolId = (symbol: string): string => {
    const poolMapping: Record<string, string> = {
      'OSMO': '1',
      'ATOM': '1', 
      'USDT': '678',
      'ETH': '704',
      'wBTC': '712',
      'JUNO': '497',
      'SCRT': '584',
      'AKT': '3',
      'REGEN': '42',
      'ION': '2',
    }
    return poolMapping[symbol] || '1'
  }

  const calculatePriceImpact = (amount: string, asset: any): string => {
    if (!amount || !asset) return '0.00'
    const amountNum = parseFloat(amount)
    const value = amountNum * asset.price
    
    if (value < 100) return '< 0.01'
    if (value < 1000) return '0.05'
    if (value < 10000) return '0.15'
    return '0.30'
  }

  const getPriceImpactColor = (amount: string, asset: any): string => {
    const impact = parseFloat(calculatePriceImpact(amount, asset).replace('< ', '').replace('%', ''))
    if (impact < 0.1) return 'text-green-600 dark:text-green-400'
    if (impact < 0.5) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const handleSendUSDC = () => {
    if (!isWalletConnected) {
      alert('Please connect your Noble wallet first')
      return
    }
    alert(`Send ${amount} USDC to @${user.customUrl}`)
  }

  const copyAddress = () => {
    navigator.clipboard?.writeText(user.nobleAddress)
    alert('Address copied!')
  }

  const copyProfileLink = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/${user.customUrl}`)
    alert('Profile link copied!')
  }

  const showQRCode = () => {
    setIsQRModalOpen(true)
  }

  const handleConnectWallet = () => {
    setIsCosmosModalOpen(true)
  }

  const getStepStatus = (stepNumber: 1 | 2 | 3) => {
    if (stepNumber < transactionStep) return 'completed'
    if (stepNumber === transactionStep) return 'current'
    return 'pending'
  }

  const getStepIcon = (stepNumber: 1 | 2 | 3) => {
    const status = getStepStatus(stepNumber)
    
    if (status === 'completed') {
      return (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    }
    
    if (status === 'current') {
      return (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        </div>
      )
    }
    
    return (
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{stepNumber}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header - Mobile Friendly */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-8 shadow-sm mb-8">
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl lg:text-3xl font-bold">
                {user.customUrl?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  @{user.customUrl}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg mt-1">
                  Noble Network User
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm font-mono mt-2 break-all">
                  {user.nobleAddress}
                </p>
              </div>
            </div>

            {/* Desktop Action buttons */}
            <div className="flex flex-col gap-2">
              {!isWalletConnected ? (
                <button
                  onClick={handleConnectWallet}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="text-xs text-green-600 dark:text-green-400 text-right">
                  ✓ Wallet Connected
                </div>
              )}
              
              <button
                onClick={showQRCode}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                QR Code
              </button>
              
              <button
                onClick={copyAddress}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Copy Address
              </button>
              
              <button
                onClick={copyProfileLink}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Share Profile
              </button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {user.customUrl?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                @{user.customUrl}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Noble Network User
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs font-mono mt-2 break-all px-2">
                {user.nobleAddress}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {!isWalletConnected ? (
                <button
                  onClick={handleConnectWallet}
                  className="col-span-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="col-span-2 text-center text-sm text-green-600 dark:text-green-400 py-2">
                  ✓ Wallet Connected
                </div>
              )}
              
              <button
                onClick={showQRCode}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                QR Code
              </button>
              
              <button
                onClick={copyAddress}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Copy Address
              </button>
              
              <button
                onClick={copyProfileLink}
                className="col-span-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Share Profile
              </button>
            </div>
          </div>
        </div>

        {/* Payment & Swap Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Panel - Tabbed Send/Swap */}
            <div>
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('send')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'send'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Send USDC
                </button>
                <button
                  onClick={() => setActiveTab('swap')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'swap'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Swap to USDC
                </button>
              </div>

              {/* Send Tab Content */}
              {activeTab === 'send' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Send Payment
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount (USDC)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Memo (optional)
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Payment for..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!isWalletConnected) {
                        handleConnectWallet()
                      } else {
                        handleSendUSDC()
                      }
                    }}
                    disabled={isWalletConnected && (!amount || parseFloat(amount) <= 0)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {!isWalletConnected ? 'Connect Noble Wallet' : 'Send USDC'}
                  </button>
                </div>
              )}

              {/* Swap Tab Content */}
              {activeTab === 'swap' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Swap to USDC
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Asset
                    </label>
                    <AssetSelector 
                      onAssetSelect={(asset) => {
                        console.log('🎯 Asset selected:', asset.symbol)
                        setSelectedAsset(asset)
                      }}
                      selectedAsset={selectedAsset}
                    />
                    
                    {selectedAsset && (
                      <div className="mt-2">
                        <input
                          type="number"
                          value={swapAmount}
                          onChange={(e) => setSwapAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.000001"
                          max={selectedAsset.amount}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Available: {selectedAsset.amount} {selectedAsset.symbol} (${selectedAsset.value.toFixed(2)})
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      To
                    </label>
                    <div className="flex items-center w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mb-2">
                      {TOKENS.USDC?.icon && (
                        <img 
                          src={TOKENS.USDC.icon} 
                          alt="USDC"
                          className="w-6 h-6 rounded-full mr-3"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      )}
                      <span>USDC - USD Coin</span>
                    </div>
                    <input
                      type="number"
                      value={
                        selectedAsset && swapAmount && selectedAsset.price
                          ? (parseFloat(swapAmount) * selectedAsset.price).toFixed(6)
                          : ''
                      }
                      placeholder="0.00"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!isWalletConnected) {
                        handleConnectWallet() // Use the same function as desktop Connect Wallet button
                      } else if (!selectedAsset) {
                        // Asset selector should handle this
                        alert('Please select an asset to swap')
                      } else if (!swapAmount) {
                        alert('Please enter an amount to swap')
                      } else {
                        // Execute the swap
                        // TODO: Implement actual swap logic
                        alert(`Swapping ${swapAmount} ${selectedAsset.symbol} to USDC`)
                      }
                    }}
                    disabled={!isWalletConnected ? false : (!selectedAsset || !swapAmount)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {!isWalletConnected ? 'Connect Osmosis Wallet' : !selectedAsset ? 'Select Asset' : 'Swap to USDC'}
                  </button>
                </div>
              )}

              {/* Wallet Status */}
              <div className="mt-4 text-xs text-center">
                {isWalletConnected ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Connected: {nobleAddress?.slice(0, 10)}...{nobleAddress?.slice(-6)}
                  </span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    ⚠ Connect your wallet to continue
                  </span>
                )}
              </div>
            </div>

            {/* Right Panel - Transaction Details */}
            <div className="lg:border-l lg:border-gray-200 dark:lg:border-gray-700 lg:pl-8">
              {activeTab === 'send' ? (
                // Simple details for send tab
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Recipient Details
                  </h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Username:</span>
                        <span className="ml-2 font-mono">@{user.customUrl}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400"></span>
                        <div className="mt-1 font-mono text-xs break-all bg-white dark:bg-gray-800 p-2 rounded border">
                          {user.nobleAddress}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  {amount && (
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg mt-4">
                      <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                        Payment Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                          <span className="font-medium">{amount} USDC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Network Fee:</span>
                          <span>~$0.01</span>
                        </div>
                        {note && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Memo:</span>
                            <div className="mt-1 text-gray-800 dark:text-gray-200">{note}</div>
                          </div>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between font-medium">
                          <span>Total:</span>
                          <span>{amount} USDC</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Step-by-step details for swap tab ONLY
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                    Transaction Progress
                  </h3>
                  
                  {/* Step Progress Bar */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      {[1, 2, 3].map((step, index) => (
                        <div key={step} className="flex items-center">
                          <div className="flex flex-col items-center">
                            {getStepIcon(step as 1 | 2 | 3)}
                            <span className={`text-xs mt-2 ${
                              getStepStatus(step as 1 | 2 | 3) === 'current' 
                                ? 'text-blue-600 dark:text-blue-400 font-medium' 
                                : getStepStatus(step as 1 | 2 | 3) === 'completed'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              Step {step}
                            </span>
                          </div>
                          {index < 2 && (
                            <div className={`flex-1 h-0.5 mx-4 ${
                              step < transactionStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}></div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Step Labels */}
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Swap Tokens</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Transfer to Noble</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Payment Complete</span>
                    </div>
                  </div>

                  {/* Step Details - Your existing step content */}
                  <div className="space-y-6">
                    {/* Step 1: Swap Details - EXPANDED */}
                    <div className={`p-4 rounded-lg border-2 ${
                      transactionStep === 1 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                        : transactionStep > 1 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800 dark:text-gray-100">
                          Step 1: Swap Tokens
                        </h4>
                        {transactionStep > 1 && swapTxHash && (
                          <a 
                            href={`https://www.mintscan.io/osmosis/txs/${swapTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View Tx →
                          </a>
                        )}
                      </div>
                      
                      {selectedAsset && swapAmount ? (
                        <div className="space-y-4">
                          {/* Basic Swap Info */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Swap:</span>
                              <span>{swapAmount} {selectedAsset.symbol} → ${(parseFloat(swapAmount) * selectedAsset.price).toFixed(4)} USDC</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Pool:</span>
                              <span>#{getSwapPoolId(selectedAsset.symbol)}</span>
                            </div>
                          </div>

                          {/* Complete Swap Details */}
                          <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="space-y-3">
                              {/* DEX Information */}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">DEX:</span>
                                <div className="flex items-center">
                                  <img 
                                    src="https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png"
                                    alt="Osmosis"
                                    className="w-4 h-4 rounded-full mr-2"
                                  />
                                  <span className="text-sm font-medium">Osmosis</span>
                                </div>
                              </div>

                              {/* Exchange Rate */}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Exchange Rate:</span>
                                <span className="text-sm font-medium">
                                  1 {selectedAsset.symbol} = ${selectedAsset.price.toFixed(6)} USDC
                                </span>
                              </div>

                              {/* Estimated Output */}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Estimated Output:</span>
                                <span className="text-sm font-medium">
                                  ${(parseFloat(swapAmount) * selectedAsset.price).toFixed(6)} USDC
                                </span>
                              </div>

                              {/* Slippage */}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Slippage Tolerance:</span>
                                <span className="text-sm">0.5%</span>
                              </div>

                              {/* Minimum Received */}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Minimum Received:</span>
                                <span className="text-sm">
                                  ${((parseFloat(swapAmount) * selectedAsset.price) * 0.995).toFixed(6)} USDC
                                </span>
                              </div>

                              {/* Fees Breakdown */}
                              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 dark:text-gray-400">Swap Fee:</span>
                                  <span className="text-sm">
                                    ${((parseFloat(swapAmount) * selectedAsset.price) * 0.003).toFixed(4)} (0.3%)
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 dark:text-gray-400">Network Fee:</span>
                                  <span className="text-sm">~0.01 OSMO (~$0.005)</span>
                                </div>
                              </div>

                              {/* Price Impact */}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Price Impact:</span>
                                <span className={`text-sm ${getPriceImpactColor(swapAmount, selectedAsset)}`}>
                                  {calculatePriceImpact(swapAmount, selectedAsset)}%
                                </span>
                              </div>

                              {/* Route Visualization */}
                              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Route:</div>
                                <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                                  <div className="flex items-center">
                                    {selectedAsset.icon && (
                                      <img src={selectedAsset.icon} alt={selectedAsset.symbol} className="w-4 h-4 rounded-full mr-1" />
                                    )}
                                    <span className="text-xs font-medium">{selectedAsset.symbol}</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    <div className="text-xs text-gray-400">Pool #{getSwapPoolId(selectedAsset.symbol)}</div>
                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    {TOKENS.USDC?.icon ? (
                                      <img 
                                        src={TOKENS.USDC.icon} 
                                        alt="USDC"
                                        className="w-4 h-4 rounded-full mr-1"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement
                                          target.style.display = 'none'
                                        }}
                                      />
                                    ) : (
                                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-1">
                                        $
                                      </div>
                                    )}
                                    <span className="text-xs font-medium">USDC</span>
                                  </div>
                                </div>
                              </div>

                              {/* Summary */}
                              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between items-center font-medium">
                                  <span className="text-gray-800 dark:text-gray-200">You Pay:</span>
                                  <span>{swapAmount} {selectedAsset.symbol}</span>
                                </div>
                                <div className="flex justify-between items-center font-medium mt-1">
                                  <span className="text-gray-800 dark:text-gray-200">You Receive:</span>
                                  <span>
                                    ~${((parseFloat(swapAmount) * selectedAsset.price) * 0.995).toFixed(4)} USDC
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Select asset and amount to see swap details
                        </div>
                      )}
                    </div>

                    {/* Step 2 and 3 content... */}
                    {/* Add your existing step 2 and 3 content here */}

                    {/* Step 2: Transfer Details */}
                    <div className={`p-4 rounded-lg border-2 ${
                      transactionStep === 2 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                        : transactionStep > 2 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800 dark:text-gray-100">
                          Step 2: Transfer Payment
                        </h4>
                        {transactionStep > 2 && transferTxHash && (
                          <a 
                            href={`https://www.mintscan.io/noble/txs/${transferTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View Tx →
                          </a>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">To:</span>
                          <span>@{user.customUrl}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Network:</span>
                          <span>Noble (Cosmos)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Bridge Fee:</span>
                          <span>~$0.50</span>
                        </div>
                        {selectedAsset && swapAmount && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                            <span>${(parseFloat(swapAmount) * selectedAsset.price * 0.997).toFixed(4)} USDC</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Payment Complete */}
                    <div className={`p-4 rounded-lg border-2 ${
                      transactionStep === 3 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                        Step 3: Payment Complete
                      </h4>
                      
                      {transactionStep === 3 ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Payment successfully sent to @{user.customUrl}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            Transaction completed at {new Date().toLocaleTimeString()}
                          </div>
                          {selectedAsset && swapAmount && (
                            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                              <div className="text-xs font-medium text-gray-800 dark:text-gray-100 mb-2">Final Summary:</div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Swapped:</span>
                                  <span>{swapAmount} {selectedAsset.symbol}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Received:</span>
                                  <span>${(parseFloat(swapAmount) * selectedAsset.price * 0.997).toFixed(4)} USDC</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total Fees:</span>
                                  <span>${(parseFloat(swapAmount) * selectedAsset.price * 0.003 + 0.50).toFixed(4)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Payment will be completed after successful transfer
                        </div>
                      )}
                    </div>

                    {/* Detailed Swap Summary (always visible when asset selected) */}
                    {selectedAsset && swapAmount && (
                      <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                          Complete Swap Details
                        </h4>
                        <div className="space-y-3">
                          {/* DEX Information */}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">DEX:</span>
                            <div className="flex items-center">
                              <img 
                                src="https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png"
                                alt="Osmosis"
                                className="w-4 h-4 rounded-full mr-2"
                              />
                              <span className="text-sm font-medium">Osmosis</span>
                            </div>
                          </div>

                          {/* Route Information */}
                          <div className="flex justify-between items-start">
                            <span className="text-gray-600 dark:text-gray-400">Route:</span>
                            <div className="text-right">
                              <div className="text-sm font-medium">Pool #{getSwapPoolId(selectedAsset.symbol)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedAsset.symbol} → USDC
                              </div>
                            </div>
                          </div>

                          {/* Exchange Rate */}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Exchange Rate:</span>
                            <span className="text-sm font-medium">
                              1 {selectedAsset.symbol} = ${selectedAsset.price.toFixed(6)} USDC
                            </span>
                          </div>

                          {/* Estimated Output */}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Estimated Output:</span>
                            <span className="text-sm font-medium">
                              ${(parseFloat(swapAmount) * selectedAsset.price).toFixed(6)} USDC
                            </span>
                          </div>

                          {/* Slippage */}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Slippage Tolerance:</span>
                            <span className="text-sm">0.5%</span>
                          </div>

                          {/* Minimum Received */}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Minimum Received:</span>
                            <span className="text-sm">
                              ${((parseFloat(swapAmount) * selectedAsset.price) * 0.995).toFixed(6)} USDC
                            </span>
                          </div>

                          {/* Fees Breakdown */}
                          <div className="space-y-2 pt-2 border-t border-purple-200 dark:border-purple-800">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">Swap Fee:</span>
                              <span className="text-sm">
                                ${((parseFloat(swapAmount) * selectedAsset.price) * 0.003).toFixed(4)} (0.3%)
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">Network Fee:</span>
                              <span className="text-sm">~0.01 OSMO (~$0.005)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">Bridge Fee:</span>
                              <span className="text-sm">$0.50</span>
                            </div>
                          </div>

                          {/* Price Impact */}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Price Impact:</span>
                            <span className={`text-sm ${getPriceImpactColor(swapAmount, selectedAsset)}`}>
                              {calculatePriceImpact(swapAmount, selectedAsset)}%
                            </span>
                          </div>

                          {/* Route Visualization */}
                          <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Route:</div>
                            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                              <div className="flex items-center">
                                {selectedAsset.icon && (
                                  <img src={selectedAsset.icon} alt={selectedAsset.symbol} className="w-4 h-4 rounded-full mr-1" />
                                )}
                                <span className="text-xs font-medium">{selectedAsset.symbol}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <div className="text-xs text-gray-400">Pool #{getSwapPoolId(selectedAsset.symbol)}</div>
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                              
                              <div className="flex items-center">
                                {TOKENS.USDC?.icon ? (
                                  <img 
                                    src={TOKENS.USDC.icon} 
                                    alt="USDC"
                                    className="w-4 h-4 rounded-full mr-1"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-1">
                                    $
                                  </div>
                                )}
                                <span className="text-xs font-medium">USDC</span>
                              </div>
                            </div>
                          </div>

                          {/* Total Summary */}
                          <div className="pt-3 border-t border-purple-200 dark:border-purple-800">
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-gray-800 dark:text-gray-200">You Pay:</span>
                              <span>{swapAmount} {selectedAsset.symbol}</span>
                            </div>
                            <div className="flex justify-between items-center font-medium mt-1">
                              <span className="text-gray-800 dark:text-gray-200">You Receive:</span>
                              <span>
                                ~${((parseFloat(swapAmount) * selectedAsset.price) * 0.995).toFixed(4)} USDC
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                   
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Section - Keep existing */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Profile Information
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Profile</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Username:</span>
                  <span className="ml-2">@{user.customUrl}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Address:</span>
                  <div className="mt-1 font-mono text-xs break-all bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {user.nobleAddress}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Network</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Blockchain:</span>
                  <span className="ml-2">Noble (Cosmos)</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="ml-2 text-green-600">Active</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Activity</h3>
              <div className="space-y-2 text-sm">
                {user.createdAt && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                    <span className="ml-2">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Profile:</span>
                  <span className="ml-2">payusdc.app/{user.customUrl}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        address={user.nobleAddress}
        username={user.customUrl || undefined}
      />

      {/* Cosmos Wallet Modal */}
      <CosmosWalletModal 
        isOpen={isCosmosModalOpen} 
        onClose={() => setIsCosmosModalOpen(false)}
        chainName={activeTab === 'swap' ? 'osmosis' : 'noble'} // Dynamic chain based on tab
      />
    </div>
  )
}