export interface SellerMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleId: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  brandIds?: string[];
  addressIds?: string[];
  extraPermissions?: string[];
  revokedPermissions?: string[];
}

export interface SellerMemberListResponse {
  statusCode: number;
  data: {
    items: SellerMember[];
    page: number;
    limit: number;
    total: number;
  };
  message: string;
  success: boolean;
}

export interface SellerMemberListParams {
  page?: number;
  limit?: number;
  brandId?: string;
  status?: 'active' | 'inactive';
  query?: string;
  sort?: {
    order?: string;
    key?: string;
  };
}

export interface CreateSellerMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  roleId: string;
  brandIds?: string[];
  addressIds?: string[];
  extraPermissions?: string[];
  revokedPermissions?: string[];
}

export interface UpdateSellerMemberRequest {
  roleId?: string;
  brandIds?: string[];
  addressIds?: string[];
  extraPermissions?: string[];
  revokedPermissions?: string[];
  active?: boolean;
}

export interface SellerMemberCreateResponse {
  statusCode: number;
  data: SellerMember;
  message: string;
  success: boolean;
}

export interface SellerMemberUpdateResponse {
  statusCode: number;
  data: SellerMember;
  message: string;
  success: boolean;
}

export interface SellerMemberDeleteResponse {
  statusCode: number;
  data: {
    _id: string;
    active: boolean;
    updatedAt: string;
  };
  message: string;
  success: boolean;
}

export type SellerMemberList = SellerMember;


export interface CompanyUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  status?: string
}