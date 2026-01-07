export interface CustomerProfilePic {
  _id: string;
  url: string;
}

export interface Customer {
  _id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  role?: string;
  profilePic?: CustomerProfilePic | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface CustomerListResponse {
  statusCode: number;
  data: {
    customers: Customer[];
    totalRecords: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

export interface CustomerListParams {
  page?: number;
  limit?: number;
  query?: string;
  sort?: {
    order?: string;
    key?: string;
  };
}

export interface CustomerCreateRequest {
  name: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  profilePic?: string;
}

export interface CustomerUpdateRequest {
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  profilePic?: string;
}

export interface CustomerCreateResponse {
  statusCode: number;
  data: Customer;
  message: string;
  success: boolean;
}

export interface CustomerUpdateResponse {
  statusCode: number;
  data: Customer;
  message: string;
  success: boolean;
}

export interface CustomerDeleteResponse {
  statusCode: number;
  data: {
    _id: string;
    deleted: boolean;
  };
  message: string;
  success: boolean;
}

export type CustomerList = Customer;
