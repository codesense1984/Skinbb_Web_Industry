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
