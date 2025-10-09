import React from "react";
import { useParams, useNavigate } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { StatusBadge } from "@/core/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { formatDate, formatCurrency } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { useQuery } from "@tanstack/react-query";
import { apiGetCompanyLocationProductById } from "@/modules/panel/services/http/company.service";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/solid";
import { 
  CalendarIcon, 
  TagIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  CubeIcon
} from "@heroicons/react/24/outline";

const CompanyLocationProductView: React.FC = () => {
  const { companyId, locationId, productId } = useParams<{
    companyId: string;
    locationId: string;
    productId: string;
  }>();
  const navigate = useNavigate();

  // Fetch product data using the correct API
  const { data: productData, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ["company-location-product", companyId, locationId, productId],
    queryFn: () => apiGetCompanyLocationProductById(companyId!, locationId!, productId!),
    enabled: !!companyId && !!locationId && !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If no productId, redirect to products list
  if (!productId) {
    navigate(PANEL_ROUTES.COMPANY_LOCATION.PRODUCTS(companyId!, locationId!));
    return null;
  }

  if (!companyId || !locationId) {
    return (
      <PageContent
        header={{
          title: "Product Details",
          description: "Company ID and Location ID are required to view product details.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid company or location ID provided.</p>
        </div>
      </PageContent>
    );
  }

  if (productLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading product information...</p>
        </div>
      </div>
    );
  }

  if (productError || !productData?.data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="font-medium text-red-600">
            Failed to load product information
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Please try refreshing the page or contact support.
          </p>
        </div>
      </div>
    );
  }

  const product = productData.data;

  return (
    <PageContent
      header={{
        title: "Product Details",
        description: `View details for ${product.productName || "Unknown Product"}`,
        actions: (
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(PANEL_ROUTES.COMPANY_LOCATION.PRODUCTS(companyId, locationId))}
              variant="outlined"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
            <Button
              onClick={() => navigate(PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_EDIT(companyId, locationId, productId))}
              variant="outlined"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit Product
            </Button>
          </div>
        ),
      }}
    >
      <div className="space-y-6">
        {/* Product Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              {product.thumbnail && (
                <div className="flex-shrink-0">
                  <img
                    src={product.thumbnail.url}
                    alt={`${product.productName} thumbnail`}
                    className="h-20 w-20 rounded-lg border object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="text-foreground text-2xl font-bold">
                    {product.productName}
                  </h1>
                  <StatusBadge
                    module="product"
                    variant="contained"
                    status={product.status}
                  />
                </div>
                {product.brand && (
                  <p className="mt-2 text-sm text-gray-600">
                    Brand: {product.brand.name}
                  </p>
                )}
                {product.productCategory && product.productCategory.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.productCategory.map((category, index) => (
                      <span
                        key={index}
                        className="rounded bg-gray-100 px-2 py-1 text-xs"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Information */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-2">
                  <TagIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Product Name</p>
                  <p className="text-gray-900 font-medium">
                    {product.productName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-2">
                  <TagIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Brand</p>
                  <p className="text-gray-900 font-medium">
                    {product.brand?.name || "Unknown"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-2">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Price Range</p>
                  <p className="text-gray-900 font-medium">
                    {product.priceRange ? 
                      `${formatCurrency(product.priceRange.min)} - ${formatCurrency(product.priceRange.max)}` : 
                      "Not set"
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-2">
                  <CubeIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Variants</p>
                  <p className="text-gray-900 font-medium">
                    {product.variants?.length || 0} variant{(product.variants?.length || 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-2">
                  <CalendarIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Created At</p>
                  <p className="text-gray-900 font-medium">
                    {product.createdAt ? formatDate(product.createdAt) : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-2">
                  <TagIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Status</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {product.status}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </PageContent>
  );
};

export default CompanyLocationProductView;
