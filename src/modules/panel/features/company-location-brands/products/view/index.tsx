import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { StatusBadge } from "@/core/components/ui/badge";
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/core/components/ui/avatar";
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
  brand?: string;
  aboutTheBrand?: string;
  productVariationType?: {
    _id: string;
    name: string;
  };
  productCategory?: Array<{
    _id: string;
    name: string;
  }>;
  tags?: Array<{
    _id: string;
    name: string;
  }>;
  ingredients?: Array<{
    _id: string;
    name: string;
  }>;
  keyIngredients?: Array<{
    _id: string;
    name: string;
  }>;
  skinTypes?: Array<{
    _id: string;
    name: string;
  }>;
  hairTypes?: Array<{
    _id: string;
    name: string;
  }>;
  skinConcerns?: Array<{
    _id: string;
    name: string;
  }>;
  hairConcerns?: Array<{
    _id: string;
    name: string;
  }>;
  hairGoals?: Array<{
    _id: string;
    name: string;
  }>;
  // API response fields
  conscious?: Array<{ name: string }>;
  claims?: Array<{ claim: string }>;
  countryOfOrigin?: string;
  productForm?: string;
  gender?: string;
  productType?: string;
  targetArea?: string;
  finish?: string;
  fragrance?: string;
  skinType?: Array<{ label: string }>;
  hairType?: Array<{ label: string }>;
  marketedBy?: { name: string; address?: string };
  manufacturedBy?: { name: string; address?: string };
  importedBy?: { name: string; address?: string };
  benefit?: Array<{
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
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isTrendingNow?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  metaData?: Array<{
    key: string;
    value: unknown;
    type: string;
    ref: boolean;
  }>;
  images?: string[];
  thumbnail?: {
    _id: string;
    url: string;
  };
  barcodeImage?: {
    _id: string;
    url: string;
  };
  capturedBy?: string;
  capturedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  // Additional fields for comprehensive view
  shelfLife?: string;
  licenseNo?: string;
  length?: number;
  width?: number;
  height?: number;
  safetyPrecaution?: string;
  howToUse?: string;
  customerCareEmail?: string;
  customerCareNumber?: string;
  ingredient?: string;
  benefitsSingle?: string;
}



interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

const ProductView: React.FC = () => {
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

  if (error || !(productData as ApiResponse<ProductDetail>)?.data) {
    return (
      <PageContent
        header={{
          title: "Product Details",
          description: "Error loading product information.",
        }}
      >
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-red-500 mb-4">Failed to load product details</p>
          <Button
            onClick={() => navigate(-1)}
              variant="outlined"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </PageContent>
    );
  }

  const product = (productData as ApiResponse<ProductDetail>).data;

  return (
    <PageContent
      header={{
        title: product.productName,
        description: `Viewing product details for ${product.productName}`,
        actions: (
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(-1)}
              variant="outlined"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => navigate(
                PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_EDIT()
                  .replace(":companyId", companyId!)
                  .replace(":locationId", locationId!)
                  .replace(":brandId", "brand")
                  .replace(":productId", productId!)
              )}
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Product
            </Button>
          </div>
        ),
      }}
    >
      <div className="w-full">
        <div className="bg-background rounded-xl border p-8 shadow-sm">
          <div className="space-y-8">
        {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="product-name" className="text-sm font-medium text-gray-700">Product Name</label>
                  <p id="product-name" className="text-sm">{product.productName}</p>
              </div>
                <div className="space-y-2">
                  <label htmlFor="product-sku" className="text-sm font-medium text-gray-700">SKU</label>
                  <p id="product-sku" className="text-sm">{product.sku || "N/A"}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="product-description" className="text-sm font-medium text-gray-700">Description</label>
                <div id="product-description" className="text-sm" dangerouslySetInnerHTML={{ __html: product.description || "No description provided" }} />
              </div>

              <div className="space-y-2">
                <label htmlFor="product-brand-info" className="text-sm font-medium text-gray-700">About the Brand</label>
                <p id="product-brand-info" className="text-sm">{product.aboutTheBrand || "No brand information provided"}</p>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                Pricing & Inventory
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="product-price" className="text-sm font-medium text-gray-700">Price</label>
                  <p id="product-price" className="text-sm font-semibold">{formatCurrency(product.price)}</p>
              </div>
                <div className="space-y-2">
                  <label htmlFor="product-sale-price" className="text-sm font-medium text-gray-700">Sale Price</label>
                  <p id="product-sale-price" className="text-sm font-semibold text-green-600">
                    {product.salePrice ? formatCurrency(product.salePrice) : "N/A"}
                  </p>
              </div>
                <div className="space-y-2">
                  <label htmlFor="product-quantity" className="text-sm font-medium text-gray-700">Quantity</label>
                  <p id="product-quantity" className="text-sm">{product.quantity}</p>
              </div>
              </div>
            </div>
            
            {/* Product Details */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                Product Details
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="product-brand" className="text-sm font-medium text-gray-700">Brand</label>
                  <p id="product-brand" className="text-sm">{product.brand || "N/A"}</p>
            </div>
                <div className="space-y-2">
                  <label htmlFor="product-type" className="text-sm font-medium text-gray-700">Product Type</label>
                  <p id="product-type" className="text-sm">{product.productType || "N/A"}</p>
            </div>
                <div className="space-y-2">
                  <label htmlFor="product-category" className="text-sm font-medium text-gray-700">Category</label>
                  <div id="product-category" className="flex flex-wrap gap-2">
                    {product.productCategory?.map((category, index) => (
                      <Badge key={index} variant="secondary">
                    {category.name}
                  </Badge>
                )) || <span className="text-sm text-gray-500">No categories</span>}
              </div>
            </div>
                <div className="space-y-2">
                  <label htmlFor="product-tags" className="text-sm font-medium text-gray-700">Tags</label>
                  <div id="product-tags" className="flex flex-wrap gap-2">
                    {product.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline">
                    {tag.name}
                  </Badge>
                )) || <span className="text-sm text-gray-500">No tags</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="product-status" className="text-sm font-medium text-gray-700">Status</label>
                  <div id="product-status" className="mt-1">
                    <StatusBadge status={product.status || "active"} module="product" />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                Company Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="product-marketed-by" className="text-sm font-medium text-gray-700">Marketed By</label>
                  <p id="product-marketed-by" className="text-sm">{product.marketedBy?.name || "N/A"}</p>
                  {product.marketedBy?.address && (
                    <p className="text-xs text-gray-500">{product.marketedBy.address}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="product-manufactured-by" className="text-sm font-medium text-gray-700">Manufactured By</label>
                  <p id="product-manufactured-by" className="text-sm">{product.manufacturedBy?.name || "N/A"}</p>
                  {product.manufacturedBy?.address && (
                    <p className="text-xs text-gray-500">{product.manufacturedBy.address}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="product-imported-by" className="text-sm font-medium text-gray-700">Imported By</label>
                  <p id="product-imported-by" className="text-sm">{product.importedBy?.name || "N/A"}</p>
                  {product.importedBy?.address && (
                    <p className="text-xs text-gray-500">{product.importedBy.address}</p>
                  )}
                </div>
              </div>
            </div>

        {/* Product Attributes */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                Product Attributes
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="target-concerns" className="text-sm font-medium text-gray-700">Target Concerns</label>
                  <div id="target-concerns" className="flex flex-wrap gap-1">
                    {product.conscious?.map((concern, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {concern.name}
                      </Badge>
                    )) || <span className="text-sm text-gray-500">No target concerns</span>}
                  </div>
                </div>
              
                <div className="space-y-2">
                  <label htmlFor="product-features" className="text-sm font-medium text-gray-700">Product Features</label>
                  <div id="product-features" className="flex flex-wrap gap-1">
                    {product.claims?.map((claim, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {claim.claim}
                      </Badge>
                    )) || <span className="text-sm text-gray-500">No features</span>}
                  </div>
                </div>
              
                <div className="space-y-2">
                  <label htmlFor="country-of-origin" className="text-sm font-medium text-gray-700">Country of Origin</label>
                  <p id="country-of-origin" className="text-sm">{product.countryOfOrigin || "N/A"}</p>
                </div>
              
                <div className="space-y-2">
                  <label htmlFor="benefits" className="text-sm font-medium text-gray-700">Benefits</label>
                  <div id="benefits" className="flex flex-wrap gap-1">
                    {product.conscious?.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {benefit.name}
                      </Badge>
                    )) || <span className="text-sm text-gray-500">No benefits</span>}
                  </div>
                </div>
              
                <div className="space-y-2">
                  <label htmlFor="certifications" className="text-sm font-medium text-gray-700">Certifications</label>
                  <div id="certifications" className="flex flex-wrap gap-1">
                    <span className="text-sm text-gray-500">No certifications</span>
                  </div>
                </div>
              
                <div className="space-y-2">
                  <label htmlFor="product-form" className="text-sm font-medium text-gray-700">Product Form</label>
                  <p id="product-form" className="text-sm">{product.productForm || "N/A"}</p>
                </div>
              
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender</label>
                  <p id="gender" className="text-sm">{product.gender || "N/A"}</p>
                </div>
              
                <div className="space-y-2">
                  <label htmlFor="target-area" className="text-sm font-medium text-gray-700">Target Area</label>
                  <p id="target-area" className="text-sm">{product.targetArea || "N/A"}</p>
                </div>
              
                <div className="space-y-2">
                  <label htmlFor="finish" className="text-sm font-medium text-gray-700">Finish</label>
                  <p id="finish" className="text-sm">{product.finish || "N/A"}</p>
                </div>
              
                <div className="space-y-2">
                  <label htmlFor="fragrance" className="text-sm font-medium text-gray-700">Fragrance</label>
                  <p id="fragrance" className="text-sm">{product.fragrance || "N/A"}</p>
                </div>
              
                <div className="space-y-2">
                  <label htmlFor="skin-type" className="text-sm font-medium text-gray-700">Skin Type</label>
                  <div id="skin-type" className="flex flex-wrap gap-1">
                    {product.skinType?.map((type, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {type.label}
                      </Badge>
                    )) || <span className="text-sm text-gray-500">No skin type</span>}
                  </div>
                </div>
              
                <div className="space-y-2">
                  <label htmlFor="hair-type" className="text-sm font-medium text-gray-700">Hair Type</label>
                  <div id="hair-type" className="flex flex-wrap gap-1">
                    {product.hairType?.map((type, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {type.label}
                      </Badge>
                    )) || <span className="text-sm text-gray-500">No hair type</span>}
                  </div>
                </div>
              </div>
            </div>

        {/* Ingredients and Benefits */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                Ingredients & Benefits
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="ingredients" className="text-sm font-medium text-gray-700">Ingredients</label>
                  <div id="ingredients" className="flex flex-wrap gap-2">
                {product.ingredients?.map((ingredient, index) => (
                  <Badge key={index} variant="outline">
                    {ingredient.name}
                  </Badge>
                )) || <span className="text-sm text-gray-500">No ingredients listed</span>}
              </div>
            </div>
            
                <div className="space-y-2">
                  <label htmlFor="key-ingredients" className="text-sm font-medium text-gray-700">Key Ingredients</label>
                  <div id="key-ingredients" className="flex flex-wrap gap-2">
                {product.keyIngredients?.map((ingredient, index) => (
                  <Badge key={index} variant="secondary">
                    {ingredient.name}
                  </Badge>
                )) || <span className="text-sm text-gray-500">No key ingredients listed</span>}
              </div>
            </div>
              </div>
            </div>

        {/* Physical Properties */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                Physical Properties
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="weight" className="text-sm font-medium text-gray-700">Weight</label>
                  <p id="weight" className="text-sm">{product.weight || "N/A"}</p>
              </div>
                <div className="space-y-2">
                  <label htmlFor="dimensions" className="text-sm font-medium text-gray-700">Dimensions</label>
                  <p id="dimensions" className="text-sm">{product.dimensions || "N/A"}</p>
              </div>
                <div className="space-y-2">
                  <label htmlFor="shelf-life" className="text-sm font-medium text-gray-700">Shelf Life</label>
                  <p id="shelf-life" className="text-sm">{product.shelfLife || "N/A"}</p>
              </div>
                <div className="space-y-2">
                  <label htmlFor="license-number" className="text-sm font-medium text-gray-700">License Number</label>
                  <p id="license-number" className="text-sm">{product.licenseNo || "N/A"}</p>
              </div>
                <div className="space-y-2">
                  <label htmlFor="manufacturing-date" className="text-sm font-medium text-gray-700">Manufacturing Date</label>
                  <p id="manufacturing-date" className="text-sm">
                  {product.manufacturingDate ? formatDate(product.manufacturingDate) : "N/A"}
                </p>
              </div>
                <div className="space-y-2">
                  <label htmlFor="expiry-date" className="text-sm font-medium text-gray-700">Expiry Date</label>
                  <p id="expiry-date" className="text-sm">
                  {product.expiryDate ? formatDate(product.expiryDate) : "N/A"}
                </p>
              </div>
              </div>
            </div>

        {/* Product Flags */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                Product Flags
              </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                    id="is-featured"
                  checked={product.isFeatured || false}
                  disabled
                  className="rounded"
                />
                  <label htmlFor="is-featured" className="text-sm">Featured</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                    id="is-new-arrival"
                  checked={product.isNewArrival || false}
                  disabled
                  className="rounded"
                />
                  <label htmlFor="is-new-arrival" className="text-sm">New Arrival</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                    id="is-best-seller"
                  checked={product.isBestSeller || false}
                  disabled
                  className="rounded"
                />
                  <label htmlFor="is-best-seller" className="text-sm">Best Seller</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                    id="is-trending-now"
                  checked={product.isTrendingNow || false}
                  disabled
                  className="rounded"
                />
                  <label htmlFor="is-trending-now" className="text-sm">Trending Now</label>
                </div>
              </div>
            </div>

        {/* SEO Information */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                SEO Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="meta-title" className="text-sm font-medium text-gray-700">Meta Title</label>
                  <p id="meta-title" className="text-sm">{product.metaTitle || "N/A"}</p>
            </div>
                <div className="space-y-2">
                  <label htmlFor="meta-description" className="text-sm font-medium text-gray-700">Meta Description</label>
                  <p id="meta-description" className="text-sm">{product.metaDescription || "N/A"}</p>
            </div>
                <div className="space-y-2">
                  <label htmlFor="meta-keywords" className="text-sm font-medium text-gray-700">Meta Keywords</label>
                  <div id="meta-keywords" className="flex flex-wrap gap-2">
                {product.metaKeywords?.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                )) || <span className="text-sm text-gray-500">No keywords</span>}
              </div>
            </div>
              </div>
            </div>

        {/* Media */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                Media
              </h3>
              <div className="space-y-4">
            {product.thumbnail && (
                  <div className="space-y-2">
                    <label htmlFor="thumbnail" className="text-sm font-medium text-gray-700">Thumbnail</label>
                    <div id="thumbnail">
                  <AvatarRoot className="w-20 h-20">
                    <AvatarImage src={product.thumbnail.url} alt="Thumbnail" />
                    <AvatarFallback>IMG</AvatarFallback>
                  </AvatarRoot>
                </div>
              </div>
            )}
            
            {product.images && product.images.length > 0 && (
                  <div className="space-y-2">
                    <label htmlFor="product-images" className="text-sm font-medium text-gray-700">Product Images</label>
                    <div id="product-images" className="flex flex-wrap gap-2">
                  {product.images.map((image, index) => (
                    <AvatarRoot key={index} className="w-16 h-16">
                      <AvatarImage src={image} alt={`Product image ${index + 1}`} />
                      <AvatarFallback>IMG</AvatarFallback>
                    </AvatarRoot>
                  ))}
                </div>
              </div>
            )}
              </div>
            </div>

        {/* Status Feedback */}
        {product.status_feedback && (
              <div className="space-y-4">
                <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                  Status Feedback
                </h3>
              <p className="text-sm">{product.status_feedback}</p>
              </div>
        )}
          </div>
        </div>
      </div>
    </PageContent>
  );
};

export default ProductView;