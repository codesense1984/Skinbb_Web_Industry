export type CompanyLocationStatus =
  | "active"
  | "inactive"
  | "pending"
  | "rejected";

export interface CompanyLocation {
  _id: string;
  sellerId: string;
  addressType: "office" | "warehouse" | "registered";
  gstNumber: string;
  panNumber: string;
  panDocument: string;
  gstDocument: string;
  coiCertificate: string;
  msmeCertificate: string;
  addressLine1: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isPrimary: boolean;
  status: CompanyLocationStatus;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CompanyLocationListResponse {
  items: CompanyLocation[];
  page: number;
  limit: number;
  total: number;
}

export interface CompanyLocationListParams {
  companyId: string;
  userId?: string;
  page?: number;
  limit?: number;
}
