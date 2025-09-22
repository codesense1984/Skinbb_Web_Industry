import { type ReactNode } from "react";

export enum MODE {
  ADD = "ADD",
  EDIT = "EDIT",
  VIEW = "VIEW",
}

export type Option = {
  label: string | ReactNode;
  value: string;
  disabled?: boolean;
  content?: unknown;
  [key: string]: unknown;
};

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export type PaginationApiResponse<
  K extends Record<string, unknown> = Record<string, unknown>,
> = ApiResponse<
  K & {
    totalRecords: number;
    totalPages: number;
  }
>;

export interface PaginationParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  filter?: Record<string, string>;
  search?: string;
}
