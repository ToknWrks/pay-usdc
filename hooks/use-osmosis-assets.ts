// hooks/use-osmosis-assets.ts
'use client'

import { useState, useEffect } from 'react'
import { useChain } from '@cosmos-kit/react'
import { TOKENS, getTokenByDenom, TokenConfig } from '@/lib/tokens'

interface Asset {
  denom: string
  symbol: string
  name: string
  amount: string
  price: number
  value: number
  decimals: number
  icon?: string
  tokenConfig: TokenConfig
}

const COINGECKO_API_KEY = 'CG-7kutmC8zoHeDjqzu92KgsELy'

export function useOsmosisAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highestValueAsset, setHighestValueAsset] = useState<Asset | null>(null) // ADD THIS

  // Connect to Osmosis chain
  const { 
    address: osmosisAddress, 
    isWalletConnected, 
    getStargateClient,
    connect,
    openView 
  } = useChain('osmosis')

  const fetchAssetPrices = async (assetIds: string[]): Promise<{ [key: string]: number }> => {
    try {
      const uniqueIds = Array.from(new Set(assetIds.filter(Boolean)))
      if (uniqueIds.length === 0) return {}

      const ids = uniqueIds.join(',')
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&x_cg_demo_api_key=${COINGECKO_API_KEY}`
      )
      
      if (!response.ok) {
        console.warn('CoinGecko API error, using fallback prices')
        return {}
      }
      
      const data = await response.json()
      const prices: { [key: string]: number } = {}
      
      Object.keys(data).forEach(id => {
        prices[id] = data[id].usd || 0
      })
      
      return prices
    } catch (error) {
      console.error('Error fetching asset prices:', error)
      return {}
    }
  }

  const fetchOsmosisAssets = async () => {
    if (!osmosisAddress || !isWalletConnected) {
      setAssets([])
      setHighestValueAsset(null) // RESET HIGHEST VALUE ASSET
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Fetching Osmosis assets for:', osmosisAddress)
      
      const client = await getStargateClient()
      
      if (!client) {
        throw new Error('Failed to get Stargate client')
      }
      
      // Get all balances
      const balances = await client.getAllBalances(osmosisAddress)
      console.log('Osmosis balances:', balances)

      // If no balances, set empty array (not an error)
      if (!balances || balances.length === 0) {
        setAssets([])
        setHighestValueAsset(null)
        setIsLoading(false)
        return
      }

      // Filter out zero balances and match with token configs
      const processableAssets: Array<{
        balance: any
        tokenConfig: TokenConfig
      }> = []

      for (const balance of balances) {
        if (parseFloat(balance.amount) > 0) {
          const tokenConfig = getTokenByDenom(balance.denom)
          if (tokenConfig) {
            processableAssets.push({ balance, tokenConfig })
          } else {
            // Log unknown tokens for debugging
            console.log('Unknown token found:', balance.denom)
          }
        }
      }

      // Get unique asset IDs for price fetching
      const assetIds = processableAssets.map(asset => asset.tokenConfig.assetId)

      // Fetch prices (with fallback handling)
      const prices = await fetchAssetPrices(assetIds)

      // Process assets with prices
      const processedAssets: Asset[] = []

      for (const { balance, tokenConfig } of processableAssets) {
        const price = prices[tokenConfig.assetId] || 0
        const formattedAmount = parseFloat(balance.amount) / Math.pow(10, tokenConfig.decimals)
        const value = formattedAmount * price

        // Only include assets with value >= $0.50 OR if price is 0 (unknown price)
        if (value >= 0.50 || price === 0) {
          processedAssets.push({
            denom: balance.denom,
            symbol: tokenConfig.symbol,
            name: tokenConfig.name,
            amount: formattedAmount.toFixed(Math.min(6, tokenConfig.decimals)),
            price,
            value,
            decimals: tokenConfig.decimals,
            icon: tokenConfig.icon,
            tokenConfig
          })
        }
      }

      // Sort by value (highest first), then by amount for zero-price assets
      processedAssets.sort((a, b) => {
        if (a.value === 0 && b.value === 0) {
          return parseFloat(b.amount) - parseFloat(a.amount)
        }
        return b.value - a.value
      })
      
      setAssets(processedAssets)
      
      // SET THE HIGHEST VALUE ASSET AS DEFAULT
      if (processedAssets.length > 0) {
        setHighestValueAsset(processedAssets[0]) // First asset after sorting
      } else {
        setHighestValueAsset(null)
      }

    } catch (error) {
      console.error('Error fetching Osmosis assets:', error)
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('RPC')) {
          setError('Unable to connect to Osmosis network. Please try again later.')
        } else if (error.message.includes('client')) {
          setError('Connection failed. Please reconnect your Osmosis wallet.')
        } else {
          setError(`Failed to fetch assets: ${error.message}`)
        }
      } else {
        setError('Failed to fetch assets. Please check your connection.')
      }
      
      setHighestValueAsset(null) // RESET ON ERROR
    } finally {
      setIsLoading(false)
    }
  }

  // Manual connect function for troubleshooting
  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      console.error('Failed to connect to Osmosis:', error)
      setError('Failed to connect to Osmosis wallet')
    }
  }

  useEffect(() => {
    if (osmosisAddress && isWalletConnected) {
      fetchOsmosisAssets()
    }
  }, [osmosisAddress, isWalletConnected])

  return {
    assets,
    isLoading,
    error,
    refetch: fetchOsmosisAssets,
    connect: handleConnect,
    isConnected: isWalletConnected,
    address: osmosisAddress,
    highestValueAsset // EXPORT THE HIGHEST VALUE ASSET
  }
}