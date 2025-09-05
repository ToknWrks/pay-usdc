// lib/osmosis-router.ts
import { TOKENS, getSwapPoolId } from '@/lib/tokens'

export interface RouteStep {
  pool_id: string
  token_out_denom: string
}

export interface RouteResponse {
  amount_out: string
  amount_in: string
  route: RouteStep[]
  effective_fee: string
  price_impact: string
  swap_fee: string
}

interface QuoteParams {
  tokenIn: string
  tokenOut: string
  tokenInAmount: string
}

export async function getOptimalRoute(params: QuoteParams): Promise<RouteResponse | null> {
  try {
    const { tokenIn, tokenOut, tokenInAmount } = params
    
    // Use GET method with query parameters
    const url = `https://sqs.osmosis.zone/router/quote?` +
      `tokenIn=${encodeURIComponent(tokenIn)}&` +
      `tokenOut=${encodeURIComponent(tokenOut)}&` +
      `tokenInAmount=${tokenInAmount}`
    
    console.log('🔄 Fetching route from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Router API error:', response.status, errorText)
      
      // If SQS fails, try a fallback calculation
      throw new Error(`Router API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Route data received:', data)
    
    return data
  } catch (error) {
    console.error('Error getting optimal route:', error)
    return null
  }
}

// Add a fallback simple calculation
export function calculateSimpleSwap(
  fromTokenSymbol: string,
  fromTokenPrice: number,
  amount: string,
  fromDecimals: number,
  toDecimals: number = 6
): RouteResponse {
  try {
    const amountNum = parseFloat(amount)
    const usdValue = amountNum * fromTokenPrice
    
    // Apply estimated 0.3% fee
    const fee = 0.003
    const outputAfterFee = usdValue * (1 - fee)
    
    // Convert to micro units
    const microOutput = Math.floor(outputAfterFee * Math.pow(10, toDecimals)).toString()
    const microInput = Math.floor(amountNum * Math.pow(10, fromDecimals)).toString()
    
    return {
      amount_out: microOutput,
      amount_in: microInput,
      route: [{ 
        pool_id: getSwapPoolId(fromTokenSymbol), // Use function from tokens.ts
        token_out_denom: TOKENS.USDC.denom       // Use USDC denom from tokens.ts
      }],
      effective_fee: (fee * 100).toFixed(1),
      price_impact: "0.05",
      swap_fee: (fee * 100).toFixed(1)
    }
  } catch (error) {
    throw new Error('Failed to calculate swap')
  }
}

export function formatRouteDisplay(route: RouteStep[]): string {
  if (!route || route.length === 0) return 'Direct'
  
  return route.map(step => `Pool ${step.pool_id}`).join(' → ')
}

export function calculateOutputAmount(amountOut: string, decimals: number): string {
  try {
    const amount = parseFloat(amountOut) / Math.pow(10, decimals)
    return amount.toFixed(6)
  } catch {
    return '0'
  }
}