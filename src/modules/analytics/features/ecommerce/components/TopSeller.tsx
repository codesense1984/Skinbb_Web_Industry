import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { formatCurrency } from '@/core/utils'
import { UserIcon } from '@heroicons/react/24/outline'
import { getImageUrl } from '../services'
import type { TopSellerData } from '../types'

interface TopSellerProps {
  data: TopSellerData[]
}

const TopSeller: React.FC<TopSellerProps> = ({ data }) => {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index))
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Top Sellers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No seller data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Top Sellers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((seller, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50/50 transition-colors">
              <div className="flex-shrink-0">
                {imageErrors.has(index) ? (
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  </div>
                ) : (
                  <img
                    src={getImageUrl(seller.sellerImage)}
                    alt={seller.sellerName}
                    className="h-12 w-12 rounded-lg object-cover"
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {seller.sellerName}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Seller #{index + 1}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  {formatCurrency(seller.totalSales)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TopSeller
