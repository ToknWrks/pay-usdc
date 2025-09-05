// components/profile-settings-modal.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useChain } from '@cosmos-kit/react'
import CustomUrlSettings from '../app/profile/settings/CustomUrlSettings'

interface ProfileSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { address: nobleAddress, isWalletConnected } = useChain('noble')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle escape key to close
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    async function fetchUserData() {
      if (!nobleAddress || !isOpen) return
      
      setIsLoading(true)
      try {
        console.log('Fetching user data for:', nobleAddress)
        
        const response = await fetch(`/api/users?nobleAddress=${encodeURIComponent(nobleAddress)}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log('User data response:', data)
          setUser(data.user)
        } else if (response.status === 404) {
          console.log('User not found - this is okay for new users')
          setUser(null)
        } else {
          console.error('Error fetching user:', response.status)
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && nobleAddress) {
      fetchUserData()
    }
  }, [nobleAddress, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Profile Settings
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
          {!isWalletConnected ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Connect Your Wallet
              </h4>
              <p className="text-yellow-700 dark:text-yellow-300">
                Please connect your Noble wallet to manage your profile settings.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading profile...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Profile Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h4 className="text-lg font-semibold mb-4">Profile Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Noble Address
                    </label>
                    <input
                      type="text"
                      value={nobleAddress || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono text-sm"
                    />
                  </div>
                  
                  {user?.customUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Profile URL
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={`payusdc.app/${user.customUrl}`}
                          disabled
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm"
                        />
                        <a
                          href={`/${user.customUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          Visit
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reuse your existing CustomUrlSettings component */}
              <CustomUrlSettings 
                currentUrl={user?.customUrl || undefined}
                userId={user?.id?.toString()} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}