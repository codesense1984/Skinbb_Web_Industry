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

export type CustomerList = Customer;
