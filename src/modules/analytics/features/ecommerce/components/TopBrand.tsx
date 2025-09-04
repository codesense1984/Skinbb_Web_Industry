import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { formatNumber } from '@/core/utils'
import { BuildingStorefrontIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { PANEL_ROUTES } from '../../../../panel/routes/constant'
import { getImageUrl } from '../services'
import type { TopBrandData } from '../types'

interface TopBrandProps {
  data: TopBrandData[]
}

const TopBrand: React.FC<TopBrandProps> = ({ data }) => {
  const navigate = useNavigate()
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index))
  }

  const handleViewAll = () => {
    navigate(PANEL_ROUTES.BRAND.LIST)
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BuildingStorefrontIcon className="h-5 w-5" />
            Top Brands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No brand data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BuildingStorefrontIcon className="h-5 w-5" />
            Top Brands
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
          {data.map((brand, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50/50 transition-colors">
              <div className="flex-shrink-0">
                {imageErrors.has(index) ? (
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
                  </div>
                ) : (
                  <img
                    src={getImageUrl(brand.brandImage)}
                    alt={brand.brandName}
                    className="h-12 w-12 rounded-lg object-cover"
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {brand.brandName}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Brand #{index + 1}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <BuildingStorefrontIcon className="h-3 w-3" />
                  {formatNumber(brand.quantityOrdered)} ordered
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TopBrand
