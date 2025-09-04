// components/qr-code-modal.tsx
'use client'

import NobleQRCode from './noble-qr-code'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  address: string
  username?: string
}

export default function QRCodeModal({ isOpen, onClose, address, username }: QRCodeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Payment QR Code
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <NobleQRCode 
              address={address} 
              username={username}
            />
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Recipient:</span> @{username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-700 p-2 rounded">
              {address}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Network: Noble (Cosmos)
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-4">
              💡 Scan the QR code to copy the address, then enter the payment amount manually in your wallet
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}