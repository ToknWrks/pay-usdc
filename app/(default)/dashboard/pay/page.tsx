import { Metadata } from 'next'
import PayMultiPage from './pay-multi'

export const metadata: Metadata = {
  title: 'Send USDC Payments | Pay USDC',
  description: 'send USDC payments across EVM and Cosmos chains with MetaMask, Keplr, and Leap wallets.',
  keywords: ['USDC', 'USDC Payments', 'Send USDC to multiple wallets', 'bulk send USDC', 'usdc crypto payments', 'crypto payroll', 'EVM wallets', 'Arbitrum USDC', 'Optimism USDC', 'Base USDC', 'BSC USDC', 'Avalanche USDC', 'Cosmos USDC', 'Osmosis USDC', 'Juno USDC'],
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
  return <PayMultiPage />
}