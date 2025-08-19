'use client'

import { createContext, Dispatch, SetStateAction, useContext, useState, ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiAdapter } from '@/lib/web3-config'

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
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
          {children}
        </AppContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export const useAppProvider = () => useContext(AppContext)