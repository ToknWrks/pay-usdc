'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogPanel, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useCosmosWallet } from '@/hooks/use-cosmos-wallet'
import { useCosmosBalance } from '@/hooks/use-cosmos-balance'
import CosmosWalletModal from '@/components/cosmos-wallet-modal'

interface WalletStatusModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WalletStatusModal({ isOpen, onClose }: WalletStatusModalProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const [isCosmosModalOpen, setIsCosmosModalOpen] = useState(false)
  const [selectedCosmosChain, setSelectedCosmosChain] = useState('')
  
  // EVM Wallet
  const { isConnected: evmConnected, address: evmAddress, connector } = useAccount()
  const { disconnect: evmDisconnect } = useDisconnect()
  const { open } = useAppKit()
  
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

  // Handle Noble connect specifically
  const handleNobleConnect = () => {
    setSelectedCosmosChain('noble')
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

  const cosmosWallets = [
    { name: 'Osmosis', chain: 'osmosis', wallet: osmosis, balance: osmosisBalance },
    { name: 'Cosmos Hub', chain: 'cosmoshub', wallet: cosmoshub, balance: cosmoshubBalance },
  ]

  const anyCosmosConnected = cosmosWallets.some(w => w.wallet.isConnected) || noble.isConnected
  const totalConnected = (evmConnected ? 1 : 0) + cosmosWallets.filter(w => w.wallet.isConnected).length + (noble.isConnected ? 1 : 0)

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all max-h-[85vh] overflow-y-auto">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4"
                  >
                    Connect Wallets
                  </Dialog.Title>

                  {!hasMounted ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Connection Summary */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              Connection Status
                            </h4>
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

                      {/* Noble Section - Featured at top */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Noble (Required)
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            noble.isConnected 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          }`}>
                            {noble.isConnected ? 'Connected' : 'Required'}
                          </span>
                        </div>

                        {noble.isConnected ? (
                          <div className="p-3 bg-green-50 border border-green-200 dark:bg-green-900/10 dark:border-green-800 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  {nobleBalance.chainConfig?.icon && (
                                    <img 
                                      src={nobleBalance.chainConfig.icon} 
                                      alt="Noble"
                                      className="w-5 h-5 mr-2 rounded-full"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none'
                                      }}
                                    />
                                  )}
                                  <div className={`w-2 h-2 rounded-full mr-2 bg-green-500`}></div>
                                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                    Noble (USDC Chain)
                                  </span>
                                </div>
                                
                                <div className="mt-2 ml-7">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                    {noble.address?.slice(0, 12)}...{noble.address?.slice(-8)}
                                  </div>
                                  
                                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    <span>Native USDC Chain</span>
                                    <span className="mx-1">•</span>
                                    {(noble.wallet?.prettyName || '').toLowerCase().includes('keplr') && (
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
                                    {(noble.wallet?.prettyName || '').toLowerCase().includes('leap') && (
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
                                  </div>
                                  
                                  {/* Noble Balance Information */}
                                  {nobleBalance.isLoading ? (
                                    <div className="text-xs text-gray-500 mt-2">Loading USDC balance...</div>
                                  ) : nobleBalance.error ? (
                                    <div className="text-xs text-red-500 mt-2">Error loading balance</div>
                                  ) : (
                                    <div className="mt-2 space-y-1">
                                      {nobleBalance.native && (
                                        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                          <div className="flex items-center">
                                            {nobleBalance.native.icon && (
                                              <img 
                                                src={nobleBalance.native.icon} 
                                                alt={nobleBalance.native.symbol}
                                                className="w-3 h-3 mr-2 rounded-full"
                                                onError={(e) => {
                                                  (e.target as HTMLImageElement).style.display = 'none'
                                                }}
                                              />
                                            )}
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                              {nobleBalance.native.symbol}:
                                            </span>
                                          </div>
                                          <span className="text-xs font-mono text-gray-800 dark:text-gray-200">
                                            ${nobleBalance.native.formatted}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex space-x-1 ml-2">
                                <div className="flex flex-col space-y-1">
                                  <button
                                    onClick={() => nobleBalance.refetch()}
                                    className="px-4 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm"
                                  >
                                    Refresh
                                  </button>
                                  <button
                                    onClick={() => handleCosmosDisconnect(noble, 'noble')}
                                    className="px-4 py-2 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm"
                                  >
                                    Disconnect
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-0 border-dashed border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">
                                  Connect Noble Wallet
                                </div>
                                <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                                  Noble is required to use this app. Noble is the native USDC chain in the Cosmos ecosystem.
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                  • Send and receive USDC natively
                                  • No bridging fees or delays
                                  • Cosmos ecosystem interoperability
                                </div>
                              </div>
                              <button
                                onClick={() => handleCosmosConnect('noble')}
                                className="px-4 py-2 bg-blue-400 text-white hover:bg-blue-500 rounded-lg transition-colors text-sm"
                              >
                                Connect
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* EVM Wallets Section - Moved to second position */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            EVM Chains (Optional)
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            evmConnected 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {evmConnected ? 'Connected' : 'Optional'}
                          </span>
                        </div>

                        {evmConnected ? (
                          <div className="p-3 bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                  {connector?.name || 'Unknown Wallet'}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                  {evmAddress?.slice(0, 10)}...{evmAddress?.slice(-6)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                  EVM Compatible • Multiple chains supported
                                </div>
                              </div>
                              <button
                                onClick={() => evmDisconnect()}
                                className="px-2 py-1 text-xs bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded transition-colors"
                              >
                                Disconnect
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  Connect EVM wallet for additional features
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                  MetaMask, WalletConnect, and other EVM wallets
                                </div>
                              </div>
                              <button
                                onClick={handleEvmConnect}
                                className="px-4 py-2 bg-blue-400 text-white hover:bg-blue-500 rounded-lg transition-colors text-sm"
                              >
                                Connect
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Other Cosmos Chains Section - Moved to bottom */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Other Cosmos Chains (Optional)
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (osmosis.isConnected || cosmoshub.isConnected)
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {[osmosis, cosmoshub].filter(w => w.isConnected).length} of 2 Connected
                          </span>
                        </div>

                        <div className="space-y-3">
                          {[
                            { name: 'Osmosis', chain: 'osmosis', wallet: osmosis, balance: osmosisBalance },
                            { name: 'Cosmos Hub', chain: 'cosmoshub', wallet: cosmoshub, balance: cosmoshubBalance },
                          ].map((chainWallet) => (
                            <div key={chainWallet.chain} className={`p-3 rounded-lg transition-colors ${
                              chainWallet.wallet.isConnected 
                                ? 'bg-gray-50 dark:bg-gray-700'
                                : 'bg-gray-50 dark:bg-gray-700'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    {chainWallet.balance.chainConfig?.icon && (
                                      <img 
                                        src={chainWallet.balance.chainConfig.icon} 
                                        alt={chainWallet.name}
                                        className="w-5 h-5 mr-2 rounded-full"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none'
                                        }}
                                      />
                                    )}
                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                      chainWallet.wallet.isConnected ? 'bg-green-500' : 'bg-gray-400'
                                    }`}></div>
                                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                      {chainWallet.name}
                                    </span>
                                  </div>
                                  {chainWallet.wallet.isConnected ? (
                                    <div className="mt-2 ml-7">
                                      <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                        {chainWallet.wallet.address?.slice(0, 12)}...{chainWallet.wallet.address?.slice(-8)}
                                      </div>
                                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        <span>Chain: {chainWallet.chain}</span>
                                        <span className="mx-1">•</span>
                                        {(chainWallet.wallet.wallet?.prettyName || '').toLowerCase().includes('keplr') && (
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
                                        {(chainWallet.wallet.wallet?.prettyName || '').toLowerCase().includes('leap') && (
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
                                        {!(chainWallet.wallet.wallet?.prettyName || '').toLowerCase().includes('keplr') && 
                                         !(chainWallet.wallet.wallet?.prettyName || '').toLowerCase().includes('leap') && (
                                          <span>{chainWallet.wallet.wallet?.prettyName || 'Unknown'}</span>
                                        )}
                                      </div>
                                      {chainWallet.balance.isLoading ? (
                                        <div className="text-xs text-gray-500 mt-2">Loading balances...</div>
                                      ) : chainWallet.balance.error ? (
                                        <div className="text-xs text-red-500 mt-2">Error loading balances</div>
                                      ) : (
                                        <div className="mt-2 space-y-1">
                                          {chainWallet.balance.native && (
                                            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                              <div className="flex items-center">
                                                {chainWallet.balance.native.icon && (
                                                  <img 
                                                    src={chainWallet.balance.native.icon} 
                                                    alt={chainWallet.balance.native.symbol}
                                                    className="w-3 h-3 mr-2 rounded-full"
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
                                            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                              <div className="flex items-center">
                                                {chainWallet.balance.usdc.icon && (
                                                  <img 
                                                    src={chainWallet.balance.usdc.icon} 
                                                    alt="USDC"
                                                    className="w-3 h-3 mr-2 rounded-full"
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
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                                      Not connected to {chainWallet.name}
                                    </div>
                                  )}
                                </div>
                                <div className="flex space-x-1 ml-2">
                                  {chainWallet.wallet.isConnected ? (
                                    <div className="flex flex-col space-y-1">
                                      <button
                                        onClick={() => chainWallet.balance.refetch()}
                                        className="px-4 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm"
                                      >
                                        Refresh
                                      </button>
                                      <button
                                        onClick={() => handleCosmosDisconnect(chainWallet.wallet, chainWallet.chain)}
                                        className="px-4 py-2 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm"
                                      >
                                        Disconnect
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleCosmosConnect(chainWallet.chain)}
                                      className="px-4 py-2 bg-blue-400 text-white hover:bg-blue-500 rounded-lg transition-colors text-sm"
                                    >
                                      Connect
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </div>
                </DialogPanel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {hasMounted && (
        <CosmosWalletModal 
          isOpen={isCosmosModalOpen} 
          onClose={() => setIsCosmosModalOpen(false)}
          chainName={selectedCosmosChain}
        />
      )}
    </>
  )
}