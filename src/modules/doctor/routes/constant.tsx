import { ROUTE } from "@/core/routes/constant";

const DASHBOARD_BASE = "/dashboard";

export const DOCTOR_ROUTES = {
  // ---- Dashboard ----
  DASHBOARD: {
    BASE: DASHBOARD_BASE, // /dashboard
    HOME: "/", // / (root for doctor)
  },

  // ---- News/Updates ----
  NEWS_UPDATES: {
    BASE: "/news-updates",
    LIST: "/news-updates",
    CREATE: "/news-updates/create",
    VIEW: (id: string = ROUTE.seg.id) => `/news-updates/${id}/view`,
    EDIT: (id: string = ROUTE.seg.id) => `/news-updates/${id}/edit`,
  },

  // ---- Chatroom ----
  CHATROOM: {
    BASE: "/chatroom",
    LIST: "/chatroom",
  },

  // ---- BrandConnect ----
  BRANDCONNECT: {
    BASE: "/brandconnect",
    SURVEY: {
      BASE: "/brandconnect/survey",
      LIST: "/brandconnect/survey",
      CREATE: "/brandconnect/survey/create",
      VIEW: (id: string = ROUTE.seg.id) => `/brandconnect/survey/${id}/view`,
    },
    INQUIRY: {
      BASE: "/brandconnect/inquiry",
      LIST: "/brandconnect/inquiry",
      CREATE: "/brandconnect/inquiry/create",
      VIEW: (id: string = ROUTE.seg.id) => `/brandconnect/inquiry/${id}/view`,
    },
  },

  // ---- Promotion ----
  PROMOTION: {
    BASE: "/promotion",
    LIST: "/promotion",
    CREATE: "/promotion/create",
    VIEW: (id: string = ROUTE.seg.id) => `/promotion/${id}/view`,
    EDIT: (id: string = ROUTE.seg.id) => `/promotion/${id}/edit`,
  },

  // ---- Community (Educate) ----
  COMMUNITY: {
    BASE: "/community",
    LIST: "/community",
    CREATE: "/community/create",
    VIEW: (id: string = ROUTE.seg.id) => `/community/${id}/view`,
    EDIT: (id: string = ROUTE.seg.id) => `/community/${id}/edit`,
  },

  // ---- Create Content ----
  CONTENT: {
    BASE: "/content",
    LIST: "/content",
    CREATE: "/content/create",
    VIEW: (id: string = ROUTE.seg.id) => `/content/${id}/view`,
    EDIT: (id: string = ROUTE.seg.id) => `/content/${id}/edit`,
  },

  // ---- CMS Analytics ----
  ANALYTICS: {
    BASE: "/analytics",
    CMS: {
      BASE: "/analytics/cms",
    },
  },

  // ---- Rewards ----
  REWARDS: {
    BASE: "/rewards",
    SURVEY: {
      BASE: "/rewards/survey",
      LIST: "/rewards/survey",
    },
    CUSTOMER_TRANSFER: {
      BASE: "/rewards/customer-transfer",
      LIST: "/rewards/customer-transfer",
    },
  },

  // ---- Account ----
  ACCOUNT: {
    BASE: "/account",
  },
} as const;

