// Create components/pool-interaction.tsx
'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract, useBalance } from 'wagmi'
import { parseUnits, formatUnits, Address } from 'viem'

const POOL_ADDRESS = '0x690e66fc0F8be8964d40e55EdE6aEBdfcB8A21Df' as Address

// Simplified ABI for the main functions
const POOL_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amountLp", "type": "uint256"}],
    "name": "withdraw", 
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokenBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vUsdBalance", 
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [{"internalType": "contract ERC20", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export default function EvmPoolInteraction() {
  const { address, isConnected } = useAccount()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // Read pool data
  const { data: tokenBalance } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: 'tokenBalance',
  })

  const { data: vUsdBalance } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: 'vUsdBalance',
  })

  const { data: userLpBalance } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: currentPrice } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: 'getPrice',
  })

  const { data: underlyingToken } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: 'token',
  })

  // Get user's token balance
  const { data: userTokenBalance } = useBalance({
    address: address,
    token: underlyingToken as Address,
  })

  // Write functions
  const { writeContract: deposit, isPending: isDepositing } = useWriteContract()
  const { writeContract: withdraw, isPending: isWithdrawing } = useWriteContract()

  const handleDeposit = async () => {
    if (!depositAmount || !userTokenBalance) return

    try {
      deposit({
        address: POOL_ADDRESS,
        abi: POOL_ABI,
        functionName: 'deposit',
        args: [parseUnits(depositAmount, userTokenBalance.decimals)],
      })
    } catch (error) {
      console.error('Deposit failed:', error)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount) return

    try {
      withdraw({
        address: POOL_ADDRESS,
        abi: POOL_ABI,
        functionName: 'withdraw',
        args: [parseUnits(withdrawAmount, 18)],
      })
    } catch (error) {
      console.error('Withdraw failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Connect your EVM wallet to interact with the liquidity pool
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Pool Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Token Balance</p>
          <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
            {tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)).toFixed(2) : '0'} 
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">vUSD Balance</p>
          <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
            {vUsdBalance ? parseFloat(formatUnits(vUsdBalance, 18)).toFixed(2) : '0'}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Your LP Tokens</p>
          <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
            {userLpBalance ? parseFloat(formatUnits(userLpBalance, 18)).toFixed(4) : '0'}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Price</p>
          <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
            {currentPrice ? (Number(currentPrice) / 10000).toFixed(4) : '0'}
          </p>
        </div>
      </div>

      {/* Your Balance */}
      {userTokenBalance && userTokenBalance.value > BigInt(0) && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg mb-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Your Balance: {parseFloat(formatUnits(userTokenBalance.value, userTokenBalance.decimals)).toFixed(4)} {userTokenBalance.symbol}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4">
        {/* Deposit */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">💰 Deposit Liquidity</h4>
          <div className="flex gap-2">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount to deposit"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleDeposit}
              disabled={isDepositing || !depositAmount}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDepositing ? 'Depositing...' : 'Deposit'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Receive LP tokens representing your pool share
          </p>
        </div>

        {/* Withdraw */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">💸 Withdraw Liquidity</h4>
          <div className="flex gap-2">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="LP tokens to burn"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !withdrawAmount}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Burn LP tokens to get back underlying assets + fees
          </p>
        </div>
      </div>

      {/* Contract Link */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <a 
          href={`https://etherscan.io/address/${POOL_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Contract on Etherscan
        </a>
      </div>
    </>
  )
}