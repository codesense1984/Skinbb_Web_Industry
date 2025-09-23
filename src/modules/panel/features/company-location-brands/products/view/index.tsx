import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { StatusBadge } from "@/core/components/ui/badge";
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/core/components/ui/avatar";
import { Separator } from "@/core/components/ui/separator";
import { formatCurrency, formatDate } from "@/core/utils";
import { apiGetProductDetail } from "@/modules/panel/services/http/product.service";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/solid";
import { FullLoader } from "@/core/components/ui/loader";

interface ProductDetail {
  _id: string;
  productName: string;
  slug: string;
  sku: string;
  description: string;
  status: string;
  status_feedback?: string;
  brand: {
    _id: string;
    name: string;
  };
  aboutTheBrand?: string;
  productVariationType: {
    _id: string;
    name: string;
  };
  productCategory: Array<{
    _id: string;
    name: string;
  }>;
  tags: Array<{
    _id: string;
    name: string;
  }>;
  ingredients: Array<{
    _id: string;
    name: string;
  }>;
  keyIngredients: Array<{
    _id: string;
    name: string;
  }>;
  skinTypes: Array<{
    _id: string;
    name: string;
  }>;
  hairTypes: Array<{
    _id: string;
    name: string;
  }>;
  skinConcerns: Array<{
    _id: string;
    name: string;
  }>;
  hairConcerns: Array<{
    _id: string;
    name: string;
  }>;
  hairGoals: Array<{
    _id: string;
    name: string;
  }>;
  productType: string;
  marketedBy: {
    _id: string;
    name: string;
  };
  marketedByAddress?: string;
  manufacturedBy: {
    _id: string;
    name: string;
  };
  manufacturedByAddress?: string;
  importedBy: {
    _id: string;
    name: string;
  };
  importedByAddress?: string;
  benefit: Array<{
    _id: string;
    name: string;
  }>;
  price: number;
  salePrice?: number;
  quantity: number;
  weight?: string;
  dimensions?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrendingNow: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  metaData?: Array<{
    key: string;
    value: string | string[];
    type: string;
    ref: boolean;
  }>;
  images: Array<{
    _id: string;
    url: string;
  }>;
  thumbnail?: {
    _id: string;
    url: string;
  };
  barcodeImage?: {
    _id: string;
    url: string;
  };
  attributes?: Array<{
    attributeId: string;
    attributeValueId: string[];
  }>;
  variants?: Array<{
    _id: string;
    sku: string;
    isPrimary: boolean;
    images: Array<{
      _id: string;
      url: string;
    }>;
    price: number;
    salePrice?: number;
    quantity: number;
    options: Array<{
      attributeId: string;
      attributeValueId: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

const ProductDetailView: React.FC = () => {
  const { companyId, locationId, productId } = useParams<{
    companyId: string;
    locationId: string;
    productId: string;
  }>();
  const navigate = useNavigate();

  const { data: productData, isLoading, error } = useQuery({
    queryKey: ["product-detail", productId],
    queryFn: () => apiGetProductDetail(productId!),
    enabled: !!productId,
  });

  if (!companyId || !locationId || !productId) {
    return (
      <PageContent
        header={{
          title: "Product Details",
          description: "Company ID, Location ID, and Product ID are required to view product details.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid product ID provided.</p>
        </div>
      </PageContent>
    );
  }

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "Product Details",
          description: "Loading product information...",
        }}
      >
        <div className="flex justify-center py-8">
          <FullLoader />
        </div>
      </PageContent>
    );
  }

  if (error || !productData?.data) {
    return (
      <PageContent
        header={{
          title: "Product Details",
          description: "Error loading product information.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-red-500">
            {error?.message || "Failed to load product details."}
          </p>
        </div>
      </PageContent>
    );
  }

  const product: ProductDetail = productData.data;

  return (
    <PageContent
      header={{
        title: product.productName,
        description: `SKU: ${product.sku} | ${product.brand?.name || "Unknown Brand"}`,
        actions: (
          <div className="flex gap-2">
            <Button
              asChild
              variant="outlined"
              className="border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            >
              <button
                onClick={() =>
                  navigate(
                    PANEL_ROUTES.COMPANY_LOCATION.BRAND_PRODUCTS(
                      companyId,
                      locationId,
                      product.brand._id
                    )
                  )
                }
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Products
              </button>
            </Button>
            <Button color="primary" asChild>
              <button
                onClick={() =>
                  navigate(
                    PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_EDIT(
                      companyId,
                      locationId,
                      productId
                    )
                  )
                }
              >
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit Product
              </button>
            </Button>
          </div>
        ),
      }}
    >
      <div className="grid gap-6">
        {/* Product Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Product Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <AvatarRoot className="size-20 rounded-lg border">
                <AvatarImage
                  className="object-cover"
                  src={product.thumbnail?.url}
                  alt={`${product.productName} thumbnail`}
                />
                <AvatarFallback className="rounded-lg text-lg">
                  {product.productName?.charAt(0)}
                </AvatarFallback>
              </AvatarRoot>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{product.productName}</h2>
                  <StatusBadge module="product" status={product.status} variant="badge" />
                </div>
                <p className="text-muted-foreground">{product.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium">SKU:</span>
                  <span>{product.sku}</span>
                  <span className="font-medium">Brand:</span>
                  <span>{product.brand?.name}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing and Inventory */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">{formatCurrency(product.price)}</span>
              </div>
              {product.salePrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sale Price:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(product.salePrice)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-medium">{product.quantity}</span>
              </div>
              {product.weight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="font-medium">{product.weight}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="font-medium">{product.dimensions}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Featured:</span>
                <Badge variant={product.isFeatured ? "default" : "outline"}>
                  {product.isFeatured ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New Arrival:</span>
                <Badge variant={product.isNewArrival ? "default" : "outline"}>
                  {product.isNewArrival ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Best Seller:</span>
                <Badge variant={product.isBestSeller ? "default" : "outline"}>
                  {product.isBestSeller ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trending Now:</span>
                <Badge variant={product.isTrendingNow ? "default" : "outline"}>
                  {product.isTrendingNow ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories and Tags */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {product.productCategory?.map((category) => (
                  <Badge key={category._id} variant="outline">
                    {category.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {product.tags?.map((tag) => (
                  <Badge key={tag._id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ingredients and Benefits */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Key Ingredients:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {product.keyIngredients?.map((ingredient) => (
                    <Badge key={ingredient._id} variant="outline" className="text-xs">
                      {ingredient.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  All Ingredients:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {product.ingredients?.map((ingredient) => (
                    <Badge key={ingredient._id} variant="secondary" className="text-xs">
                      {ingredient.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {product.benefit?.map((benefit) => (
                  <Badge key={benefit._id} variant="default">
                    {benefit.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skin/Hair Types and Concerns */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Skin Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Skin Types:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {product.skinTypes?.map((type) => (
                    <Badge key={type._id} variant="outline" className="text-xs">
                      {type.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Skin Concerns:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {product.skinConcerns?.map((concern) => (
                    <Badge key={concern._id} variant="secondary" className="text-xs">
                      {concern.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hair Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Hair Types:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {product.hairTypes?.map((type) => (
                    <Badge key={type._id} variant="outline" className="text-xs">
                      {type.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Hair Concerns:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {product.hairConcerns?.map((concern) => (
                    <Badge key={concern._id} variant="secondary" className="text-xs">
                      {concern.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Hair Goals:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {product.hairGoals?.map((goal) => (
                    <Badge key={goal._id} variant="default" className="text-xs">
                      {goal.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Marketed By:
                </h4>
                <p className="text-sm">{product.marketedBy?.name}</p>
                {product.marketedByAddress && (
                  <p className="text-xs text-muted-foreground">
                    {product.marketedByAddress}
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Manufactured By:
                </h4>
                <p className="text-sm">{product.manufacturedBy?.name}</p>
                {product.manufacturedByAddress && (
                  <p className="text-xs text-muted-foreground">
                    {product.manufacturedByAddress}
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Imported By:
                </h4>
                <p className="text-sm">{product.importedBy?.name}</p>
                {product.importedByAddress && (
                  <p className="text-xs text-muted-foreground">
                    {product.importedByAddress}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates and Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {product.manufacturingDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Manufacturing Date:</span>
                  <span className="font-medium">{formatDate(product.manufacturingDate)}</span>
                </div>
              )}
              {product.expiryDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expiry Date:</span>
                  <span className="font-medium">{formatDate(product.expiryDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{formatDate(product.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">{formatDate(product.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Feedback */}
        {product.status_feedback && (
          <Card>
            <CardHeader>
              <CardTitle>Status Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{product.status_feedback}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContent>
  );
};

export default ProductDetailView;
