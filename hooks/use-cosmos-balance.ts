'use client'

import { useState, useEffect } from 'react'
import { useChain } from '@cosmos-kit/react'
import { CHAINS, type ChainConfig } from '@/lib/chains'

// IBC USDC denom (same across chains due to IBC)
const USDC_IBC_DENOM = 'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4'

// USDC icon URL
const USDC_ICON = 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.png'

interface BalanceData {
  denom: string
  amount: string
  formatted: string
  icon?: string
  symbol?: string
}

export function useCosmosBalance(chainName: string) {
  const [balances, setBalances] = useState<{
    native: BalanceData | null
    usdc: BalanceData | null
    isLoading: boolean
    error: string | null
  }>({
    native: null,
    usdc: null,
    isLoading: true,
    error: null
  })

  const { address, isWalletConnected } = useChain(chainName)

  // Find chain config
  const getChainConfig = (chainName: string): ChainConfig | null => {
    // Map cosmos-kit chain names to our chain names
    const chainNameMap: { [key: string]: string } = {
      'osmosis': 'Osmosis',
      'cosmoshub': 'Cosmos Hub',
      'juno': 'Juno',
      'stargaze': 'Stargaze',
      'noble': 'Noble',
    }
    
    const mappedName = chainNameMap[chainName] || chainName
    return CHAINS.find(chain => chain.chainName === mappedName) || null
  }

  const fetchBalances = async () => {
    if (!address || !isWalletConnected) {
      setBalances(prev => ({ ...prev, isLoading: false, error: null }))
      return
    }

    const chainConfig = getChainConfig(chainName)
    if (!chainConfig) {
      setBalances(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: `Chain configuration not found for ${chainName}` 
      }))
      return
    }

    try {
      setBalances(prev => ({ ...prev, isLoading: true, error: null }))
      
      console.log(`Fetching balances for ${chainName} using config:`, chainConfig)

      // Use REST endpoint from chains.ts
      const restEndpoint = chainConfig.restEndpoint
      const response = await fetch(`${restEndpoint}/cosmos/bank/v1beta1/balances/${address}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const allBalances = data.balances || []

      console.log(`Balances for ${chainName}:`, allBalances)
      
      // Find native token balance using chain config
      const nativeBalance = allBalances.find((balance: any) => balance.denom === chainConfig.Denom)
      
      // Find USDC balance
      let usdcBalance
      if (chainName === 'noble') {
        // On Noble, USDC is native (uusdc)
        usdcBalance = allBalances.find((balance: any) => balance.denom === 'uusdc')
      } else {
        // On other chains, USDC is IBC token
        usdcBalance = allBalances.find((balance: any) => balance.denom === USDC_IBC_DENOM)
      }

      // Format balances using chain config decimals
      const formatBalance = (balance: any, decimals: number, isNative: boolean = false) => {
        if (!balance) return null
        const amount = parseInt(balance.amount)
        const formatted = (amount / Math.pow(10, decimals)).toFixed(decimals === 6 ? 2 : 4)
        
        // Special logic for icons
        let icon: string | undefined
        let symbol: string
        
        if (isNative) {
          // For native tokens, use chain icon UNLESS it's USDC
          if (chainConfig.Symbol === 'USDC') {
            icon = USDC_ICON // Use USDC icon for USDC even when it's native
            symbol = 'USDC'
          } else {
            icon = chainConfig.icon // Use chain icon for other native tokens
            symbol = chainConfig.Symbol
          }
        } else {
          // For non-native tokens (like IBC USDC), always use USDC icon
          icon = USDC_ICON
          symbol = 'USDC'
        }
        
        return {
          denom: balance.denom,
          amount: balance.amount,
          formatted,
          icon,
          symbol
        }
      }

      // Special handling for Noble - don't show duplicate USDC
      let finalNativeBalance = formatBalance(nativeBalance, chainConfig.decimals, true)
      let finalUsdcBalance = formatBalance(usdcBalance, 6, false)

      // If chain is Noble and native token is USDC, don't show duplicate
      if (chainName === 'noble' && chainConfig.Symbol === 'USDC') {
        // Only show as native, not as separate USDC
        finalUsdcBalance = null
      }

      setBalances({
        native: finalNativeBalance,
        usdc: finalUsdcBalance,
        isLoading: false,
        error: null
      })

    } catch (error) {
      console.error(`Error fetching balances for ${chainName}:`, error)
      setBalances(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch balances' 
      }))
    }
  }

  useEffect(() => {
    if (isWalletConnected && address) {
      const timer = setTimeout(fetchBalances, 1000)
      return () => clearTimeout(timer)
    } else {
      setBalances(prev => ({ ...prev, isLoading: false, error: null }))
    }
  }, [address, isWalletConnected, chainName])

  return {
    ...balances,
    chainConfig: getChainConfig(chainName),
    refetch: fetchBalances
  }
}