export type BrandStatus = "active" | "closed" | "pending" | "inactive";

export interface BrandLogoImage {
  _id: string;
  url: string;
}

export interface SellingPlatform {
  platform: string;
  url: string;
}

export interface CompanyLocationBrand {
  _id: string;
  name: string;
  slug: string;
  totalSKU: number;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  productCategory: string[];
  averageSellingPrice: number;
  marketingBudget: number;
  sellingOn: SellingPlatform[];
  aboutTheBrand: string;
  websiteUrl: string;
  isActive: boolean;
  logoImage: string;
  coverImage: string;
  authorizationLetter: string;
  createdBy: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyLocationBrandsResponse {
  statusCode: number;
  data: CompanyLocationBrand[];
  message: string;
  success: boolean;
}

export interface CompanyLocationBrandResponse {
  statusCode: number;
  data: CompanyLocationBrand;
  message: string;
  success: boolean;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  aboutTheBrand: string;
  logoImage: BrandLogoImage | null;
  isActive: boolean;
  associatedProductsCount: number;
  associatedUsers: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrandListResponse {
  statusCode: number;
  data: {
    brands: Brand[];
    totalRecords: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

export interface BrandListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
  search?: string;
}

// Legacy interface for backward compatibility
export interface LegacyBrand {
  id?: string | number;
  name: string;
  category: string;
  image: string;
  status: BrandStatus;
  products: number;
  surveys: number;
  promotions: number;
  earnings: number;
}
