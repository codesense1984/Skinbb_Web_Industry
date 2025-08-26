export enum MODE {
  ADD = "ADD",
  EDIT = "EDIT",
  VIEW = "VIEW",
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginationApiResponse<
  K extends Record<string, unknown> = Record<string, unknown>,
> extends ApiResponse<
    K & {
      totalRecords: number;
      totalPages: number;
    }
  > {}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  filter?: Record<string, string>;
  search?: string;
}
