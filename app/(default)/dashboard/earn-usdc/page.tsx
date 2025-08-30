export const metadata = {
  title: 'Earn USDC - Pay USDC',
  description: 'Interact with DeFi liquidity pools to earn USDC',
}

import Datepicker from '@/components/datepicker'
import EvmPoolLayout from './evm-pool-layout'
import EvmPoolInteraction from './evm-pool-interaction'

export default function EvmPools() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">

      {/* Page header - Simplified */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Earn USDC</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Provide liquidity to DeFi pools and earn rewards
        </p>
      </div>

      {/* Pool Table - Full Width */}
      <EvmPoolLayout />

    </div>
  )
}