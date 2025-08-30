'use client'

import { useState, useEffect } from 'react'
import { useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useAppKit } from '@reown/appkit/react' // Add this import
import { useCosmosWallet } from '@/hooks/use-cosmos-wallet'
import { useCosmosBalance } from '@/hooks/use-cosmos-balance'
import CosmosWalletModal from '@/components/cosmos-wallet-modal'
import { useChain } from '@cosmos-kit/react'
import { useMultiChainUsdcBalances } from '@/hooks/use-evm-balance'

// Define the USDC icon path
const USDC_ICON = '/images/usd-coin-usdc-logo.png'

// Export USDC icon for use in other components
export { USDC_ICON }

export default function WalletStatusPage() {
  const [hasMounted, setHasMounted] = useState(false)
  const [isCosmosModalOpen, setIsCosmosModalOpen] = useState(false)
  const [selectedCosmosChain, setSelectedCosmosChain] = useState('')
  
  // EVM Wallet
  const { isConnected: evmConnected, address: evmAddress, connector } = useAccount()
  const { disconnect: evmDisconnect } = useDisconnect()
  const { open } = useAppKit() // Add this hook
  const currentChainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  // Cosmos Wallets - check multiple chains
  const osmosis = useCosmosWallet('osmosis')
  const cosmoshub = useCosmosWallet('cosmoshub')
  const noble = useCosmosWallet('noble')

  // Cosmos Balances
  const osmosisBalance = useCosmosBalance('osmosis')
  const cosmoshubBalance = useCosmosBalance('cosmoshub')
  const nobleBalance = useCosmosBalance('noble')

  // Multi-chain EVM USDC balances
  const { chains: evmChains, totalUsdc: evmTotalUsdc, isAnyLoading: evmLoading } = useMultiChainUsdcBalances(evmAddress)

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

  // ADD THIS FUNCTION AT THE TOP OF THE COMPONENT
  const generateSkipUrl = (chain: any, amount?: string) => {
    const baseUrl = 'https://go.skip.build/'
    
    // Get USDC contract address for the source chain
    const getUsdcAddress = (chainId: number) => {
      const usdcAddresses: { [key: number]: string } = {
        1: '0xA0b86a33E6441b46C6a74a9ed8fa1ba8ab6dd37e', // Ethereum
        10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', // Optimism
        137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon
        42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum
        8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
        56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // BSC
      }
      return usdcAddresses[chainId] || ''
    }

    const params = new URLSearchParams({
      src_asset: getUsdcAddress(chain.chainId),
      src_chain: chain.chainId.toString(),
      dest_asset: 'uusdc', // USDC on Noble
      dest_chain: 'noble-1',
      ...(amount && { amount_in: amount })
    })

    return `${baseUrl}?${params.toString()}`
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
    }
    return symbols[chainName as keyof typeof symbols] || 'NATIVE'
  }

  // Calculate total USDC across all chains (EVM + Noble)
  const nobleUsdcAmount = parseFloat(nobleBalance.native?.formatted || '0')
  const totalUsdc = evmTotalUsdc + nobleUsdcAmount

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected Wallets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalConnected}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total USDC</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {evmLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    `$${totalUsdc.toFixed(2)}`
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bridgeable USDC</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {evmLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    `$${evmTotalUsdc.toFixed(2)}`
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* EVM Chains Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-5">
          {evmChains.map((chain) => (
            <div key={chain.chainId} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${currentChainId === chain.chainId ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {/* Updated to use proper chain logo */}
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={chain.logo} 
                      alt={chain.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to text if image fails
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling!.textContent = chain.shortName
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300" style={{display: 'none'}}>
                      {/* Fallback text will be inserted here */}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{chain.name}</h3>
                    {currentChainId === chain.chainId && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">Current Chain</span>
                    )}
                  </div>
                </div>
                
                {currentChainId !== chain.chainId && (
                  <button
                    onClick={() => switchChain({ chainId: chain.chainId })}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Switch
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* USDC Balance */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                      <img 
                        src={USDC_ICON} 
                        alt="USDC"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.parentElement!.innerHTML = '<div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">$</div>'
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">USDC</span>
                  </div>
                  <div className="text-right">
                    {chain.usdc.isLoading ? (
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    ) : (
                      <>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          ${chain.usdc.formatted}
                        </div>
                        {chain.usdc.hasUsdc && (
  <button 
    onClick={() => {
      const skipUrl = generateSkipUrl(chain, chain.usdc.formatted)
      window.open(skipUrl, '_blank', 'noopener,noreferrer')
    }}
    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center"
  >
    Bridge via Skip →
    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  </button>
)}
                      </>
                    )}
                  </div>
                </div>

                {/* Chain Info */}
               
              </div>
            </div>
          ))}
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
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 8a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
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