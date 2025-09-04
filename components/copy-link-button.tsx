// components/copy-link-button.tsx
'use client'

interface CopyLinkButtonProps {
  url: string
}

export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://pay-usdc.app/${url}`)
      // TODO: Show toast notification
      alert('Link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy link')
    }
  }

  return (
    <button 
      onClick={handleCopy}
      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
    >
      Copy Link
    </button>
  )
}