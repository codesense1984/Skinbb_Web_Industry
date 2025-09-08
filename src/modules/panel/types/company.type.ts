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
  companyId?: string | null;
  logo?: string;
  gst: File;
  pan: File;
  authorizationLetter: File;
  coiCertificate: File;
  msmeCertificate: File;

  ownerName: string;
  ownerEmail: string;
  phoneNumber: string;
  headquartersAddress: string;
  subsidiaryOfGlobalBusiness: boolean;
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
  companyId: string;
  logo: string;
  establishedIn: string;
  companyName: string;
  companyCategory: string;
  companyDescription: string;
  businessType: string;
  subsidiaryOfGlobalBusiness: boolean;
  headquaterLocation: string;
  website: string;
  status: string;
  landlineNo: string;
  isCompanyBrand: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  addresses: CompanyAddressDetail[];
  owner: CompanyOwner;
}

// API response type for company list (new API structure)
export interface CompanyListItem {
  _id: string;
  ownerUserId: {
    _id: string;
    email: string;
    phoneNumber: string;
  };
  designation: string;
  companyName: string;
  companyDescription: string;
  establishedIn: string;
  headquartersAddress: string;
  businessType: string;
  companyCategory: string;
  subsidiaryOfGlobalBusiness: boolean;
  brandLogo: string | null;
  productCategory: string[];
  sellingOn: Array<{
    platform: string;
    url: string;
  }>;
  website: string;
  landlineNo: string;
  address: Array<{
    _id: string;
    sellerId: string;
    addressType: string;
    gstNumber: string;
    panNumber: string;
    coiCertificate: string;
    msmeCertificate: string;
    addressLine1: string;
    landmark: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isPrimary: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    brands: Array<{
      _id: string;
      name: string;
      slug: string;
      aboutTheBrand: string;
      websiteUrl: string;
      isActive: boolean;
      logoImage: string | null;
      coverImage: string | null;
      authorizationLetter: string;
      createdBy: string;
      isDeleted: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
  }>;
  status: string;
  statusChangeReason: string;
  statusChangedAt: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
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

export interface CompanyOwner {
  ownerUserId: string;
  ownerUser: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPassword: string;
  ownerDesignation: string;
}

export interface CompanyBrand {
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
  sellingOn: Array<{
    platform: string;
    url: string;
  }>;
  aboutTheBrand: string;
  websiteUrl: string;
  isActive: boolean;
  logoImage: string;
  coverImage: string;
  authorizationLetter: string;
  createdBy: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyAddressDetail {
  addressId: string;
  addressType: string;
  addressLine1: string;
  landlineNumber:string
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  landmark: string;
  gstNumber: string;
  panNumber: string;
  cinNumber: string;
  msmeNumber: string;
  coiCertificate: string;
  panDocument: string;
  gstDocument: string;
  msmeCertificate: string;
  status: string;
  statusChangeReason: string;
  statusChangedAt: string | null;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
  brands: CompanyBrand[];
}

export interface CompanyDetailData {
  companyId: string;
  logo: string;
  establishedIn: string;
  companyName: string;
  companyCategory: string;
  businessType: string;
  subsidiaryOfGlobalBusiness: boolean;
  headquaterLocation: string;
  website: string;
  status: string;
  landlineNo: string;
  isCompanyBrand: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  addresses: CompanyAddressDetail[];
  owner: CompanyOwner;
}

export interface CompanyDetailDataResponse {
  company: CompanyDetailData;
}
