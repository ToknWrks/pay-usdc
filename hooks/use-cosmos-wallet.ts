'use client'

import { useChain } from '@cosmos-kit/react'
import { useState, useEffect } from 'react'

export function useCosmosWallet(chainName: string = 'cosmoshub') {
  const [hasMounted, setHasMounted] = useState(false)
  const {
    connect,
    disconnect,
    isWalletConnected,
    address,
    wallet,
    status
  } = useChain(chainName)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const connectWallet = async () => {
    try {
      await connect()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const disconnectWallet = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  return {
    isConnected: hasMounted ? isWalletConnected : false,
    address: hasMounted ? address : undefined,
    wallet,
    status,
    connect: connectWallet,
    disconnect: disconnectWallet,
    hasMounted
  }
}