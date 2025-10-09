import React, { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { StatusBadge } from "@/core/components/ui/badge";
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/core/components/ui/avatar";
import { ChevronDownIcon, ChevronUpIcon, TagIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/core/utils";
import { Link } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

interface Brand {
  _id: string;
  name: string;
  status?: string;
  aboutTheBrand?: string;
  websiteUrl?: string;
  logoImage?: string;
  totalSKU?: number;
  averageSellingPrice?: number;
  brandType?: string[];
  marketingBudget?: number;
  sellingOn?: Array<{
    platform: string;
    url: string;
  }>;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  owner?: {
    ownerUser?: string;
    ownerPhone?: string;
    ownerEmail?: string;
    landlineNo?: string;
    ownerDesignation?: string;
  };
}

interface BrandDropdownProps {
  brands: Brand[];
  selectedBrandId?: string;
  onBrandSelect?: (brand: Brand | null) => void;
  maxBrands?: number;
  companyId: string;
  locationId: string;
}

export const BrandDropdown: React.FC<BrandDropdownProps> = ({
  brands,
  selectedBrandId,
  onBrandSelect,
  maxBrands = 3,
  companyId,
  locationId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(
    brands.find(brand => brand._id === selectedBrandId) || null
  );

  const handleBrandSelect = (brand: Brand | null) => {
    setSelectedBrand(brand);
    onBrandSelect?.(brand);
    setIsExpanded(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const displayBrands = brands.slice(0, maxBrands);

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            Brands
            <Badge variant="outline" className="ml-2">
              {brands.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outlined"
              size="sm"
              className="text-xs"
            >
              <Link to={PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId, locationId)}>
                View All
              </Link>
            </Button>
            <Button
              onClick={toggleExpanded}
              variant="outlined"
              size="sm"
              className="text-xs"
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-4">
          {brands.length === 0 ? (
            <div className="text-center py-8">
              <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No brands found</p>
              <Button
                asChild
                variant="outlined"
                size="sm"
                className="mt-2"
              >
                <Link to={PANEL_ROUTES.COMPANY_LOCATION.BRAND_CREATE(companyId, locationId)}>
                  Add Brand
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* All Brands Option */}
              <div
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                  !selectedBrand ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleBrandSelect(null)}
              >
                <div className="size-10 rounded-md border bg-gray-100 flex items-center justify-center">
                  <TagIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">All Brands</h4>
                  <p className="text-xs text-gray-600">Show products from all brands</p>
                </div>
              </div>

              {displayBrands.map((brand: Brand) => (
                <div
                  key={brand._id}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedBrand?._id === brand._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleBrandSelect(brand)}
                >
                  <AvatarRoot className="size-10 rounded-md border">
                    <AvatarImage
                      className="object-cover"
                      src={brand.logoImage}
                      alt={`${brand.name} logo`}
                    />
                    <AvatarFallback className="rounded-md capitalize">
                      {brand.name?.charAt(0)}
                    </AvatarFallback>
                  </AvatarRoot>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {brand.name}
                      </h4>
                      {brand.status && (
                        <StatusBadge
                          module="brand"
                          status={brand.status}
                          variant="badge"
                          className="text-xs"
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {brand.totalSKU && (
                        <span>SKU: {brand.totalSKU}</span>
                      )}
                      {brand.averageSellingPrice && (
                        <span>
                          Avg: {formatCurrency(brand.averageSellingPrice)}
                        </span>
                      )}
                    </div>
                    
                    {brand.brandType && brand.brandType.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {brand.brandType.slice(0, 2).map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {brand.brandType.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{brand.brandType.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    asChild
                    variant="outlined"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link to={PANEL_ROUTES.COMPANY_LOCATION.BRAND_VIEW(companyId, locationId, brand._id)}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
              
              {brands.length > maxBrands && (
                <div className="text-center pt-2">
                  <Button
                    asChild
                    variant="outlined"
                    size="sm"
                    className="text-xs"
                  >
                    <Link to={PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId, locationId)}>
                      View All Brands
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default BrandDropdown;
