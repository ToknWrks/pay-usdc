// hooks/use-osmosis-swap.ts
'use client'

import { useState, useCallback } from 'react'
import { getOptimalRoute, calculateSimpleSwap, type RouteResponse } from '@/lib/osmosis-router'

export function useOsmosisSwap() {
  const [route, setRoute] = useState<RouteResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getSwapRoute = useCallback(async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    decimals: number,
    tokenSymbol: string,
    tokenPrice: number
  ): Promise<RouteResponse | null> => {
    if (!tokenIn || !tokenOut || !amountIn || parseFloat(amountIn) <= 0) {
      setRoute(null)
      return null
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Convert to micro units
      const microAmount = (parseFloat(amountIn) * Math.pow(10, decimals)).toString()
      
      console.log('🔄 Getting route for:', {
        tokenIn,
        tokenOut,
        amountIn: microAmount,
        decimals
      })
      
      // Try Osmosis SQS API first
      let routeData = await getOptimalRoute({
        tokenIn,
        tokenOut,
        tokenInAmount: microAmount
      })
      
      // If API fails, use fallback calculation
      if (!routeData) {
        console.log('🔄 Using fallback calculation...')
        routeData = calculateSimpleSwap(
          tokenSymbol,
          tokenPrice,
          amountIn,
          decimals
        )
      }
      
      setRoute(routeData)
      return routeData
    } catch (err) {
      // Use fallback calculation if everything fails
      console.log('🔄 API failed, using fallback calculation...')
      try {
        const fallbackRoute = calculateSimpleSwap(
          tokenSymbol,
          tokenPrice,
          amountIn,
          decimals
        )
        setRoute(fallbackRoute)
        return fallbackRoute
      } catch (fallbackError) {
        const errorMessage = 'Failed to calculate swap route'
        setError(errorMessage)
        setRoute(null)
        return null
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearRoute = useCallback(() => {
    setRoute(null)
    setError(null)
  }, [])

  return {
    route,
    isLoading,
    error,
    getSwapRoute,
    clearRoute
  }
}