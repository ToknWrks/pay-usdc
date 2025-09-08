// app/profile/[username]/page.tsx
import { notFound } from 'next/navigation'
import { getUserByCustomUrl } from '@/lib/users'
import ProfileClient from './ProfileClient'

interface ProfilePageProps {
  params: { username: string }
}

// This is a SERVER component - handles database access
export default async function ProfilePage({ params }: { params: { username: string } }) {
  try {
    const user = await getUserByCustomUrl(params.username)
    
    if (!user) {
      console.log('❌ User not found:', params.username)
      return notFound()
    }

    console.log('✅ User found for profile:', {
      username: params.username,
      userId: user.id,
      hasNobleAddress: !!user.nobleAddress
    })

    return <ProfileClient user={user} />
  } catch (error) {
    console.error('❌ Error in ProfilePage:', error)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Profile Error</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load profile: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProfilePageProps) {
  const user = await getUserByCustomUrl(params.username)
  
  if (!user) {
    return { title: 'Profile Not Found' }
  }
  
  return {
    title: `@${user.customUrl} - Pay USDC Profile`,
    description: `Send USDC to @${user.customUrl} easily and securely on Noble network.`,
  }
}