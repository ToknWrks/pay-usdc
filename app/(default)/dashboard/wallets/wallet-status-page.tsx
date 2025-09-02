'use client'

import { useState, useEffect } from 'react'
import { useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useCosmosWallet } from '@/hooks/use-cosmos-wallet'
import { useCosmosBalance } from '@/hooks/use-cosmos-balance'
import CosmosWalletModal from '@/components/cosmos-wallet-modal'
import { useChain } from '@cosmos-kit/react'
import { useMultiChainUsdcBalances } from '@/hooks/use-evm-balance'

// Define the USDC icon path
const USDC_ICON = '/images/usd-coin-usdc-logo.png'

export default function WalletStatusPage() {
  const [hasMounted, setHasMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'cosmos' | 'evm'>('cosmos')
  const [isCosmosModalOpen, setIsCosmosModalOpen] = useState(false)
  const [selectedCosmosChain, setSelectedCosmosChain] = useState('')
  
  // EVM Wallet
  const { isConnected: evmConnected, address: evmAddress } = useAccount()
  const { disconnect: evmDisconnect } = useDisconnect()
  const { open } = useAppKit()
  const currentChainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  // Cosmos Wallets - specific order: Noble, Osmosis, Cosmos Hub
  const noble = useCosmosWallet('noble')
  const osmosis = useCosmosWallet('osmosis')
  const cosmoshub = useCosmosWallet('cosmoshub')

  // Cosmos Balances
  const nobleBalance = useCosmosBalance('noble')
  const osmosisBalance = useCosmosBalance('osmosis')
  const cosmoshubBalance = useCosmosBalance('cosmoshub')

  // Multi-chain EVM USDC balances
  const { chains: evmChains, totalUsdc: evmTotalUsdc, isAnyLoading: evmLoading } = useMultiChainUsdcBalances(evmAddress)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Handle EVM connect
  const handleEvmConnect = () => {
    open()
  }

  // Handle cosmos connect
  const handleCosmosConnect = (chainName: string) => {
    setSelectedCosmosChain(chainName)
    setIsCosmosModalOpen(true)
  }

  // Generate Skip URL for bridging
  const generateSkipUrl = (chain: any, amount?: string) => {
    const baseUrl = 'https://go.skip.build/'
    
    const getUsdcAddress = (chainId: number) => {
      const usdcAddresses: { [key: number]: string } = {
        1: '0xA0b86a33E6441b46C6a74a9ed8fa1ba8ab6dd37e',
        10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
        137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      }
      return usdcAddresses[chainId] || ''
    }

    const params = new URLSearchParams({
      src_asset: getUsdcAddress(chain.chainId),
      src_chain: chain.chainId.toString(),
      dest_asset: 'uusdc',
      dest_chain: 'noble-1',
      ...(amount && { amount_in: amount })
    })

    return `${baseUrl}?${params.toString()}`
  }

  if (!hasMounted) {
    return <div>Loading...</div>
  }

  // Cosmos chains in specified order: Noble, Osmosis, Cosmos Hub
  const cosmosChains = [
    { 
      name: 'Noble', 
      chain: 'noble', 
      wallet: noble, 
      balance: nobleBalance,
      icon: (
        <img 
          src="https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/stake.png" 
          alt="Noble"
          className="w-8 h-8"
        />
      ),
      color: 'none',
      description: 'Native USDC Hub'
    },
    { 
      name: 'Osmosis', 
      chain: 'osmosis', 
      wallet: osmosis, 
      balance: osmosisBalance,
      icon: (
        <img 
          src="https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png" 
          alt="Osmosis"
          className="w-8 h-8"
        />
      ),
      color: 'none',
      description: 'DEX & DeFi'
    },
    { 
      name: 'Cosmos Hub', 
      chain: 'cosmoshub', 
      wallet: cosmoshub, 
      balance: cosmoshubBalance,
      icon: (
        <img 
          src="https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png" 
          alt="Cosmos Hub"
          className="w-8 h-8"
        />
      ),
      color: 'none',
      description: 'ATOM '
    },
  ]

  const anyCosmosConnected = cosmosChains.some(chain => chain.wallet.isConnected)
  const totalConnected = (evmConnected ? 1 : 0) + cosmosChains.filter(chain => chain.wallet.isConnected).length

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            Wallet Status
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your connected wallets and view balances across chains
          </p>
        </div>

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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Noble USDC</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${nobleBalance.native?.formatted || '0.00'}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">EVM USDC</p>
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

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('cosmos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'cosmos'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">⚛️</span>
                  Cosmos Chains
                  {anyCosmosConnected && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                      {cosmosChains.filter(chain => chain.wallet.isConnected).length}
                    </span>
                  )}
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('evm')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'evm'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">⟠</span>
                  EVM Chains
                  {evmConnected && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {evmChains.length}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'cosmos' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Cosmos Ecosystem Wallets
                </h3>
                
                {cosmosChains.map((cosmosChain) => (
                  <div key={cosmosChain.chain} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-4 last:mb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 ${cosmosChain.color} rounded-full flex items-center justify-center text-white text-xl mr-4`}>
                          {cosmosChain.icon}
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {cosmosChain.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cosmosChain.description}
                          </p>
                          {cosmosChain.wallet.isConnected && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                              {cosmosChain.wallet.address}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {cosmosChain.wallet.isConnected ? (
                          <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {cosmosChain.balance.isLoading ? (
                                <span className="animate-pulse">Loading...</span>
                              ) : (
                                `${cosmosChain.balance.native?.formatted || '0.00'} ${cosmosChain.balance.native?.symbol || 'TOKENS'}`
                              )}
                            </div>
                            <button
                              onClick={() => cosmosChain.wallet.disconnect()}
                              className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCosmosConnect(cosmosChain.chain)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'evm' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    EVM Chain Wallets & USDC Balances
                  </h3>
                  {evmConnected && (
                    <button
                      onClick={() => evmDisconnect()}
                      className="px-4 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      Disconnect EVM
                    </button>
                  )}
                </div>

                {!evmConnected ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Connect your EVM wallet
                          </h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            Connect MetaMask or another EVM wallet to view USDC balances across chains.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleEvmConnect}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Connect EVM Wallet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {evmChains.map((chain) => (
                      <div key={chain.chainId} className={`bg-gray-50 dark:bg-gray-700 rounded-xl p-6 ${currentChainId === chain.chainId ? 'ring-2 ring-blue-500' : ''}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <img 
                              src={chain.logo} 
                              alt={chain.name}
                              className="w-10 h-10 rounded-full mr-3"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                if (target.nextElementSibling) {
                                  (target.nextElementSibling as HTMLElement).style.display = 'flex'
                                }
                              }}
                            />
                            <div className={`w-10 h-10 ${chain.color} rounded-full items-center justify-center text-white font-bold mr-3`} style={{display: 'none'}}>
                              {chain.shortName}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">{chain.name}</h4>
                              {currentChainId === chain.chainId && (
                                <span className="text-xs text-blue-600 dark:text-blue-400">Current Chain</span>
                              )}
                            </div>
                          </div>
                          
                          {currentChainId !== chain.chainId && (
                            <button
                              onClick={() => switchChain({ chainId: chain.chainId })}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                            >
                              Switch
                            </button>
                          )}
                        </div>

                        {/* USDC Balance */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                                $
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">USDC</span>
                            </div>
                            <div className="text-right">
                              {chain.usdc.isLoading ? (
                                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-500 rounded animate-pulse"></div>
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
                                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center mt-1"
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
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <div>Network: {chain.name}</div>
                            <div>Chain ID: {chain.chainId}</div>
                          </div>

                          {/* Bridge Button */}
                          {chain.usdc.hasUsdc && (
                            <button
                              onClick={() => {
                                const skipUrl = generateSkipUrl(chain, chain.usdc.formatted)
                                window.open(skipUrl, '_blank', 'noopener,noreferrer')
                              }}
                              className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center"
                            >
                              Bridge ${chain.usdc.formatted} to Noble
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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