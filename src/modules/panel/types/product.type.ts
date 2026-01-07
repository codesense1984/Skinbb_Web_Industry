export type ProductStatus = "draft" | "publish" | "pending" | "inactive";

export interface ProductThumbnail {
  _id: string;
  url: string;
}

export interface ProductBrand {
  _id: string;
  name: string;
}

export interface ProductVariationType {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
}

export interface ProductTag {
  _id: string;
  name: string;
}

export interface ProductAttribute {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductAttributeValue {
  _id: string;
  label: string;
  value: string;
  colorCode: string | null;
}

export interface ProductVariantAttributes {
  productAttribute: ProductAttribute;
  productAttributeValue: ProductAttributeValue;
}

export interface ProductVariant {
  variantId: string;
  price: number;
  salePrice: number;
  quantity: number;
  attributes: ProductVariantAttributes;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface Product {
  _id: string;
  productName: string;
  slug: string;
  status: ProductStatus;
  price: number;
  salePrice: number;
  quantity: number;
  brand: string | ProductBrand; // Can be either string ID or object
  productVariationType: string | ProductVariationType; // Can be either string ID or object
  productCategory: string[] | ProductCategory[]; // Can be either string IDs or objects
  tags: string[] | ProductTag[]; // Can be either string IDs or objects
  capturedDate: string;
  thumbnail: string | ProductThumbnail; // Can be either string ID or object
  variants?: ProductVariant[];
  priceRange?: PriceRange;
  salePriceRange?: PriceRange;
  // Additional fields from new API
  sku?: string;
  description?: string;
  status_feedback?: string;
  aboutTheBrand?: string;
  ingredients?: string[];
  keyIngredients?: string[];
  skinTypes?: string[];
  hairTypes?: string[];
  skinConcerns?: string[];
  hairConcerns?: string[];
  hairGoals?: string[];
  productType?: string;
  marketedBy?: string;
  marketedByAddress?: string;
  manufacturedBy?: string;
  manufacturedByAddress?: string;
  importedBy?: string;
  importedByAddress?: string;
  benefit?: string[];
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
  images?: string[];
  barcodeImage?: string;
  capturedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  statusCode: number;
  data: {
    products: Product[];
    totalRecords: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

export interface ProductListParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
  category?: string;
  brand?: string;
  tag?: string;
  status?: string;
}

// Brand types for dropdown
export interface BrandOption {
  _id: string;
  name: string;
  slug: string;
}

export interface BrandListResponse {
  statusCode: number;
  data: {
    brands: BrandOption[];
    totalRecords: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

// Category types for dropdown
export interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  haveChild: boolean;
  totalProductCount: number;
}

export interface CategoryListResponse {
  statusCode: number;
  data: {
    productCategories: CategoryOption[];
    totalRecords: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

// Tag types for dropdown
export interface TagOption {
  _id: string;
  name: string;
  slug: string;
  totalCount: number;
}

export interface TagListResponse {
  statusCode: number;
  data: {
    totalRecords: number;
    totalPages: number;
    tags: TagOption[];
  };
  message: string;
  success: boolean;
}
