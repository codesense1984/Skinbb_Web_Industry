export type CompanyStatus = "active" | "closed" | "pending" | "inactive";

export interface CompanyDocument {
  number: string;
  type: "coi" | "gstLicense" | "pan" | "msme" | "brandAuthorisation";
  url: string;
}
export interface CompanyAddress {
  addressType: "registered" | "operational";
  address: string;
  landmark: string;
  phoneNumber: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
}
export interface Company {
  id?: string;
  logo: string;
  companyName: string;
  category: string;
  businessType: string;
  establishedIn: string;
  website?: string;
  isSubsidiary?: boolean;
  headquarterLocation?: string;
  description?: string;
  address: CompanyAddress[];
  documents: CompanyDocument[];
  agreeTermsConditions: boolean;
  status: CompanyStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShortCompany {
  companyName: string;
  email: string;
}

export interface CompanyBrand {
  logo?: string;
  logo_files?: File[];
  brandName: string;
  category: string;
  website?: string;
  description?: string;
  letterOfAuthorization?: File[];
}

export interface CompanyList
  extends Pick<Company, "id" | "logo" | "companyName" | "category" | "status"> {
  products: number;
  surveys: number;
  promotions: number;
  earnings: number;
}

// Onboarding API request interface
export interface OnboardingSubmitRequest {
  ownerName: string;
  ownerEmail: string;
  phoneNumber: string;
  password: string;
  roleId: string;
  companyName: string;
  companyDescription: string;
  businessType: string;
  companyCategory: string;
  gstNumber: string;
  panNumber: string;
  cinNumber: string;
  msmeNumber: string;
  website: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  landlineNo: string;
  isCompanyBrand: boolean;
  brandName: string;
  brandDescription: string;
  brandWebsite: string;
  brandLogo?: string;
  addresses: Array<{
    addressType: "registered" | "warehouse";
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isPrimary: boolean;
    brandIds?: string[];
  }>;
  sellingOn: Array<{
    platform: string;
    url: string;
  }>;
}

// Company details API response types
export interface CompanyBrandInfo {
  _id: string;
  name: string;
  slug: string;
}

export interface CompanyAddressInfo {
  brands: CompanyBrandInfo[];
  addressId: string;
  addressType: "registered" | "warehouse";
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface CompanyDetailItem {
  _id: string;
  companyName: string;
  businessType: string;
  companyCategory: string;
  website: string;
  isCompanyBrand: boolean;
  createdAt: string;
  companyId: string;
  addresses: CompanyAddressInfo[];
}

export interface CompanyDetailsResponse {
  success: boolean;
  items: CompanyDetailItem[];
}
