export type CompanyStatus = "active" | "closed" | "pending" | "inactive";

export interface Company {
  companyName: string;
  businessType: string;
  country: string;
  state: string;

  // Optional fields (match your Zod schema)
  logo?: File[];
  registeredBusinessNumber: string;
  taxId: string;
  establishedIn: string;
  website?: string;
  description?: string;
  certificateOfIncorporation?: File[];
  gstLicense?: File[];
  city: string;
  line1: string;
  line2?: string;
  postalCode?: string;

  logo_files?: File[];
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
