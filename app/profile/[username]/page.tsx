// app/profile/[username]/page.tsx
import { notFound } from 'next/navigation'
import { getUserByCustomUrl } from '@/lib/users'
import ProfileClient from './ProfileClient'

interface ProfilePageProps {
  params: { username: string }
}

// This is a SERVER component - handles database access
export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = params
  
  const user = await getUserByCustomUrl(username)
  
  if (!user) {
    notFound()
  }

  // Pass data to client component
  return <ProfileClient user={user} />
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