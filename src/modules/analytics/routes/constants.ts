// src/modules/analytics/routes/constants.ts

import { ROUTE } from "@/core/routes/constant";

const ANALYTICS_BASE = "/analytics";
const ANALYTIC_BASE = "/analytic";

export const ANALYTICS_ROUTES = {
  BASE: ANALYTICS_BASE,
  PLATFORM: {
    BASE: ROUTE.build(ANALYTIC_BASE, "platform"), // /analytic/platform
  },
  BRAND: {
    BASE: ROUTE.build(ANALYTIC_BASE, "brand"), // /analytic/brand
  },
  INGREDIENT: {
    BASE: ROUTE.build(ANALYTIC_BASE, "ingredient"), // /analytic/ingredient
  },
};
