import { ROUTE } from "@/core/routes/constant";

const DASHBOARD_BASE = "/dashboard";

export const FORMULATOR_ROUTES = {
  // ---- Dashboard ----
  DASHBOARD: {
    BASE: DASHBOARD_BASE,
    HOME: "/",
  },

  // ---- Formulations ----
  FORMULATIONS: {
    BASE: "/formulations",
    DECODE: "/formulations/decode",
    CREATE: "/formulations/create",
  },

  // ---- Market Research ----
  MARKET_RESEARCH: {
    BASE: "/market-research",
  },

  // ---- Compare ----
  COMPARE: {
    BASE: "/compare",
  },

  // ---- Account ----
  ACCOUNT: {
    BASE: "/account",
  },
} as const;

