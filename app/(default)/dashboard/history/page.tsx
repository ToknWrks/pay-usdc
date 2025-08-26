import { Metadata } from 'next'
import TransactionHistoryPage from './transaction-history-page'

export const metadata: Metadata = {
  title: 'Transaction History | Pay USDC',
  description: 'View your complete USDC transaction history and payment records',
  keywords: ['transaction history', 'USDC', 'payments', 'Noble', 'blockchain'],
  openGraph: {
    title: 'Transaction History - Pay USDC',
    description: 'View your complete USDC transaction history and payment records',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transaction History - Pay USDC',
    description: 'View your complete USDC transaction history and payment records',
  },
}

export default function HistoryPage() {
  return <TransactionHistoryPage />
}