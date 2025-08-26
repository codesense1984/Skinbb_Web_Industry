export type Order = {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: "placed" | "pending" | string;
  createdAt: string;
  paymentMethod?: string;
  fullName: string;
  totalProduct: number;
};

export type OrderFilter = {
  status?: string;
  paymentMethod?: string;
  [key: string]: unknown;
};
