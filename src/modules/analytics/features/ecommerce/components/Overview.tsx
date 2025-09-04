import React from 'react'
import { StatCard } from '@/core/components/ui/stat'
import { formatCurrency, formatNumber } from '@/core/utils'
import { ShoppingBagIcon, CurrencyDollarIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { SalesAnalyticsData } from '../types'

interface OverviewProps {
  data?: SalesAnalyticsData
}

const Overview: React.FC<OverviewProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={data ? formatCurrency(data.totalSales) : '₹0'}
          barColor="bg-green-500"
          className="relative"
          icon={
            <CurrencyDollarIcon className="absolute right-3 h-6 w-6 text-green-500" />
          }
        />
        
        <StatCard
          title="Total Orders"
          value={data ? formatNumber(data.orders) : '0'}
          barColor="bg-blue-500"
          className="relative"
          icon={
            <ShoppingBagIcon className="absolute right-3 h-6 w-6 text-blue-500" />
          }
        />
        
        <StatCard
          title="Average Order Value"
          value={data ? formatCurrency(data.avgOrderValue) : '₹0'}
          barColor="bg-purple-500"
          className="relative"
          icon={
            <CurrencyDollarIcon className="absolute right-3 h-6 w-6 text-purple-500" />
          }
        />
        
        <StatCard
          title="Cancellations"
          value={data ? formatNumber(data.cancellations) : '0'}
          barColor="bg-red-500"
          className="relative"
          icon={
            <XMarkIcon className="absolute right-3 h-6 w-6 text-red-500" />
          }
        />
      </div>
    </div>
  )
}

export default Overview
