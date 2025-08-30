'use client'

import { useState } from 'react'
import EvmPoolInteraction from '../earn-usdc/evm-pool-interaction'
import { usePoolData } from '@/hooks/use-pool-data'

export default function EvmPoolLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPool, setSelectedPool] = useState<string | null>(null)

  // Get real pool data including user position
  const { 
    tvlFormatted, 
    apyFormatted, 
    userPositionFormatted, 
    userLpTokensFormatted, 
    hasPosition,
    isLoading, 
    hasData, 
    hasError, 
    debugInfo 
  } = usePoolData()

  const openPoolModal = (poolName: string) => {
    setSelectedPool(poolName)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPool(null)
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">DeFi Liquidity Pools</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Live pool metrics • 7-day average APY • Your positions
          </p>
        </header>
        <div className="p-3">
          
          {/* Enhanced Debug section */}
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
              Debug: Loading: {isLoading ? 'Yes' : 'No'} | Has Data: {hasData ? 'Yes' : 'No'} | Error: {hasError ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
              TVL: {tvlFormatted} | APY: {apyFormatted} | Your Position: {userPositionFormatted} | LP Tokens: {userLpTokensFormatted}
            </p>
            
            {/* Raw Values Display */}
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">
              <div>Raw Token Balance: {debugInfo.tokenBalanceRaw}</div>
              <div>Raw vUSD Balance: {debugInfo.vUsdBalanceRaw}</div>
              <div>Raw Reserves: {debugInfo.reserves}</div>
            </div>
            
            <details className="text-xs text-yellow-600 dark:text-yellow-400">
              <summary className="cursor-pointer">Full Contract Data</summary>
              <pre className="mt-2 bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded overflow-x-auto text-xs">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>

          <div className="overflow-x-auto">
            <table className="table-auto w-full dark:text-gray-300">
              <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 rounded-sm">
                <tr>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-left">Pool</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-left">APY (7d)</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-left">TVL</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-left">Your Position</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="font-semibold text-left">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                
                {/* Allbridge Pool - Real Data */}
                <tr>
                  <td className="p-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative shrink-0 mr-2 sm:mr-3">
                        <svg className="w-9 h-9" viewBox="0 0 36 36">
                          <circle fill="#2D374B" cx="18" cy="18" r="18" />
                          <path d="M18 6.5L9.5 23.5h17L18 6.5z" fill="#28A0F0" />
                          <path d="M16.5 15L13 22h7l-3.5-7z" fill="#96BEDC" />
                        </svg>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">A</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-800 dark:text-gray-100 font-medium">Allbridge Stable Pool</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          Arbitrum • USDC/vUSD
                          {!hasError && hasData && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                              Live
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                      </div>
                    ) : hasError ? (
                      <div className="text-red-500 text-sm">Error</div>
                    ) : (
                      <div>
                        <div className="font-semibold text-left text-green-600">{apyFormatted}</div>
                        <div className="text-xs text-gray-500">7-day avg</div>
                      </div>
                    )}
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                    ) : hasError ? (
                      <div className="text-red-500 text-sm">Error</div>
                    ) : (
                      <div>
                        <div className="text-left font-medium">{tvlFormatted}</div>
                        <div className="text-xs text-gray-500">Total locked</div>
                      </div>
                    )}
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1"></div>
                      </div>
                    ) : (
                      <div className="text-left">
                        <div className={`text-sm font-medium ${hasPosition ? 'text-blue-600' : 'text-gray-500'}`}>
                          {userPositionFormatted}
                        </div>
                        <div className="text-xs text-gray-500">
                          {hasPosition ? `${userLpTokensFormatted} LP tokens` : 'No position'}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <button
                      onClick={() => openPoolModal('Allbridge Stable Pool')}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      {hasPosition ? 'Manage' : 'Deposit'}
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <header className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {selectedPool}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage your liquidity position
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            <div className="p-6">
              <EvmPoolInteraction />
            </div>
          </div>
        </div>
      )}
    </>
  )
}