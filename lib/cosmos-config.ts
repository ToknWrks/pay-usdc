// cosmos-config.ts - Simple string approach
import { wallets as keplrWallets } from '@cosmos-kit/keplr'
import { wallets as leapWallets } from '@cosmos-kit/leap-extension'

// Use string chain names - cosmos-kit will resolve them
export const cosmosChains = [
  'osmosis',      // Put osmosis first as it's most popular
  'cosmoshub',
  'juno',
  'stargaze',
  'neutron',
  'axelar',
  'noble',
]

export const cosmosAssets: any[] = []

export const cosmosWallets = [
  ...keplrWallets,
  ...leapWallets,
]

// Add explicit wallet connect options to ensure Cosmos focus
export const walletConnectOptions = {
  signClient: {
    projectId: '0fd04001294706c882560d305ca50086',
    metadata: {
      name: 'Pay USDC - Cosmos',
      description: 'Cosmos-focused USDC payments',
      url: 'https://pay-usdc.app',
      icons: ['https://avatars.githubusercontent.com/u/37784886']
    }
  },
  // Disable auto-connect
  autoConnect: false,
}

// Add endpoint options with reliable RPC endpoints
export const endpointOptions = {
  isLazy: true,
  endpoints: {
    osmosis: {
      rpc: [
        'https://osmosis-rpc.quickapi.com',
        'https://rpc.osmosis.zone',
        'https://osmosis-rpc.polkachu.com',
      ],
      rest: [
        'https://osmosis-api.quickapi.com',
        'https://lcd.osmosis.zone',
        'https://osmosis-api.polkachu.com',
      ],
    },
    cosmoshub: {
      rpc: [
        'https://cosmos-rpc.quickapi.com',
        'https://rpc.cosmos.network',
        'https://cosmos-rpc.polkachu.com',
      ],
      rest: [
        'https://cosmos-api.quickapi.com',
        'https://api.cosmos.network',
        'https://cosmos-api.polkachu.com',
      ],
    },
    noble: {
      rpc: [
        'https://noble-rpc.polkachu.com',
        'https://rpc.noble.strange.love',
      ],
      rest: [
        'https://noble-api.polkachu.com',
        'https://api.noble.strange.love',
      ],
    },
    juno: {
      rpc: [
        'https://juno-rpc.polkachu.com',
        'https://rpc.juno.strange.love',
      ],
      rest: [
        'https://juno-api.polkachu.com',
        'https://api.juno.strange.love',
      ],
    },
    stargaze: {
      rpc: [
        'https://stargaze-rpc.polkachu.com',
        'https://rpc.stargaze-apis.com',
      ],
      rest: [
        'https://stargaze-api.polkachu.com',
        'https://api.stargaze-apis.com',
      ],
    },
  },
}