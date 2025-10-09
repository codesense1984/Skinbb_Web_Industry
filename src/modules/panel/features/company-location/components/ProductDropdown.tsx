import React, { useState, useEffect } from "react";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { StatusBadge } from "@/core/components/ui/badge";
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/core/components/ui/avatar";
import { ChevronDownIcon, ChevronUpIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { apiGetCompanyLocationProducts } from "@/modules/panel/services/http/company.service";
import { formatCurrency } from "@/core/utils";
import { Link } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

interface Product {
  _id: string;
  productName: string;
  thumbnail?: {
    url: string;
  };
  brand?: {
    name: string;
  };
  productCategory?: Array<{ name: string }>;
  status: string;
  priceRange?: {
    min: number;
    max: number;
  };
  variants?: Array<any>;
  createdAt: string;
}

interface ProductDropdownProps {
  companyId: string;
  locationId: string;
  onProductSelect?: (product: Product) => void;
  maxProducts?: number;
}

export const ProductDropdown: React.FC<ProductDropdownProps> = ({
  companyId,
  locationId,
  onProductSelect,
  maxProducts = 5,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch products for the company location
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ["company-location-products", companyId, locationId],
    queryFn: () => apiGetCompanyLocationProducts(companyId, locationId, {
      page: 1,
      limit: maxProducts,
    }),
    enabled: !!companyId && !!locationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const products = productsData?.data?.items || [];

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    onProductSelect?.(product);
    setIsExpanded(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBagIcon className="h-5 w-5" />
            Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading products...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !productsData) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBagIcon className="h-5 w-5" />
            Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-red-600">Failed to load products</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBagIcon className="h-5 w-5" />
            Products
            <Badge variant="outline" className="ml-2">
              {products.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outlined"
              size="sm"
              className="text-xs"
            >
              <Link to={PANEL_ROUTES.COMPANY_LOCATION.PRODUCTS(companyId, locationId)}>
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
          {products.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No products found</p>
              <Button
                asChild
                variant="outlined"
                size="sm"
                className="mt-2"
              >
                <Link to={PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_CREATE(companyId, locationId)}>
                  Add Product
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product: Product) => (
                <div
                  key={product._id}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedProduct?._id === product._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleProductSelect(product)}
                >
                  <AvatarRoot className="size-10 rounded-md border">
                    <AvatarImage
                      className="object-cover"
                      src={product.thumbnail?.url}
                      alt={`${product.productName} thumbnail`}
                    />
                    <AvatarFallback className="rounded-md capitalize">
                      {product.productName?.charAt(0)}
                    </AvatarFallback>
                  </AvatarRoot>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {product.productName}
                      </h4>
                      <StatusBadge
                        module="product"
                        status={product.status}
                        variant="badge"
                        className="text-xs"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {product.brand && (
                        <span>Brand: {product.brand.name}</span>
                      )}
                      {product.priceRange && (
                        <span>
                          Price: {formatCurrency(product.priceRange.min)}
                          {product.priceRange.min !== product.priceRange.max && 
                            ` - ${formatCurrency(product.priceRange.max)}`
                          }
                        </span>
                      )}
                    </div>
                    
                    {product.productCategory && product.productCategory.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.productCategory.slice(0, 2).map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {category.name}
                          </Badge>
                        ))}
                        {product.productCategory.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{product.productCategory.length - 2} more
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
                    <Link to={PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_VIEW(companyId, locationId, product._id)}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
              
              {products.length >= maxProducts && (
                <div className="text-center pt-2">
                  <Button
                    asChild
                    variant="outlined"
                    size="sm"
                    className="text-xs"
                  >
                    <Link to={PANEL_ROUTES.COMPANY_LOCATION.PRODUCTS(companyId, locationId)}>
                      View All Products
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

export default ProductDropdown;
