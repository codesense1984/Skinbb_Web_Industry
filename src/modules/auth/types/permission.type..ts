export interface Permission {
  page: string;
  action: string[];
}

export type Role = "admin" | "editor" | "viewer" | "seller" | string;
