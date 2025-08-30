'use client'

import BarChart01 from '@/components/charts/bar-chart-01'

// Import utilities
import { tailwindConfig } from '@/components/utils/utils'

export default function DashboardCard04() {

  const chartData = {
    labels: [
      '12-01-2022', '01-01-2023', '02-01-2023',
      '03-01-2023', '04-01-2023', '05-01-2023',
    ],
    datasets: [
      // Light blue bars
      {
        label: 'Staked',
        data: [
          16000, 13000, 10000, 12000, 11000, 9000,
        ],
        backgroundColor: tailwindConfig.theme.colors.sky[500],
        hoverBackgroundColor: tailwindConfig.theme.colors.sky[600],
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      // Blue bars
      {
        label: 'Liquid Staked',
        data: [
          2500, 2600, 2700, 3000, 3200, 3600,
        ],
        backgroundColor: tailwindConfig.theme.colors.violet[500],
        hoverBackgroundColor: tailwindConfig.theme.colors.violet[600],
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
       // Green bars
       {
        label: 'Stablecoins',
        data: [
          100, 400, 700, 1000, 1500, 2000,
        ],
        backgroundColor: tailwindConfig.theme.colors.green[500],
        hoverBackgroundColor: tailwindConfig.theme.colors.green[600],
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
    ],
  }

  return(
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Direct VS Indirect</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <BarChart01 data={chartData} width={595} height={248} />
    </div>
  )
}
