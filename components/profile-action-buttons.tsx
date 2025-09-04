// components/profile-action-buttons.tsx
'use client'

interface ProfileActionButtonsProps {
  username: string
}

export default function ProfileActionButtons({ username }: ProfileActionButtonsProps) {
  const handleSendMessage = () => {
    // TODO: Implement messaging
    alert(`Send message to @${username}`)
  }

  const handleContact = () => {
    // TODO: Implement contact
    alert(`Contact @${username}`)
  }

  return (
    <div className="flex space-x-2 sm:mb-2">
      <button 
        onClick={handleSendMessage}
        className="btn-sm bg-blue-500 text-white hover:bg-blue-600"
      >
        <svg className="fill-current shrink-0 mr-2" width="16" height="16" viewBox="0 0 16 16">
          <path d="M8 0C3.6 0 0 3.1 0 7s3.6 7 8 7h.6l5.4 2v-4.4c1.2-1.2 2-2.8 2-4.6 0-3.9-3.6-7-8-7Zm4 10.8v2.3L8.9 12H8c-3.3 0-6-2.2-6-5s2.7-5 6-5 6 2.2 6 5c0 2.2-2 3.8-2 3.8Z" />
        </svg>
        <span>Send USDC</span>
      </button>
      <button 
        onClick={handleContact}
        className="btn-sm bg-gray-500 text-white hover:bg-gray-600"
      >
        <svg className="fill-current shrink-0 mr-2" width="16" height="16" viewBox="0 0 16 16">
          <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z"/>
        </svg>
        <span>Contact</span>
      </button>
    </div>
  )
}