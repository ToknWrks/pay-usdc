// components/asset-selector.tsx
'use client'

import { useState } from 'react'
import { useOsmosisAssets } from '@/hooks/use-osmosis-assets'

interface AssetSelectorProps {
  onAssetSelect: (asset: any) => void
  selectedAsset?: any
}

export default function AssetSelector({ onAssetSelect, selectedAsset }: AssetSelectorProps) {
  const { assets, isLoading, error, refetch, connect, isConnected } = useOsmosisAssets()
  const [isOpen, setIsOpen] = useState(false)

  if (!isConnected) {
    return (
      <div className="w-full px-3 py-2 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
        <span className="text-yellow-800 dark:text-yellow-200 text-sm">
          Connect Osmosis wallet to see your assets
        </span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading assets...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/10">
        <div className="flex items-center justify-between">
          <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
          <button
            onClick={refetch}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          No assets with minimum $0.50 value found
        </span>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        className="w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          {selectedAsset ? (
            <div className="flex items-center">
              {selectedAsset.icon && (
                <img 
                  src={selectedAsset.icon} 
                  alt={selectedAsset.symbol}
                  className="w-6 h-6 rounded-full mr-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              )}
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedAsset.symbol}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedAsset.amount} available
                </div>
              </div>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">Select an asset</span>
          )}
          
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {assets.map((asset) => (
            <button
              key={asset.denom}
              className="w-full px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center border-b border-gray-100 dark:border-gray-600 last:border-b-0"
              onClick={() => {
                onAssetSelect(asset)
                setIsOpen(false)
              }}
            >
              {asset.icon && (
                <img 
                  src={asset.icon} 
                  alt={asset.symbol}
                  className="w-8 h-8 rounded-full mr-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {asset.symbol}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {asset.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${asset.value.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {asset.amount} {asset.symbol}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}