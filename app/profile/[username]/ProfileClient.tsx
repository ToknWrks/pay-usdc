// app/profile/[username]/ProfileClient.tsx (CLIENT COMPONENT)
'use client'

import { useState } from 'react'
import { useChain } from '@cosmos-kit/react'
import QRCodeModal from '@/components/qr-code-modal'
import CosmosWalletModal from '@/components/cosmos-wallet-modal' // ADD THIS IMPORT

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
  const [isCosmosModalOpen, setIsCosmosModalOpen] = useState(false) // ADD THIS STATE
  const [activeTab, setActiveTab] = useState('send') // ADD THIS STATE
  
  // Noble wallet connection
  const { address: nobleAddress, isWalletConnected } = useChain('noble') // REMOVE connect from destructuring

  const handleSendUSDC = () => {
    if (!isWalletConnected) {
      alert('Please connect your Noble wallet first')
      return
    }
    // TODO: Implement USDC sending logic
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
    setIsCosmosModalOpen(true) // CHANGE THIS TO OPEN YOUR MODAL
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

            {/* Desktop Action buttons in upper right */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
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
            {/* Profile info centered on mobile */}
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

            {/* Mobile buttons in a grid */}
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

        {/* Payment & Swap Section - Side by Side */}
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

              {/* Tab Content */}
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
                      Note (optional)
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
                    onClick={handleSendUSDC}
                    disabled={!amount || parseFloat(amount) <= 0 || !isWalletConnected}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {!isWalletConnected ? 'Connect Wallet to Send' : 'Send USDC'}
                  </button>
                </div>
              )}

              {activeTab === 'swap' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Swap to USDC
                  </h3>
                  {/* From Token */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-2">
                      <option>ETH - Ethereum</option>
                      <option>ATOM - Cosmos Hub</option>
                      <option>OSMO - Osmosis</option>
                      <option>USDT - Tether</option>
                    </select>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Swap Arrow */}
                  <div className="flex justify-center">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>

                  {/* To Token */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      To
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mb-2">
                      USDC - USD Coin
                    </div>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    />
                  </div>

                  <button
                    disabled={!isWalletConnected}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {!isWalletConnected ? 'Connect Wallet to Swap' : 'Swap to USDC'}
                  </button>
                </div>
              )}

              {/* Wallet Connection Status */}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Transaction Details
              </h3>
              
              <div className="space-y-4">
                {/* Recipient Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                    Recipient
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Username:</span>
                      <span className="ml-2 font-mono">@{user.customUrl}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Network:</span>
                      <span className="ml-2">Noble (Cosmos)</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Address:</span>
                      <div className="mt-1 font-mono text-xs break-all bg-white dark:bg-gray-800 p-2 rounded border">
                        {user.nobleAddress}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Summary */}
                {activeTab === 'send' && amount && (
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
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
                          <span className="text-gray-600 dark:text-gray-400">Note:</span>
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

                {activeTab === 'swap' && (
                  <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                      Swap Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Exchange Rate:</span>
                        <span>1 ETH = 2,450 USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Slippage:</span>
                        <span>0.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Network Fee:</span>
                        <span>~$3.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Protocol Fee:</span>
                        <span>0.3%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-2">
                  
                </div>
              </div>
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
                  <span className="ml-2">pay-usdc.app/{user.customUrl}</span>
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
        chainName="noble"
      />
    </div>
  )
}