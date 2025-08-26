'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'
import { useAccount, useDisconnect } from 'wagmi'
import { useCosmosWallet } from '@/hooks/use-cosmos-wallet'
import { useCosmosBalance } from '@/hooks/use-cosmos-balance'
import { useEvmBalance } from '@/hooks/use-evm-balance'
import { useUserManagement } from '@/hooks/use-user-management'
import UserAvatar from '@/public/images/user-avatar-32.png'
import WalletStatusModal from '@/components/wallet-status-modal'

export default function DropdownProfile({ align }: {
  align?: 'left' | 'right'
}) {
  const [isWalletStatusModalOpen, setIsWalletStatusModalOpen] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  
  // EVM Wallet
  const { isConnected: evmConnected, address: evmAddress, chainId } = useAccount()
  const { disconnect: evmDisconnect } = useDisconnect()
  const { native, usdc, isLoading: balanceLoading } = useEvmBalance()
  
  // Cosmos Wallets - get all chains
  const osmosis = useCosmosWallet('osmosis')
  const cosmoshub = useCosmosWallet('cosmoshub')
  const juno = useCosmosWallet('juno')
  const stargaze = useCosmosWallet('stargaze')
  const noble = useCosmosWallet('noble') // Add Noble wallet

  // Add Noble balance
  const nobleBalance = useCosmosBalance('noble')

  // User management
  const { user, createOrUpdateUser, isLoading: userLoading } = useUserManagement()

  // Handle hydration
  useEffect(() => {
    setHasMounted(true)
  }, [])

  const handleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsWalletStatusModalOpen(true)
  }

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    try {
      // Disconnect EVM wallet
      if (evmConnected) {
        evmDisconnect()
      }

      // Disconnect all connected Cosmos wallets (include Noble)
      const cosmosWallets = [osmosis, cosmoshub, juno, stargaze, noble]
      
      await Promise.all(
        cosmosWallets.map(async (wallet) => {
          if (wallet.isConnected) {
            try {
              await wallet.disconnect()
            } catch (error) {
              console.error(`Failed to disconnect ${wallet.wallet?.prettyName || 'cosmos wallet'}:`, error)
            }
          }
        })
      )

      console.log('All wallets disconnected successfully')
    } catch (error) {
      console.error('Error during wallet disconnection:', error)
    }
  }

  const handleWalletStatus = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsWalletStatusModalOpen(true)
  }

  // Log the user data to see it working
  useEffect(() => {
    if (user) {
      console.log('Current user:', user)
    }
  }, [user])

  // Log user data when it changes
  useEffect(() => {
    if (user) {
      console.log('User data updated:', user)
    }
  }, [user])

  // Log any errors
  useEffect(() => {
    if (userLoading) {
      console.log('User management loading...')
    }
  }, [userLoading])

  // Check if any wallet is connected
  const isAnyWalletConnected = hasMounted && (
    evmConnected || 
    osmosis.isConnected || 
    cosmoshub.isConnected || 
    juno.isConnected || 
    stargaze.isConnected ||
    noble.isConnected
  )

  // Display name logic - prioritize EVM, then any cosmos wallet
  const displayName = hasMounted ? (() => {
    if (evmConnected && evmAddress) {
      return `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`
    }
    if (noble.isConnected) return 'Noble Wallet'
    if (osmosis.isConnected) return 'Osmosis Wallet'
    if (cosmoshub.isConnected) return 'Cosmos Hub'
    return 'Pay USDC'
  })() : 'Pay USDC'

  const walletStatus = isAnyWalletConnected ? 'Wallet Connected' : 'Pay USDC'
  const userType = isAnyWalletConnected ? 'Web3 User' : 'Send USDC to many wallets'

  // Get network name
  const getNetworkName = (chainId: number | undefined) => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum',
      10: 'Optimism',
      137: 'Polygon',
      42161: 'Arbitrum',
      8453: 'Base',
    }
    return chainId ? networks[chainId] || `Chain ${chainId}` : 'Unknown'
  }

  return (
    <>
      <Menu as="div" className="relative inline-flex">
        <MenuButton className="inline-flex justify-center items-center group">
          <Image className="w-8 h-8 rounded-full" src={UserAvatar} width={32} height={32} alt="User" />
          <div className="flex items-center truncate">
            <span className="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">
              {displayName}
            </span>
            <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
              <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
            </svg>
          </div>
        </MenuButton>
        <Transition
          as="div"
          className={`origin-top-right z-10 absolute top-full min-w-[16rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
          enter="transition ease-out duration-200 transform"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
            <div className="font-medium text-gray-800 dark:text-gray-100">
              {walletStatus}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              {userType}
            </div>
            
            {/* Show balance information - prioritize Noble USDC, then EVM wallet */}
            {hasMounted && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                {/* Show Noble USDC if connected */}
                {noble.isConnected && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Noble (USDC Chain)
                    </div>
                    {nobleBalance.isLoading ? (
                      <div className="text-xs text-gray-500">Loading USDC balance...</div>
                    ) : nobleBalance.error ? (
                      <div className="text-xs text-red-500">Error loading balance</div>
                    ) : (
                      <div className="space-y-1">
                        {nobleBalance.native && (
                          <div className="flex justify-between text-xs">
                            <div className="flex items-center">
                              {nobleBalance.native.icon && (
                                <img 
                                  src={nobleBalance.native.icon} 
                                  alt="USDC"
                                  className="w-3 h-3 mr-1 rounded-full"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              )}
                              <span className="text-gray-600 dark:text-gray-400">USDC:</span>
                            </div>
                            <span className="font-mono text-gray-800 dark:text-gray-200">
                              ${nobleBalance.native.formatted}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Show EVM wallet info if connected and no Noble, or show network info */}
                {evmConnected && (
                  <div className={noble.isConnected ? 'pt-2 border-t border-gray-200 dark:border-gray-600' : ''}>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {getNetworkName(chainId)}
                    </div>
                    {balanceLoading ? (
                      <div className="text-xs text-gray-500">Loading balances...</div>
                    ) : (
                      <div className="space-y-1">
                        {/* Show EVM USDC if available and no Noble */}
                        {!noble.isConnected && usdc && (
                          <div className="flex justify-between text-xs">
                            <div className="flex items-center">
                              {usdc.icon && (
                                <img 
                                  src={usdc.icon} 
                                  alt="USDC"
                                  className="w-3 h-3 mr-1 rounded-full"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              )}
                              <span className="text-gray-600 dark:text-gray-400">USDC:</span>
                            </div>
                            <span className="font-mono text-gray-800 dark:text-gray-200">
                              ${usdc.formatted}
                            </span>
                          </div>
                        )}
                        
                        {/* Show native token */}
                        {native && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">{native.symbol}:</span>
                            <span className="font-mono text-gray-800 dark:text-gray-200">{native.formatted}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <MenuItems as="ul" className="focus:outline-none">
            <MenuItem as="li">
              {({ active }) => (
                <Link className={`font-medium text-sm flex items-center py-1 px-3 ${active ? 'text-violet-600 dark:text-violet-400' : 'text-violet-500'}`} href="#0">
                  Settings
                </Link>
              )}
            </MenuItem>
            
            {/* Show wallet status option if any wallet is connected */}
            {isAnyWalletConnected && (
              <MenuItem as="li">
                {({ active }) => (
                  <button 
                    className={`w-full text-left font-medium text-sm flex items-center py-1 px-3 ${active ? 'text-violet-600 dark:text-violet-400' : 'text-violet-500'}`} 
                    onClick={handleWalletStatus}
                  >
                    Connected Wallets
                  </button>
                )}
              </MenuItem>
            )}

            {!isAnyWalletConnected ? (
              <MenuItem as="li">
                {({ active }) => (
                  <button 
                    className={`w-full text-left font-medium text-sm flex items-center py-1 px-3 ${active ? 'text-violet-600 dark:text-violet-400' : 'text-violet-500'}`} 
                    onClick={handleSignIn}
                  >
                    Sign In
                  </button>
                )}
              </MenuItem>
            ) : (
              <MenuItem as="li">
                {({ active }) => (
                  <button 
                    className={`w-full text-left font-medium text-sm flex items-center py-1 px-3 ${active ? 'text-violet-600 dark:text-violet-400' : 'text-violet-500'}`} 
                    onClick={handleSignOut}
                  >
                    Sign Out All
                  </button>
                )}
              </MenuItem>
            )}
          </MenuItems>
        </Transition>
      </Menu>

      {hasMounted && (
        <WalletStatusModal 
          isOpen={isWalletStatusModalOpen} 
          onClose={() => setIsWalletStatusModalOpen(false)} 
        />
      )}
    </>
  )
}