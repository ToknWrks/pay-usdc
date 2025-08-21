import { Metadata } from 'next'
import WalletStatusPage from './wallet-status-page'

export const metadata: Metadata = {
  title: 'Connected Wallets | Pay USDC',
  description: 'View and manage your EVM and Cosmos wallet connections. Connect MetaMask, Keplr, Leap and other wallets.',
  keywords: ['wallet', 'EVM', 'Cosmos', 'MetaMask', 'Keplr', 'Leap', 'USDC', 'cryptocurrency'],
  openGraph: {
    title: 'Connected Wallets - Pay USDC',
    description: 'Manage your multi-chain wallet connections',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Connected Wallets - Pay USDC',
    description: 'Manage your multi-chain wallet connections',
  },
}

export default function WalletsPage() {
  return <WalletStatusPage />
}