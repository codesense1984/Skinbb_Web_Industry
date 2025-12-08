export const API_PREFIX = "/api/v1" as const;

export const ENDPOINTS = {
  SUBSCRIPTION: {
    CURRENT: `${API_PREFIX}/subscription/current`,
    PLANS: `${API_PREFIX}/subscription/plans`,
    INITIATE_PAYMENT: (planId: string) =>
      `${API_PREFIX}/subscription/purchase/initiate/${planId}`,
    VERIFY_PAYMENT: (planId: string) =>
      `${API_PREFIX}/subscription/purchase/verify/${planId}`,
    PAYMENT_STATUS: (planId: string) =>
      `${API_PREFIX}/subscription/purchase/status/${planId}`,
    CREDIT_HISTORY: `${API_PREFIX}/subscription/credits/history`,
  },
} as const;

export type Endpoints = typeof ENDPOINTS;

