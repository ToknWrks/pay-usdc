'use client'

import { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react' // Add this import
import { useCosmosWallet } from '@/hooks/use-cosmos-wallet'
import { useCosmosBalance } from '@/hooks/use-cosmos-balance'
import CosmosWalletModal from '@/components/cosmos-wallet-modal'

export default function WalletStatusPage() {
  const [hasMounted, setHasMounted] = useState(false)
  const [isCosmosModalOpen, setIsCosmosModalOpen] = useState(false)
  const [selectedCosmosChain, setSelectedCosmosChain] = useState('')
  
  // EVM Wallet
  const { isConnected: evmConnected, address: evmAddress, connector } = useAccount()
  const { disconnect: evmDisconnect } = useDisconnect()
  const { open } = useAppKit() // Add this hook
  
  // Cosmos Wallets - check multiple chains
  const osmosis = useCosmosWallet('osmosis')
  const cosmoshub = useCosmosWallet('cosmoshub')
  const noble = useCosmosWallet('noble')

  // Cosmos Balances
  const osmosisBalance = useCosmosBalance('osmosis')
  const cosmoshubBalance = useCosmosBalance('cosmoshub')
  const nobleBalance = useCosmosBalance('noble')

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Handle EVM connect - open AppKit modal directly
  const handleEvmConnect = () => {
    open()
  }

  // Handle cosmos connect - open custom modal
  const handleCosmosConnect = (chainName: string) => {
    setSelectedCosmosChain(chainName)
    setIsCosmosModalOpen(true)
  }

  // Handle individual cosmos wallet disconnect
  const handleCosmosDisconnect = async (wallet: any, chainName: string) => {
    try {
      await wallet.disconnect()
      console.log(`Disconnected from ${chainName}`)
    } catch (error) {
      console.error(`Failed to disconnect from ${chainName}:`, error)
    }
  }

  // Prevent hydration issues
  if (!hasMounted) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const cosmosWallets = [
    { name: 'Osmosis', chain: 'osmosis', wallet: osmosis, balance: osmosisBalance },
    { name: 'Cosmos Hub', chain: 'cosmoshub', wallet: cosmoshub, balance: cosmoshubBalance },
    { name: 'Noble', chain: 'noble', wallet: noble, balance: nobleBalance },
  ]

  const anyCosmosConnected = cosmosWallets.some(w => w.wallet.isConnected)
  const totalConnected = (evmConnected ? 1 : 0) + cosmosWallets.filter(w => w.wallet.isConnected).length

  // Helper function to get native token symbol
  const getNativeSymbol = (chainName: string) => {
    const symbols = {
      osmosis: 'OSMO',
      cosmoshub: 'ATOM', 
      noble: 'USDC',
      juno: 'JUNO',
      stargaze: 'STARS'
    }
    return symbols[chainName as keyof typeof symbols] || 'NATIVE'
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        
        {/* Page Header */}
        {/* <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            Connected Wallets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage your EVM & Cosmos wallet connections
          </p>
        </div> */}

        {/* Connection Summary */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Connection Status
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {totalConnected > 0 
                  ? `${totalConnected} wallet${totalConnected > 1 ? 's' : ''} connected`
                  : 'No wallets connected'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${totalConnected > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {totalConnected > 0 ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* EVM Wallets Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              EVM Chains
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              evmConnected 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
            }`}>
              {evmConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          {evmConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {connector?.name || 'Unknown Wallet'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    EVM Compatible • Multiple chains supported
                  </div>
                </div>
                <button
                  onClick={() => evmDisconnect()}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p>No EVM wallet connected</p>
              <p className="text-sm mb-4">Connect MetaMask, WalletConnect, or other EVM wallets</p>
              <button
                onClick={handleEvmConnect}
                className="px-4 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                Connect EVM Wallet
              </button>
            </div>
          )}
        </div>

        {/* Cosmos Wallets Section - Updated with icons and no green borders */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cosmos Chains
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              anyCosmosConnected 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
            }`}>
              {cosmosWallets.filter(w => w.wallet.isConnected).length} of {cosmosWallets.length} Connected
            </span>
          </div>

          <div className="space-y-4">
            {cosmosWallets.map((chainWallet) => (
              <div key={chainWallet.chain} className={`p-4 rounded-lg transition-colors ${
                chainWallet.wallet.isConnected 
                  ? 'bg-gray-50 dark:bg-gray-700'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {/* Chain Icon */}
                      {chainWallet.balance.chainConfig?.icon && (
                        <img 
                          src={chainWallet.balance.chainConfig.icon} 
                          alt={chainWallet.name}
                          className="w-6 h-6 mr-3 rounded-full" // or w-5 h-5 mr-2 for modal
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      )}
                      
                      {/* Connection Status Dot */}
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        chainWallet.wallet.isConnected ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {chainWallet.name}
                      </span>
                    </div>
                    
                    {chainWallet.wallet.isConnected ? (
                      <div className="mt-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {chainWallet.wallet.address?.slice(0, 12)}...{chainWallet.wallet.address?.slice(-8)}
                        </div>
                        
                        {/* Wallet Name with Icon */}
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-1">
                          <span>Chain: {chainWallet.chain}</span>
                          <span className="mx-1">•</span>
                          
                          {/* Wallet Icon */}
                          {chainWallet.wallet.wallet?.prettyName === 'Keplr' && (
                            <span className="flex items-center">
                              <img 
                                src="/images/keplr.png" 
                                alt="Keplr"
                                className="w-3 h-3 mr-1 rounded object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                              Keplr
                            </span>
                          )}
                          {chainWallet.wallet.wallet?.prettyName === 'Leap' && (
                            <span className="flex items-center">
                              <img 
                                src="/images/leap.png" 
                                alt="Leap"
                                className="w-3 h-3 mr-1 rounded object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                              Leap
                            </span>
                          )}
                          {!['Keplr', 'Leap'].includes(chainWallet.wallet.wallet?.prettyName || '') && (
                            <span>{chainWallet.wallet.wallet?.prettyName || 'Unknown'}</span>
                          )}
                        </div>
                        
                        {/* Balance Information with Token Icons */}
                        {chainWallet.balance.isLoading ? (
                          <div className="text-xs text-gray-500 mt-2">Loading balances...</div>
                        ) : chainWallet.balance.error ? (
                          <div className="text-xs text-red-500 mt-2">Error loading balances</div>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {chainWallet.balance.native && (
                              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md">
                                <div className="flex items-center">
                                  {chainWallet.balance.native.icon && (
                                    <img 
                                      src={chainWallet.balance.native.icon} 
                                      alt={chainWallet.balance.native.symbol}
                                      className="w-4 h-4 mr-2 rounded-full"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none'
                                      }}
                                    />
                                  )}
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {chainWallet.balance.native.symbol}:
                                  </span>
                                </div>
                                <span className="text-xs font-mono text-gray-800 dark:text-gray-200">
                                  {chainWallet.balance.native.formatted}
                                </span>
                              </div>
                            )}
                            
                            {chainWallet.balance.usdc && (
                              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md">
                                <div className="flex items-center">
                                  {chainWallet.balance.usdc.icon && (
                                    <img 
                                      src={chainWallet.balance.usdc.icon} 
                                      alt="USDC"
                                      className="w-4 h-4 mr-2 rounded-full"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none'
                                      }}
                                    />
                                  )}
                                  <span className="text-xs text-gray-600 dark:text-gray-400">USDC:</span>
                                </div>
                                <span className="text-xs font-mono text-gray-800 dark:text-gray-200">
                                  ${chainWallet.balance.usdc.formatted}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Not connected to {chainWallet.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {chainWallet.wallet.isConnected ? (
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => chainWallet.balance.refetch()}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors"
                        >
                          Refresh
                        </button>
                        <button
                          onClick={() => handleCosmosDisconnect(chainWallet.wallet, chainWallet.chain)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCosmosConnect(chainWallet.chain)}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 rounded transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Rest of the cosmos section remains the same */}
        </div>

        {/* Quick Actions */}
        {totalConnected === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    Get Started
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Connect your first wallet to start using Pay USDC.
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEvmConnect}
                  className="px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors text-sm"
                >
                  Connect EVM
                </button>
                <button
                  onClick={() => handleCosmosConnect('osmosis')}
                  className="px-3 py-2 bg-purple-500 text-white hover:bg-purple-600 rounded-lg transition-colors text-sm"
                >
                  Connect Cosmos
                </button>
              </div>
            </div>
          </div>
        )}
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