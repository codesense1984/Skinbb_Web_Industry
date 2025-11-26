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

  // ---- Account ----
  ACCOUNT: {
    BASE: "/account",
  },
} as const;

