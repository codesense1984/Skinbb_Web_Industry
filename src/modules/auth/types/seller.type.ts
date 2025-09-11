export interface SellerBrand {
  _id: string;
  name: string;
  slug: string;
}

export interface SellerAddress {
  addressId: string;
  addressType: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  brands: SellerBrand[];
}

export interface SellerInfo {
  companyId: string;
  companyName: string;
  addresses: SellerAddress[];
}

export interface SellerInfoResponse {
  statusCode: number;
  data: SellerInfo;
  message: string;
}
