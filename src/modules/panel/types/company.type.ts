export type CompanyStatus = "active" | "closed" | "pending" | "inactive";

export interface CompanyDocument {
  number: string;
  type: "coi" | "gstLicense" | "pan" | "msme" | "brandAuthorisation";
  url: string;
}
export interface CompanyAddress {
  addressType: "registered" | "office";
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
export interface CompanyOnboardingSubmitRequest
  extends Record<string, unknown> {
  _id?: string | null;
  ownerName: string;
  ownerEmail: string;
  phoneNumber: string;
  password: string;
  roleId: string;
  companyName: string;
  companyDescription: string;
  businessType: string;
  companyCategory: string;
  establishedIn: string;
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
    gstNumber: string;
    panNumber: string;
    addressType: string;
    addressLine1: string;
    addressLine2?: string;
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
// export interface CompanyBrandInfo {
//   _id: string;
//   name: string;
//   slug: string;
// }

// export interface CompanyAddressInfo {
//   brands: CompanyBrandInfo[];
//   addressId: string;
//   addressType: "registered" | "warehouse";
//   landmark: string;
//   city: string;
//   state: string;
//   postalCode: string;
//   country: string;
//   isPrimary: boolean;
// }

// export interface CompanyDetailItem {
//   _id: string;
//   companyName: string;
//   businessType: string;
//   companyCategory: string;
//   website: string;
//   isCompanyBrand: boolean;
//   createdAt: string;
//   companyId: string;
//   addresses: CompanyAddressInfo[];
// }

// export interface CompanyDetailsResponse {
//   success: boolean;
//   items: CompanyDetailItem[];
// }

// Company detail by ID API response types
export interface CompanyBrandInfo {
  _id: string;
  name: string;
  slug: string;
}

export interface CompanyAddressInfo {
  addressId: string;
  addressType: "registered" | "office";
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  brands: CompanyBrandInfo[];
}

export interface CompanyOnboading {
  _id: string;
  brandLogo?: string;
  logo?: string;
  ownerUserId: string;
  companyName: string;
  designation?: string;
  businessType: string;
  companyCategory: string;
  companyDescription?: string;
  subsidiaryOfGlobalBusiness: boolean;
  headquartersAddress: string;
  cinNumber: string;
  msmeNumber: string;
  coiCertificate?: string;
  msmeCertificate?: string;
  totalSKU: number;
  productCategory: string[];
  averageSellingPrice: number;
  marketingBudget: number;
  sellingOn: Array<{
    platform: string;
    url: string;
  }>;
  website: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  landlineNo: string;
  isCompanyBrand: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  statusChangeReason?: string;
  statusChangedAt?: string;
  companyId: string;
  status: string;
  establishedIn?: string;
  addresses: CompanyAddressInfo[];
}

// API response type for company list (sellers)
export interface CompanyListItem {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  designation: string;
  companyName: string;
  brandName: string | null;
  website: string;
  marketingBudget: number;
  status: string;
  createdAt: string;
}

// New API response types for detailData endpoint
export interface OwnerUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyBrand {
  _id: string;
  name: string;
  slug: string;
  aboutTheBrand: string;
  websiteUrl: string | null;
  isActive: boolean;
  logoImage: string | null;
  coverImage: string | null;
  authorizationLetter: string | null;
  gstDocument: string | null;
  panDocument: string | null;
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyAddressDetail {
  addressId: string;
  addressType: string;
  gstNumber: string;
  panNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  brands: CompanyBrand[];
}

export interface CompanyDetailData {
  _id: string;
  ownerUserId: string;
  companyName: string;
  companyDescription: string;
  designation: string;
  establishedIn: string;
  headquartersAddress: string;
  businessType: string;
  companyCategory: string;
  subsidiaryOfGlobalBusiness: boolean;
  cinNumber: string;
  msmeNumber: string;
  coiCertificate: string | null;
  msmeCertificate: string | null;
  totalSKU: number;
  productCategory: string[];
  averageSellingPrice: number;
  marketingBudget: number;
  sellingOn: CompanyOnboading["sellingOn"];
  brandLogo: string;
  website: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  landlineNo: string;
  isCompanyBrand: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  statusChangeReason: string | null;
  statusChangedAt: string | null;
  companyId: string;
  status: string;
}

export interface CompanyDetailDataResponse {
  company: CompanyDetailData;
  ownerUser: OwnerUser;
  addresses: CompanyAddressDetail[];
}
