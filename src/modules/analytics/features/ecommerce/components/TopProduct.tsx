import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { formatNumber } from '@/core/utils'
import { ShoppingBagIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { PANEL_ROUTES } from '../../../../panel/routes/constant'
import { getImageUrl } from '../services'
import type { TopProductData } from '../types'

interface TopProductProps {
  data: TopProductData[]
}

const TopProduct: React.FC<TopProductProps> = ({ data }) => {
  const navigate = useNavigate()
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index))
  }

  const handleViewAll = () => {
    navigate(PANEL_ROUTES.LISTING.LIST)
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBagIcon className="h-5 w-5" />
            Top Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No product data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBagIcon className="h-5 w-5" />
            Top Products
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="text-primary hover:text-primary/80"
          >
            View All
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((product, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50/50 transition-colors">
              <div className="flex-shrink-0">
                {imageErrors.has(index) ? (
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                  </div>
                ) : (
                  <img
                    src={getImageUrl(product.productImage)}
                    alt={product.productName}
                    className="h-12 w-12 rounded-lg object-cover"
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {product.productName}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Product #{index + 1}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShoppingBagIcon className="h-3 w-3" />
                  {formatNumber(product.totalOrders)} orders
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TopProduct
