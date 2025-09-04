// components/noble-qr-code.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface NobleQRCodeProps {
  address: string
  username?: string
  amount?: string // Keep for interface compatibility but don't use
}

export default function NobleQRCode({ address, username }: NobleQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrUri, setQrUri] = useState('')

  useEffect(() => {
    // Just use the plain address - this works!
    const uri = address
    
    setQrUri(uri)
    console.log('QR URI:', uri) // DEBUG LOG
    
    // Generate QR code
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, uri, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error)
    }
  }, [address]) // Remove amount and username from dependencies

  const copyUri = () => {
    navigator.clipboard?.writeText(qrUri)
    alert('Address copied to clipboard!')
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <canvas ref={canvasRef} className="border border-gray-200 dark:border-gray-600 rounded-lg" />
      
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Scan to copy address, then enter amount manually in your wallet
        </p>
        <button 
          onClick={copyUri}
          className="mt-2 text-xs text-blue-500 hover:text-blue-700 underline"
        >
          Copy Address
        </button>
      </div>
    </div>
  )
}