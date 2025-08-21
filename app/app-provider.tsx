'use client'

import { createContext, Dispatch, SetStateAction, useContext, useState, ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChainProvider } from '@cosmos-kit/react'
import { wagmiAdapter } from '@/lib/web3-config'
import { 
  cosmosChains, 
  cosmosAssets, 
  cosmosWallets, 
  walletConnectOptions,
  endpointOptions 
} from '@/lib/cosmos-config'

interface ContextProps {
  sidebarOpen: boolean
  setSidebarOpen: Dispatch<SetStateAction<boolean>>
}

const AppContext = createContext<ContextProps>({
  sidebarOpen: false,
  setSidebarOpen: (): boolean => false
})

// Create QueryClient outside component to avoid recreation
const queryClient = new QueryClient()

export default function AppProvider({
  children,
}: {
  children: React.ReactNode
}) {  
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  
  return (
    <QueryClientProvider client={queryClient}>
      <ChainProvider
        chains={cosmosChains}
        assetLists={cosmosAssets}
        wallets={cosmosWallets}
        walletConnectOptions={walletConnectOptions}
        endpointOptions={endpointOptions}
        modalOptions={{
          // Removed invalid property
        }}
        throwErrors={false}
      >
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <AppContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
            {children}
          </AppContext.Provider>
        </WagmiProvider>
      </ChainProvider>
    </QueryClientProvider>
  )
}

export const useAppProvider = () => useContext(AppContext)