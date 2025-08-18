export type CompanyStatus = "active" | "closed" | "pending" | "inactive";

export interface CompanyDocument {
  number: string;
  type: "coi" | "gstLicense" | "pan" | "msme";
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
