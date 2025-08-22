import { Metadata } from 'next'
import ListsPage from './lists-page'

export const metadata: Metadata = {
  title: 'Recipient Lists | Pay USDC',
  description: 'Manage your saved recipient lists for USDC payments. Create, edit, and organize payment recipients.',
  keywords: ['recipient lists', 'USDC', 'payments', 'Noble', 'bulk payments', 'crypto'],
  openGraph: {
    title: 'Recipient Lists - Pay USDC',
    description: 'Manage your saved recipient lists for USDC payments',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recipient Lists - Pay USDC',
    description: 'Manage your saved recipient lists for USDC payments',
  },
}

export default function ListsPageWrapper() {
  return <ListsPage />
}