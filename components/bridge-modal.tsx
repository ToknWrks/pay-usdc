'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSwitchChain, useChainId, useWriteContract } from 'wagmi'
import { useChain } from '@cosmos-kit/react'
// ADD THESE SKIP IMPORTS
import * as SkipClient from '@skip-go/client'
import { parseUnits } from 'viem'
import SkipRouter from '@skip-go/client'

// ADD USDC CONTRACT ABI
const USDC_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// ADD CCTP CONTRACT ABI
const CCTP_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint32", "name": "destinationDomain", "type": "uint32"},
      {"internalType": "bytes32", "name": "mintRecipient", "type": "bytes32"},
      {"internalType": "address", "name": "burnToken", "type": "address"}
    ],
    "name": "depositForBurn",
    "outputs": [{"internalType": "uint64", "name": "_nonce", "type": "uint64"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// ADD CCTP TOKEN MESSENGER ADDRESSES
const CCTP_TOKEN_MESSENGER = {
  42161: '0x19330d10D9Cc8751218eaf51E8885D058642E08A', // Arbitrum
  1: '0xBd3fa81B58Ba92a82136038B25aDec7066af3155',     // Ethereum
  // Add others as needed
}

// Define the FromChain interface
interface FromChain {
  chainId: number
  name: string
  fromChain?: FromChain
  usdc?: {
    formatted: string
    hasUsdc: boolean
  }
  logo?: string // Add the logo property
}

// Your existing interface stays the same...
interface BridgeModalProps {
  isOpen: boolean
  onClose: () => void
  fromChain?: FromChain
}

export default function BridgeModal({ isOpen, onClose, fromChain }: BridgeModalProps) {
  const [bridgeAmount, setBridgeAmount] = useState('')
  const [isBridging, setIsBridging] = useState(false)
  const [bridgeStep, setBridgeStep] = useState<'input' | 'bridging' | 'success' | 'error'>('input')
  const [txHash, setTxHash] = useState('')

  // ADD THESE STATES AFTER YOUR EXISTING STATES
  const [quote, setQuote] = useState<any>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  // ADD SKIP API CONSTANTS
  const SKIP_API_URL = 'https://api.skip.money/v2'

  // EVM wallet
  const { address: evmAddress, isConnected: evmConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const currentChainId = useChainId()

  // Noble wallet
  const { address: nobleAddress, isWalletConnected: nobleConnected } = useChain('noble')

  // Add this hook with your other hooks at the top
  const { writeContract, isPending: isWritePending } = useWriteContract()

  // MOVE THIS useEffect HERE - BEFORE THE CONDITIONAL RETURN
  const bridgeAmountNum = parseFloat(bridgeAmount || '0')

  // MOVE THIS FUNCTION BEFORE useEffect
  // Removed duplicate declaration of getQuote

  useEffect(() => {
    const timer = setTimeout(() => {
      if (bridgeAmount && bridgeAmountNum > 0 && fromChain) {
        getQuote()
      } else {
        setQuote(null)
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(timer)
  }, [bridgeAmount, fromChain?.chainId]) // Add dependency

  // NOW THE CONDITIONAL RETURN
  if (!isOpen || !fromChain) return null

  // Use the chain's USDC data directly
  const maxAmount = parseFloat(fromChain.usdc?.formatted || '0')
  const chainHasUsdc = fromChain.usdc?.hasUsdc || false
  const isValidAmount = bridgeAmountNum > 0 && bridgeAmountNum <= maxAmount

  const handleMaxClick = () => {
    setBridgeAmount(maxAmount.toString())
  }

  const handleBridge = async () => {
    if (!isValidAmount || !evmConnected || !nobleConnected || !fromChain) return

    setIsBridging(true)
    try {
      // Switch to the correct chain if needed
      if (currentChainId !== fromChain.chainId) {
        console.log(`Switching to chain ${fromChain.chainId}`)
        await switchChain({ chainId: fromChain.chainId })
      }

      // Execute bridge with Skip Protocol
      await bridgeWithSkip()
    } catch (error) {
      console.error('Bridge failed:', error)
      alert(`Bridge failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setBridgeStep('input') // Reset to input step on error
    } finally {
      setIsBridging(false)
    }
  }

  const resetModal = () => {
    setBridgeAmount('')
    setIsBridging(false)
    setBridgeStep('input')
    setTxHash('')
    onClose()
  }

  // ADD THESE HELPER FUNCTIONS AFTER THE HOOKS
  const getSkipRoute = async (fromChainId: number, toChainId: string, amount: string) => {
    try {
      const response = await fetch(`${SKIP_API_URL}/fungible/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_asset_denom: getUSDCDenom(fromChainId),
          source_asset_chain_id: fromChainId.toString(),
          dest_asset_denom: 'uusdc', // USDC on Noble
          dest_asset_chain_id: toChainId,
          amount_in: amount,
        }),
      })

      if (!response.ok) {
        throw new Error(`Skip API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get Skip route:', error)
      throw error
    }
  }

  // Helper to get USDC denom for each chain
  const getUSDCDenom = (chainId: number): string => {
    const usdcAddresses = {
      1: '0xA0b86a33E6441b46C6a74a9ed8fa1ba8ab6dd37e', // Ethereum
      10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', // Optimism
      137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon
      42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum
      8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
    }
    return usdcAddresses[chainId as keyof typeof usdcAddresses] || ''
  }

  // ADD THIS FUNCTION TO GET QUOTE
  const getQuote = async () => {
    if (!bridgeAmount || !fromChain || bridgeAmountNum <= 0) {
      setQuote(null)
      return
    }

    setIsLoadingQuote(true)
    setQuoteError(null)

    try {
      const route = await getSkipRoute(
        fromChain.chainId,
        'noble-1',
        parseUnits(bridgeAmount, 6).toString()
      )

      console.log('Quote received:', route)
      setQuote(route)
    } catch (error) {
      console.error('Failed to get quote:', error)
      setQuoteError('Failed to get bridge quote')
      setQuote(null)
    } finally {
      setIsLoadingQuote(false)
    }
  }

  // UPDATE bridgeWithSkip to pass the amount to executeTransfer
  const bridgeWithSkip = async () => {
    if (!fromChain || !evmAddress || !nobleAddress || !bridgeAmount) {
      throw new Error('Missing required data for bridge')
    }

    setBridgeStep('bridging')
    
    try {
      console.log('Getting route from Skip...')
      const route = await getSkipRoute(
        fromChain.chainId,
        'noble-1',
        parseUnits(bridgeAmount, 6).toString()
      )
      
      console.log('Skip route:', route)
      
      if (!route || !route.operations || route.operations.length === 0) {
        throw new Error('No route found for this bridge')
      }

      // Execute the operations and wait for real transaction
      let actualTxHash = ''
      
      for (const operation of route.operations) {
        console.log('Executing operation:', operation)
        
        if (operation.cctp_transfer) {
          console.log('CCTP transfer operation:', operation.cctp_transfer)
          // Wait for the actual transaction hash
          actualTxHash = await executeTransfer(operation.cctp_transfer, operation.amount_in)
        }
      }
      
      // Only show success when we have a real transaction hash
      if (actualTxHash && actualTxHash !== 'pending') {
        setTxHash(actualTxHash)
        setBridgeStep('success')
      } else {
        throw new Error('Failed to get transaction hash')
      }
      
    } catch (error) {
      console.error('Skip bridge failed:', error)
      setBridgeStep('error')
      throw error
    }
  }

  // UPDATE the executeTransfer function to debug the CCTP operation
  const executeTransfer = async (transferOp: any, operationAmount?: string): Promise<string> => {
    console.log('Full transferOp object:', transferOp)
    console.log('Skip wants CCTP transfer via bridge_id:', transferOp.bridge_id)
    
    if (transferOp.from_chain_id === fromChain?.chainId.toString()) {
      console.log('Starting CCTP depositForBurn...')
      
      try {
        const usdcAddress = getUSDCDenom(fromChain.chainId)
        const cctpMessenger = CCTP_TOKEN_MESSENGER[fromChain.chainId as keyof typeof CCTP_TOKEN_MESSENGER]
        
        if (!usdcAddress || !cctpMessenger) {
          throw new Error('USDC or CCTP TokenMessenger address not found for this chain')
        }

        const amount = operationAmount
        if (!amount) {
          throw new Error('No amount found in transfer operation')
        }

        if (!nobleAddress) {
          throw new Error('Noble address not found')
        }

        // Convert Noble address to bytes32 (simplified approach)
        const nobleAddressBytes = convertNobleAddressToBytes32(nobleAddress)

        console.log('Noble address:', nobleAddress)
        console.log('Noble address as bytes32:', nobleAddressBytes)

        // Make sure it's not zero
        if (nobleAddressBytes === `0x${'0'.repeat(64)}`) {
          throw new Error('Noble address conversion resulted in zero bytes')
        }

        // STEP 1: Approve USDC spending
        console.log('Step 1: Approving USDC spending...')
        
        const approvalResult = await new Promise<string>((resolve, reject) => {
          writeContract(
            {
              address: usdcAddress as `0x${string}`,
              abi: USDC_ABI,
              functionName: 'approve',
              args: [
                cctpMessenger as `0x${string}`, // Spender: CCTP contract
                BigInt(amount) // Amount to approve
              ],
            },
            {
              onSuccess: (txHash) => {
                console.log('USDC approval successful:', txHash)
                resolve(txHash)
              },
              onError: (error) => {
                console.error('USDC approval failed:', error)
                reject(error)
              }
            }
          )
        })

        console.log('USDC approved, now calling depositForBurn...')

        // STEP 2: Call depositForBurn after approval
        return new Promise((resolve, reject) => {
          writeContract(
            {
              address: cctpMessenger as `0x${string}`,
              abi: CCTP_ABI,
              functionName: 'depositForBurn',
              args: [
                BigInt(amount),
                4, // Noble domain ID
                nobleAddressBytes as `0x${string}`,
                usdcAddress as `0x${string}`
              ],
            },
            {
              onSuccess: (txHash) => {
                console.log('CCTP transaction successful:', txHash)
                resolve(txHash)
              },
              onError: (error) => {
                console.error('CCTP transaction failed:', error)
                
                if (error.message?.includes('User rejected')) {
                  reject(new Error('Transaction was rejected by user'))
                } else if (error.message?.includes('400')) {
                  reject(new Error('Invalid transaction parameters (400 error)'))
                } else {
                  reject(error)
                }
              }
            }
          )
        })
        
      } catch (error) {
        console.error('CCTP depositForBurn failed:', error)
        throw error
      }
    }
    
    return ''
  }

  // ADD THIS HELPER FUNCTION AT THE TOP OF THE COMPONENT
  const convertNobleAddressToBytes32 = (nobleAddress: string): string => {
    try {
      console.log('Converting Noble address:', nobleAddress)
      
      if (!nobleAddress.startsWith('noble1')) {
        throw new Error('Invalid Noble address format')
      }

      // Remove 'noble1' prefix and get the remaining part
      const addressPart = nobleAddress.slice(6)
      console.log('Address part after noble1:', addressPart)
      
      // Convert to hex
      const addressBytes = Buffer.from(addressPart, 'utf8').toString('hex')
      console.log('Address as hex:', addressBytes)
      console.log('Current length:', addressBytes.length)
      
      // ENSURE EXACTLY 32 BYTES (64 hex characters)
      let finalBytes: string
      
      if (addressBytes.length > 64) {
        // If too long, truncate to 64 characters
        finalBytes = addressBytes.slice(0, 64)
        console.log('Truncated to 64 chars:', finalBytes)
      } else if (addressBytes.length < 64) {
        // If too short, pad with zeros on the RIGHT (not left)
        finalBytes = addressBytes.padEnd(64, '0')
        console.log('Padded to 64 chars:', finalBytes)
      } else {
        finalBytes = addressBytes
      }
      
      console.log('Final bytes32:', `0x${finalBytes}`)
      console.log('Final length check:', finalBytes.length === 64 ? 'CORRECT' : 'WRONG')
      
      return `0x${finalBytes}`
      
    } catch (error) {
      console.error('Error converting Noble address:', error)
      
      // Fallback: create exactly 32 bytes
      const fallback = nobleAddress.slice(0, 32).padEnd(32, '0')
      const fallbackHex = Buffer.from(fallback).toString('hex')
      console.log('Fallback conversion:', fallbackHex)
      
      return `0x${fallbackHex}`
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Bridge USDC to Noble
          </h3>
          <button
            onClick={resetModal}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Bridge Route */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <img
                  src={fromChain.logo}
                  alt={fromChain.name}
                  className="w-8 h-8 rounded-full mr-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {fromChain.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Balance: ${fromChain.usdc?.formatted || '0.00'} USDC
                  </div>
                </div>
              </div>

              <div className="flex items-center mx-4">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Noble
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    via Skip Protocol
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                EVM Wallet
              </span>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    evmConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {evmConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Noble Wallet
              </span>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    nobleConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {nobleConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
          </div>

          {/* Bridge Content Based on Step */}
          {bridgeStep === 'input' && (
            <>
              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount to Bridge
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={bridgeAmount}
                    onChange={(e) => setBridgeAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    USDC
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() =>
                      setBridgeAmount((maxAmount * 0.25).toFixed(2))
                    }
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    25%
                  </button>
                  <button
                    onClick={() =>
                      setBridgeAmount((maxAmount * 0.5).toFixed(2))
                    }
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    50%
                  </button>
                  <button
                    onClick={() =>
                      setBridgeAmount((maxAmount * 0.75).toFixed(2))
                    }
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    75%
                  </button>
                  <button
                    onClick={handleMaxClick}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* ADD THIS QUOTE SECTION AFTER THE AMOUNT INPUT AND BUTTONS */}
              {/* Quote Display */}
              {(quote || isLoadingQuote || quoteError) && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Bridge Quote
                  </h4>

                  {isLoadingQuote && (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Getting quote...
                      </span>
                    </div>
                  )}

                  {quoteError && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {quoteError}
                    </div>
                  )}

                  {quote && !isLoadingQuote && (
                    <div className="space-y-3">
                      {/* Amount Summary */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          You send:
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${quote.usd_amount_in} USDC
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          You receive:
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${quote.usd_amount_out} USDC
                        </span>
                      </div>

                      {/* Fees */}
                      {quote.estimated_fees &&
                        quote.estimated_fees.length > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Bridge fee:
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              $
                              {(
                                parseFloat(quote.usd_amount_in) -
                                parseFloat(quote.usd_amount_out)
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}

                      {/* Estimated Time */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Estimated time:
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(
                            quote.estimated_route_duration_seconds / 60
                          )}{' '}
                          minutes
                        </span>
                      </div>

                      {/* Route Info */}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Route: {fromChain.name} → Noble via Skip Protocol
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {quote.txs_required} transaction
                          {quote.txs_required > 1 ? 's' : ''} required
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bridge Button */}
              <button
                onClick={handleBridge}
                disabled={
                  !isValidAmount ||
                  !evmConnected ||
                  !nobleConnected ||
                  isBridging ||
                  !chainHasUsdc
                }
                className="w-full py-4 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isBridging ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin w-5 h-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Bridging USDC...
                  </div>
                ) : !evmConnected || !nobleConnected ? (
                  'Connect Wallets to Continue'
                ) : !chainHasUsdc ? (
                  'No USDC Available'
                ) : !isValidAmount ? (
                  'Enter Amount to Bridge'
                ) : (
                  `Bridge ${bridgeAmount} USDC to Noble`
                )}
              </button>
            </>
          )}

          {bridgeStep === 'bridging' && (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Bridging USDC
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Your USDC is being bridged to Noble via Skip Protocol...
              </p>
              <div className="mt-4 text-sm text-gray-500">
                This may take 5-15 minutes to complete
              </div>
            </div>
          )}

          {bridgeStep === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Bridge Transaction Sent!
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ${bridgeAmount} USDC is being bridged to Noble via CCTP
              </p>
              
              {/* Add tracking info */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <div className="font-medium mb-1">Bridge Status:</div>
                  <div>• USDC burned on {fromChain?.name}</div>
                  <div>• Waiting for CCTP relay to Noble (10-15 min)</div>
                  <div>• Check your Noble wallet for USDC arrival</div>
                </div>
              </div>
              
              {txHash && (
                <div className="mb-4">
                  <a 
                    href={`https://arbiscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    View Burn Transaction →
                  </a>
                </div>
              )}
              
              <button
                onClick={resetModal}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {bridgeStep === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6m0 0L6 6l12 12"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Bridge Failed
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The bridge transaction failed. Please try again.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setBridgeStep('input')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={resetModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}