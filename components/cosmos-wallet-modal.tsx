'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogPanel, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useManager } from '@cosmos-kit/react'

interface CosmosWalletModalProps {
  isOpen: boolean
  onClose: () => void
  chainName?: string
}

export default function CosmosWalletModal({ isOpen, onClose, chainName = 'osmosis' }: CosmosWalletModalProps) {
  const [selectedWallet, setSelectedWallet] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)
  const { getWalletRepo } = useManager()

  const walletOptions = [
    {
      name: 'keplr-extension',
      prettyName: 'Keplr',
      description: 'Keplr Browser Extension',
      icon: '/images/keplr.png',
      emoji: '🔵',
    },
    {
      name: 'leap-extension', 
      prettyName: 'Leap',
      description: 'Leap Cosmos Wallet',
      icon: '/images/leap.png',
      emoji: '🟣',
    }
  ]

  // Helper function to get user-friendly wallet names
  const getWalletDisplayName = (walletName: string) => {
    const names = {
      'keplr-extension': 'Keplr',
      'leap-extension': 'Leap'
    }
    return names[walletName as keyof typeof names] || walletName
  }

  // Debug function to check available wallets
  const debugAvailableWallets = () => {
    try {
      const walletRepo = getWalletRepo(chainName)
      const allWallets = walletOptions.map(wallet => walletRepo.getWallet(wallet.name)).filter(Boolean)
      console.log('Available wallets for', chainName, ':', allWallets.filter(w => w !== undefined).map(w => w.walletInfo?.name || 'Unknown'))
      
      // Check specific wallet availability
      walletOptions.forEach(wallet => {
        try {
          const w = walletRepo.getWallet(wallet.name)
          console.log(`${wallet.name}:`, {
            exists: !!w,
            isAvailable: w && 'isAvailable' in w && typeof w.isAvailable === 'function' ? w.isAvailable() : 'unknown'
          })
        } catch (e) {
          console.log(`${wallet.name}: not found`)
        }
      })
    } catch (error) {
      console.error('Debug wallet error:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      debugAvailableWallets()
    }
  }, [isOpen, chainName])

  const handleWalletConnect = async (walletName: string) => {
    setIsConnecting(true)
    setSelectedWallet(walletName)
    
    try {
      const walletRepo = getWalletRepo(chainName)
      const wallet = walletRepo.getWallet(walletName)
      
      if (!wallet) {
        throw new Error(`Wallet with name ${walletName} not found`)
      }

      // Check wallet availability
      if ('isAvailable' in wallet && typeof wallet.isAvailable === 'function') {
        if (!wallet.isAvailable()) {
          throw new Error(`${walletName} wallet is not installed or not available`)
        }
      }

      await wallet.connect()
      console.log(`Connected to ${chainName} with ${walletName}`)
      onClose()
    } catch (error) {
      console.error(`Failed to connect with ${walletName}:`, error)
      
      // Enhanced error handling
      if (error instanceof Error) {
        if (error.message.includes('not installed') || error.message.includes('not available')) {
          alert(`Please install ${getWalletDisplayName(walletName)} wallet extension first`)
        } else if (error.message.includes('not found')) {
          alert(`${getWalletDisplayName(walletName)} wallet is not available for ${chainName}`)
        } else if (error.message.includes('User rejected')) {
          // User cancelled the connection - don't show error
          console.log('User rejected wallet connection')
        } else {
          alert(`Failed to connect: ${error.message}`)
        }
      }
    } finally {
      setIsConnecting(false)
      setSelectedWallet('')
    }
  }

  return (
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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-2"
                >
                  Connect Cosmos Wallet
                </Dialog.Title>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Choose a wallet to connect to <span className="font-medium capitalize">{chainName}</span>
                </p>

                <div className="space-y-3 mb-6">
                  {walletOptions.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => handleWalletConnect(wallet.name)}
                      disabled={isConnecting}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedWallet === wallet.name && isConnecting
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } ${isConnecting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8">
                          <img 
                            src={wallet.icon} 
                            alt={wallet.prettyName}
                            className="w-6 h-6 rounded object-contain"
                            onError={(e) => {
                              // Fallback to emoji if image fails
                              (e.target as HTMLElement).style.display = 'none';
                              const emojiElement = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                              if (emojiElement) {
                                emojiElement.style.display = 'block';
                              }
                            }}
                          />
                          <span 
                            className="text-2xl"
                            style={{ display: 'none' }}
                          >
                            {wallet.emoji}
                          </span>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {wallet.prettyName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {wallet.description}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {/* {wallet.features} */}
                          </div>
                        </div>
                        {selectedWallet === wallet.name && isConnecting && (
                          <div className="w-5 h-5">
                            <svg className="animate-spin w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Installation Links */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Don't have these wallets?</strong>
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <a 
                      href="https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Install Keplr
                    </a>
                    <span className="text-gray-400">•</span>
                    <a 
                      href="https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Install Leap
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <em>Note: Vultisig supports Cosmos assets but not yet transaction signing for dApps</em>
                  </p>
                </div>

                {isConnecting && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Connecting to {selectedWallet.replace('-extension', '')}...
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                    disabled={isConnecting}
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}