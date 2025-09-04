// app/api/profile/custom-url/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateUserCustomUrl, checkCustomUrlAvailable, getUserByNobleAddress } from '@/lib/users'

export async function POST(request: NextRequest) {
  try {
    const { customUrl, nobleAddress } = await request.json()
    
    // Get user by Noble address
    const user = await getUserByNobleAddress(nobleAddress)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Validate custom URL format
    if (!isValidCustomUrl(customUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format. Use only letters, numbers, and hyphens.' },
        { status: 400 }
      )
    }
    
    // Check if URL is available
    const isAvailable = await checkCustomUrlAvailable(customUrl, user.id)
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'This URL is already taken' },
        { status: 409 }
      )
    }
    
    // Update user's custom URL
    const updatedUser = await updateUserCustomUrl(user.id, customUrl)
    
    return NextResponse.json({ 
      success: true, 
      customUrl: updatedUser.customUrl 
    })
  } catch (error) {
    console.error('Error updating custom URL:', error)
    return NextResponse.json(
      { error: 'Failed to update custom URL' },
      { status: 500 }
    )
  }
}

function isValidCustomUrl(url: string): boolean {
  // Reserved words that can't be used as custom URLs
  const reservedWords = [
    'admin', 'api', 'app', 'www', 'mail', 'ftp', 'localhost',
    'dashboard', 'profile', 'settings', 'help', 'support',
    'contact', 'about', 'privacy', 'terms', 'blog', 'docs',
    'pay', 'wallets', 'contacts', 'auth', 'login', 'signup'
  ]
  
  // Check format: 3-30 characters, letters, numbers, hyphens only
  const regex = /^[a-zA-Z0-9-]{3,30}$/
  if (!regex.test(url)) return false
  
  // Check reserved words
  if (reservedWords.includes(url.toLowerCase())) return false
  
  // No leading/trailing hyphens
  if (url.startsWith('-') || url.endsWith('-')) return false
  
  return true
}