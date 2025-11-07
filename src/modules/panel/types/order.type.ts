// Order type for list view (simplified API response)
export type Order = {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: "placed" | "pending" | "shipped" | "delivered" | "cancelled" | string;
  createdAt: string;
  paymentMethod: string;
  fullName?: string | null;
  totalProduct: number;
  companyId?: string;
  brand?: {
    _id: string;
    name: string;
  };
};

// Order type for detailed view (full API response)
export type OrderDetails = {
  _id?: string;
  orderNumber: string;
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  totalCouponDiscount: number;
  customerPayment: number;
  orderStatus:
    | "placed"
    | "pending"
    | "shipped"
    | "delivered"
    | "cancelled"
    | string;
  paymentStatus: "paid" | "pending" | "failed" | "refunded" | string;
  payment: string;
  shipmentStatus: unknown[];
  createdAt: string;
  cancellationReason?: string | null;
  customer: {
    _id: string;
    name: string;
    phoneNumber: string;
    profilePic?: {
      _id: string;
      url: string;
    };
  };
  billingAddress: {
    fullName: string;
    phoneNumber: string;
    street: string;
    landmark: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    gstNumber?: string | null;
    label: string;
  };
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    street: string;
    landmark: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    gstNumber?: string | null;
    label: string;
  };
  items: Array<{
    _id: string;
    productName: string;
    sku?: string | null;
    slug: string;
    price: number;
    salesPrice: number;
    quantity: number;
    discount: number;
    thumbnail: string[];
    isSimpleProduct: boolean;
  }>;
  discountDetails: unknown[];
};

export type OrderFilter = {
  status?: string;
  paymentMethod?: string;
  brand?: string;
  companyId?: string;
  [key: string]: unknown;
};
