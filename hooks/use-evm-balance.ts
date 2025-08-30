'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance, usePublicClient } from 'wagmi'
import { Address } from 'viem'

// Fixed USDC addresses - ADD BSC
const USDC_ADDRESSES = {
  1: '0xA0b86a33E6441b46C6a74a9ed8fa1ba8ab6dd37e', // Ethereum USDC
  10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', // Optimism USDC
  137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon USDC
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
  56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // BSC USDC
} as const

// USDC icon URL
const USDC_ICON = 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.png'

// Chain configurations with proper icons
export const SUPPORTED_CHAINS = [
  { 
    chainId: 1, 
    name: 'Ethereum', 
    shortName: 'ETH',
    color: 'bg-blue-500',
    logo: 'https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg',
    nativeSymbol: 'ETH'
  },
  { 
    chainId: 10, 
    name: 'Optimism', 
    shortName: 'OP',
    color: 'bg-red-500',
    logo: 'https://icons.llamao.fi/icons/chains/rsz_optimism.jpg',
    nativeSymbol: 'ETH'
  },
  { 
    chainId: 137, 
    name: 'Polygon', 
    shortName: 'MATIC',
    color: 'bg-purple-500',
    logo: 'https://icons.llamao.fi/icons/chains/rsz_polygon.jpg',
    nativeSymbol: 'MATIC'
  },
  { 
    chainId: 42161, 
    name: 'Arbitrum', 
    shortName: 'ARB',
    color: 'bg-blue-600',
    logo: 'https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg',
    nativeSymbol: 'ETH'
  },
  { 
    chainId: 8453, 
    name: 'Base', 
    shortName: 'BASE',
    color: 'bg-blue-400',
    logo: 'https://icons.llamao.fi/icons/chains/rsz_base.jpg',
    nativeSymbol: 'ETH'
  },
  { 
    chainId: 56, 
    name: 'BNB Smart Chain', 
    shortName: 'BSC',
    color: 'bg-yellow-500',
    logo: 'https://icons.llamao.fi/icons/chains/rsz_binance.jpg',
    nativeSymbol: 'BNB'
  },
] as const

// Original hook for current chain
export function useEvmBalance() {
  const { address, chainId } = useAccount()
  
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
          icon: undefined
        } : null,
        usdc: usdcBalance ? {
          formatted: parseFloat(usdcBalance.formatted).toFixed(2),
          symbol: usdcBalance.symbol,
          value: usdcBalance.value,
          icon: USDC_ICON
        } : null,
        isLoading: false
      })
    }
  }, [nativeBalance, usdcBalance, nativeLoading, usdcLoading])

  return {
    ...balances,
    refetch: () => {
      window.location.reload()
    }
  }
}

// New hook for specific chain USDC balance
export function useUsdcBalance(address?: Address, chainId?: number) {
  const usdcAddress = chainId ? USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES] : undefined

  const { data: usdcBalance, isLoading, error, refetch } = useBalance({
    address,
    token: usdcAddress,
  })

  return {
    balance: usdcBalance?.formatted || '0',
    formatted: usdcBalance ? parseFloat(usdcBalance.formatted).toFixed(2) : '0.00',
    raw: usdcBalance?.value,
    isLoading,
    error,
    hasUsdc: usdcBalance ? parseFloat(usdcBalance.formatted) > 0 : false,
    refetch,
  }
}

// Updated multi-chain hook that queries all chains
export function useMultiChainUsdcBalances(address?: Address) {
  // Query each chain individually with explicit chainId
  const ethereum = useBalance({
    address,
    token: USDC_ADDRESSES[1],
    chainId: 1,
  })
  
  const optimism = useBalance({
    address,
    token: USDC_ADDRESSES[10],
    chainId: 10,
  })
  
  const polygon = useBalance({
    address,
    token: USDC_ADDRESSES[137],
    chainId: 137,
  })
  
  const arbitrum = useBalance({
    address,
    token: USDC_ADDRESSES[42161],
    chainId: 42161,
  })
  
  const base = useBalance({
    address,
    token: USDC_ADDRESSES[8453],
    chainId: 8453,
  })
 
  const bsc = useBalance({
    address,
    token: USDC_ADDRESSES[56],
    chainId: 56,
  })

  const chains = [
    { 
      chainId: 1, 
      name: 'Ethereum', 
      shortName: 'ETH',
      color: 'bg-blue-500',
      logo: 'https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg',
      nativeSymbol: 'ETH',
      usdc: {
        balance: ethereum.data?.formatted || '0',
        formatted: ethereum.data ? parseFloat(ethereum.data.formatted).toFixed(2) : '0.00',
        raw: ethereum.data?.value,
        isLoading: ethereum.isLoading,
        error: ethereum.error,
        hasUsdc: ethereum.data ? parseFloat(ethereum.data.formatted) > 0 : false,
        refetch: ethereum.refetch,
      }
    },
    { 
      chainId: 10, 
      name: 'Optimism', 
      shortName: 'OP',
      color: 'bg-red-500',
      logo: 'https://icons.llamao.fi/icons/chains/rsz_optimism.jpg',
      nativeSymbol: 'ETH',
      usdc: {
        balance: optimism.data?.formatted || '0',
        formatted: optimism.data ? parseFloat(optimism.data.formatted).toFixed(2) : '0.00',
        raw: optimism.data?.value,
        isLoading: optimism.isLoading,
        error: optimism.error,
        hasUsdc: optimism.data ? parseFloat(optimism.data.formatted) > 0 : false,
        refetch: optimism.refetch,
      }
    },
    { 
      chainId: 137, 
      name: 'Polygon', 
      shortName: 'MATIC',
      color: 'bg-purple-500',
      logo: 'https://icons.llamao.fi/icons/chains/rsz_polygon.jpg',
      nativeSymbol: 'MATIC',
      usdc: {
        balance: polygon.data?.formatted || '0',
        formatted: polygon.data ? parseFloat(polygon.data.formatted).toFixed(2) : '0.00',
        raw: polygon.data?.value,
        isLoading: polygon.isLoading,
        error: polygon.error,
        hasUsdc: polygon.data ? parseFloat(polygon.data.formatted) > 0 : false,
        refetch: polygon.refetch,
      }
    },
    { 
      chainId: 42161, 
      name: 'Arbitrum', 
      shortName: 'ARB',
      color: 'bg-blue-600',
      logo: 'https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg',
      nativeSymbol: 'ETH',
      usdc: {
        balance: arbitrum.data?.formatted || '0',
        formatted: arbitrum.data ? parseFloat(arbitrum.data.formatted).toFixed(2) : '0.00',
        raw: arbitrum.data?.value,
        isLoading: arbitrum.isLoading,
        error: arbitrum.error,
        hasUsdc: arbitrum.data ? parseFloat(arbitrum.data.formatted) > 0 : false,
        refetch: arbitrum.refetch,
      }
    },
    { 
      chainId: 8453, 
      name: 'Base', 
      shortName: 'BASE',
      color: 'bg-blue-400',
      logo: 'https://icons.llamao.fi/icons/chains/rsz_base.jpg',
      nativeSymbol: 'ETH',
      usdc: {
        balance: base.data?.formatted || '0',
        formatted: base.data ? parseFloat(base.data.formatted).toFixed(2) : '0.00',
        raw: base.data?.value,
        isLoading: base.isLoading,
        error: base.error,
        hasUsdc: base.data ? parseFloat(base.data.formatted) > 0 : false,
        refetch: base.refetch,
      }
    },
    { 
      chainId: 56, 
      name: 'BNB Smart Chain', 
      shortName: 'BSC',
      color: 'bg-yellow-500',
      logo: 'https://icons.llamao.fi/icons/chains/rsz_binance.jpg',
      nativeSymbol: 'BNB',
      usdc: {
        balance: bsc.data?.formatted || '0',
        formatted: bsc.data ? parseFloat(bsc.data.formatted).toFixed(2) : '0.00',
        raw: bsc.data?.value,
        isLoading: bsc.isLoading,
        error: bsc.error,
        hasUsdc: bsc.data ? parseFloat(bsc.data.formatted) > 0 : false,
        refetch: bsc.refetch,
      }
    },
  ]


  const totalUsdc = chains.reduce((sum, chain) => {
    return sum + parseFloat(chain.usdc.formatted || '0')
  }, 0)

  const isAnyLoading = chains.some(chain => chain.usdc.isLoading)
  const hasAnyUsdc = chains.some(chain => chain.usdc.hasUsdc)

  const refetchAll = () => {
    chains.forEach(chain => chain.usdc.refetch())
  }

  return {
    chains,
    totalUsdc,
    totalUsdcFormatted: totalUsdc.toFixed(2),
    isAnyLoading,
    hasAnyUsdc,
    refetchAll,
  }
}