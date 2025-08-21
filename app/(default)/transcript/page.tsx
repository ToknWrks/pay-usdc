'use client'

import { useState } from 'react'
import Image from 'next/image'
import UserImage05 from '@/public/images/user-32-05.jpg'
import UserImage07 from '@/public/images/user-32-07.jpg'
import UserImage08 from '@/public/images/user-32-08.jpg'

// You can add these types to a separate types file later
interface TranscriptEntry {
  id: string
  timestamp: Date
  title: string
  content: string
  tags: string[]
  category: 'setup' | 'development' | 'debugging' | 'learning' | 'other'
  isBookmarked: boolean
}

export default function TranscriptPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isAddingEntry, setIsAddingEntry] = useState(false)

  // Sample transcript data - replace with your actual data storage
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([
    {
      id: '1',
      timestamp: new Date('2024-01-15'),
      title: 'Web3 Setup with Reown AppKit',
      content: 'Successfully integrated Reown AppKit with WAGMI for EVM chains. Key points: Created web3-config.ts with project ID, set up WagmiAdapter, configured multiple networks (mainnet, arbitrum, polygon, base).',
      tags: ['web3', 'reown', 'wagmi', 'setup'],
      category: 'setup',
      isBookmarked: true
    },
    {
      id: '2',
      timestamp: new Date('2024-01-15'),
      title: 'Cosmos Integration with CosmosKit',
      content: 'Added Cosmos chain support using CosmosKit. Integrated Keplr, Leap, and VultiSig wallets. Created cosmos-config.ts and updated app-provider.tsx with ChainProvider.',
      tags: ['cosmos', 'keplr', 'leap', 'vultisig', 'cosmoskit'],
      category: 'setup',
      isBookmarked: true
    },
    {
      id: '3',
      timestamp: new Date('2024-01-15'),
      title: 'Hydration Error Fix',
      content: 'Fixed hydration mismatch error in dropdown-profile.tsx by implementing hasMounted state. Server was rendering "Acme Inc." while client showed wallet address.',
      tags: ['nextjs', 'hydration', 'debugging', 'react'],
      category: 'debugging',
      isBookmarked: false
    }
  ])

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'setup', label: 'Setup' },
    { value: 'development', label: 'Development' },
    { value: 'debugging', label: 'Debugging' },
    { value: 'learning', label: 'Learning' },
    { value: 'other', label: 'Other' }
  ]

  const filteredTranscripts = transcripts.filter(transcript => {
    const matchesSearch = transcript.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transcript.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transcript.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || transcript.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const toggleBookmark = (id: string) => {
    setTranscripts(prev => prev.map(transcript =>
      transcript.id === id 
        ? { ...transcript, isBookmarked: !transcript.isBookmarked }
        : transcript
    ))
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      setup: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      development: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      debugging: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      learning: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Chat Transcripts
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Store and organize valuable information from our conversations
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" width="16" height="16" viewBox="0 0 16 16">
                <path fill="currentColor" d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z"/>
                <path fill="currentColor" d="m15.707 14.293-4.273-4.273a.999.999 0 1 0-1.414 1.414l4.273 4.273a.999.999 0 1 0 1.414-1.414z"/>
              </svg>
              <input
                type="text"
                placeholder="Search transcripts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              className="w-full py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Add Entry Button */}
          <button
            onClick={() => setIsAddingEntry(true)}
            className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C8.55228 0 9 0.447715 9 1V7H15C15.5523 7 16 7.44772 16 8C16 8.55228 15.5523 9 15 9H9V15C9 15.5523 8.55228 16 8 16C7.44772 16 7 15.5523 7 15V9H1C0.447715 9 0 8.55228 0 8C0 7.44772 0.447715 7 1 7H7V1C7 0.447715 7.44772 0 8 0Z"/>
            </svg>
            Add Entry
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredTranscripts.length} {filteredTranscripts.length === 1 ? 'entry' : 'entries'} found
        </p>
      </div>

      {/* Transcript List */}
      <div className="space-y-4">
        {filteredTranscripts.map((transcript) => (
          <div key={transcript.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {transcript.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transcript.category)}`}>
                    {transcript.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{transcript.timestamp.toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{transcript.tags.length} tags</span>
                </div>
              </div>
              
              {/* Bookmark Button */}
              <button
                onClick={() => toggleBookmark(transcript.id)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  transcript.isBookmarked 
                    ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill={transcript.isBookmarked ? 'currentColor' : 'none'} stroke="currentColor">
                  <path d="M2 2C2 0.895431 2.89543 0 4 0H12C13.1046 0 14 0.895431 14 2V15.2361C14 15.7111 13.4452 15.9762 13.0894 15.6894L8 11.75L2.91056 15.6894C2.55477 15.9762 2 15.7111 2 15.2361V2Z"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {transcript.content}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {transcript.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTranscripts.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No transcripts found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms or category filter.</p>
        </div>
      )}
    </div>
  )
}