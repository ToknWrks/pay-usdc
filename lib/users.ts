// lib/users.ts
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function getUserByCustomUrl(customUrl: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.customUrl, customUrl))
      .limit(1)

    return user[0] || null
  } catch (error) {
    console.error('Error fetching user by custom URL:', error)
    return null
  }
}

export async function getUserByNobleAddress(nobleAddress: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.nobleAddress, nobleAddress))
      .limit(1)

    return user[0] || null
  } catch (error) {
    console.error('Error fetching user by noble address:', error)
    return null
  }
}

export async function updateUserCustomUrl(userId: number, customUrl: string) {
  try {
    const updatedUser = await db
      .update(users)
      .set({ 
        customUrl,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning()

    return updatedUser[0]
  } catch (error) {
    console.error('Error updating custom URL:', error)
    throw error
  }
}

export async function checkCustomUrlAvailable(customUrl: string, excludeUserId?: number) {
  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.customUrl, customUrl))
      .limit(1)

    if (existing.length === 0) return true
    if (excludeUserId && existing[0].id === excludeUserId) return true
    
    return false
  } catch (error) {
    console.error('Error checking custom URL availability:', error)
    return false
  }
}