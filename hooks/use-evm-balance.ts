'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance, usePublicClient } from 'wagmi'
import { formatEther, formatUnits } from 'viem'

// Common token addresses for different networks
const USDC_ADDRESSES = {
  1: '0xA0b86a33E6441B8dBa8E1dbEF9A83b35Dc4e3F4A', // Mainnet USDC
  10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', // Optimism USDC
  137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon USDC
  42161: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // Arbitrum USDC
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
}

// USDC icon URL - same as cosmos
const USDC_ICON = 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.png'

export function useEvmBalance() {
  const { address, chainId } = useAccount()
  const publicClient = usePublicClient()
  
  // Get native token balance
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address,
  })

  // Get USDC balance
  const { data: usdcBalance, isLoading: usdcLoading } = useBalance({
    address,
    token: chainId && USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES] 
      ? USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES] as `0x${string}`
      : undefined,
  })

  const [balances, setBalances] = useState<{
    native: { formatted: string; symbol: string; value: bigint; icon?: string } | null
    usdc: { formatted: string; symbol: string; value: bigint; icon?: string } | null
    isLoading: boolean
  }>({
    native: null,
    usdc: null,
    isLoading: true
  })

  useEffect(() => {
    if (!nativeLoading && !usdcLoading) {
      setBalances({
        native: nativeBalance ? {
          formatted: parseFloat(nativeBalance.formatted).toFixed(4),
          symbol: nativeBalance.symbol,
          value: nativeBalance.value,
          icon: undefined // Native tokens don't need icons for now
        } : null,
        usdc: usdcBalance ? {
          formatted: parseFloat(usdcBalance.formatted).toFixed(2),
          symbol: usdcBalance.symbol,
          value: usdcBalance.value,
          icon: USDC_ICON // Add USDC icon
        } : null,
        isLoading: false
      })
    }
  }, [nativeBalance, usdcBalance, nativeLoading, usdcLoading])

  return {
    ...balances,
    refetch: () => {
      // Trigger refetch of both balances
      window.location.reload() // Simple refetch, you can improve this
    }
  }
}