import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon, base, optimism, bsc, avalanche } from '@reown/appkit/networks'

// 1. Get projectId from environment variable or fallback to default
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '0fd04001294706c882560d305ca50086'

console.log('Project ID:', projectId) // Debug log

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// 2. Set up Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet, arbitrum, polygon, base, optimism, bsc, avalanche]
})

// 3. Configure the metadata
const metadata = {
  name: 'Pay USDC',
  description: 'Web3 USDC Payment App',
  url: 'https://pay-usdc.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 4. Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum, polygon, base, optimism, bsc, avalanche],
  defaultNetwork: mainnet,
  metadata,
  features: {
    analytics: true,
  }
})