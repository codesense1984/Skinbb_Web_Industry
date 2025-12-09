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
  },

  // ---- Create A Wish ----
  CREATE_WISH: {
    BASE: "/create-wish",
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

  // ---- Cost Calculator ----
  COST_CALCULATOR: {
    BASE: "/cost-calculator",
  },

  // ---- Substitution Finder ----
  SUBSTITUTION_FINDER: {
    BASE: "/substitution-finder",
  },
} as const;

