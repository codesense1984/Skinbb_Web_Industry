export interface SubscriptionModule {
  page: string;
  isEnabled: boolean;
}

export interface SubscriptionFeature {
  page: string;
  action: string;
  creditCost: number;
  isEnabled: boolean;
  expiresOnCreditsExhausted: boolean;
}

export interface RoleAccess {
  roleId: string;
  modules: SubscriptionModule[];
  features: SubscriptionFeature[];
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  planType: "free" | "monthly" | "yearly";
  price: number;
  credits: number;
  duration: number;
  description?: string;
  modules: SubscriptionModule[];
  features: SubscriptionFeature[];
  roleAccess?: RoleAccess[];
  isActive: boolean;
}

export interface Subscription {
  _id: string;
  userId: string;
  planId: SubscriptionPlan | string;
  status: "active" | "expired" | "cancelled" | "pending";
  creditsRemaining: number;
  bonusCredits: number;
  totalCreditsRemaining: number;
  creditsAllocated: number;
  creditsUsed: number;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  isAutoAssigned: boolean;
}

export interface SubscriptionResponse {
  statusCode: number;
  data: Subscription | null;
  message: string;
  success?: boolean;
}

export interface SubscriptionPlansResponse {
  statusCode: number;
  data: SubscriptionPlan[];
  message: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  key: string;
}

export interface InitiatePaymentResponse {
  statusCode: number;
  data: {
    payment?: {
      _id: string;
      planId: string;
      userId: string;
      amount: number;
      status: string;
      providerOrderId: string;
    };
    razorpayOrder?: RazorpayOrder;
    plan?: {
      id: string;
      name: string;
      planType: string;
      price: number;
      credits: number;
      duration: number;
    };
    subscription?: Subscription;
    isFreePlan: boolean;
    message?: string;
  };
  message: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  statusCode: number;
  data: {
    subscription: Subscription;
    payment: {
      _id: string;
      status: string;
    };
  };
  message: string;
}

export interface PaymentStatusResponse {
  statusCode: number;
  data: {
    status: string;
    orderId?: string;
    paymentId?: string;
    subscriptionId?: string;
  };
  message: string;
}

export interface CreditTransaction {
  _id: string;
  userId: string;
  transactionType: "credit" | "debit" | "reset" | "bonus" | "refund";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  feature?: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

export interface CreditHistoryResponse {
  statusCode: number;
  data: {
    transactions: CreditTransaction[];
    total: number;
    limit: number;
    skip: number;
  };
  message: string;
}

