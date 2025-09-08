export interface Role {
  _id: string;
  label: string;
  value: string;
  isDisabled: boolean;
  memberCount: number;
}

export interface RoleListResponse {
  statusCode: number;
  data: {
    roles: Role[];
    totalRecords: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

export interface RoleListParams {
  excludeRole?: string;
}
