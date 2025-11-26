export type PromotionPlacement =
  | "home-hero"
  | "home-strip"
  | "brand-page"
  | "category-page"
  | "product-page";

export type PromotionType = "banner" | "curated-stores";

export type LinkType = "shelf" | "blank";

export type PromotionFor = "product" | "brand" | "category" | "tag" | "global";

export interface PromotionBrand {
  _id: string;
  name: string;
  slug?: string;
}

export interface PromotionProduct {
  _id: string;
  name: string;
  slug?: string;
}

export interface PromotionCategory {
  _id: string;
  name: string;
  slug?: string;
}

export interface PromotionTag {
  _id: string;
  name: string;
  slug?: string;
}

export interface PromotionCreatedBy {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Promotion {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  imageAltText?: string;
  redirectUrl?: string;
  linkType: LinkType;
  promotionType: PromotionType;
  brand: string[] | PromotionBrand[];
  product: string[] | PromotionProduct[];
  category: string[] | PromotionCategory[];
  tag: string[] | PromotionTag[];
  placement: PromotionPlacement;
  priority: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  allowOverlap: boolean;
  promotionFor: PromotionFor;
  createdBy: string | PromotionCreatedBy;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionListParams {
  page?: number;
  limit?: number;
  search?: string;
  placement?: PromotionPlacement;
  isActive?: boolean;
  promotionType?: PromotionType;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  productId?: string;
  brandId?: string;
  categoryId?: string;
  tagId?: string;
}

export interface PromotionListResponse {
  success: boolean;
  data: {
    promotions: Promotion[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      itemsPerPage: number;
    };
  };
}

export interface PromotionResponse {
  success: boolean;
  message?: string;
  data: Promotion;
}

export interface PromotionStatsResponse {
  success: boolean;
  data: {
    overview: {
      total: number;
      active: number;
      inactive: number;
      expired: number;
      upcoming: number;
    };
    byPlacement: Array<{
      _id: PromotionPlacement;
      count: number;
    }>;
  };
}

export interface PromotionCreateRequest {
  image?: File | string; // File for upload or Media ID as string
  image_files?: File[]; // File input component may store files here
  title: string;
  subtitle?: string;
  redirectUrl?: string;
  linkType?: LinkType;
  promotionType?: PromotionType;
  brandIds?: string[];
  productIds?: string[];
  categoryIds?: string[];
  tagIds?: string[];
  placement: PromotionPlacement;
  priority?: number;
  startAt: string; // Format: dd/mm/yyyy or dd/mm/yyyy hh:mm
  endAt: string; // Format: dd/mm/yyyy or dd/mm/yyyy hh:mm
  isActive?: boolean;
  allowOverlap?: boolean;
}

export interface PromotionUpdateRequest extends Partial<PromotionCreateRequest> {}

export interface ActivePromotionParams {
  placement: PromotionPlacement;
  productId?: string;
  brandId?: string;
  categoryId?: string;
  tagId?: string;
  limit?: number;
}

export interface CuratedStoresProductsParams {
  page?: number;
  limit?: number;
}

export interface CuratedStoresProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: Array<{
      _id: string;
      productName: string;
      slug: string;
      description?: string;
      price: number;
      salePrice?: number;
      sku: string;
      brand: {
        _id: string;
        name: string;
        slug: string;
      };
      productCategory: {
        _id: string;
        name: string;
        slug: string;
      };
      thumbnail: string;
      createdAt: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    promotion: {
      _id: string;
      title: string;
      subtitle?: string;
      promotionType: PromotionType;
      promotionFor: PromotionFor;
    };
  };
}

