// src/modules/analytics/routes/constants.ts
export const ANALYTICS_ROUTES = {
  //   ROOT: "/analytics",
  //   TAB: (tab: "brand" | "platform" | "ingredient" | ":tab" = ":tab") =>
  //     `/analytics/${tab}`,

  ANALYTICS: "/analytics",
  BRAND: "/brand",
  ANALYTIC: "/analytic",
  PLATFORM: "/platform",
  INGREDIENT: "/ingredient",

  get PLATFORM_ANALYTIC() {
    return `${this.ANALYTIC}${this.PLATFORM}`;
  },
  get BRAND_ANALYTIC() {
    return `${this.ANALYTIC}${this.BRAND}`;
  },
  get INGREDIENT_ANALYTIC() {
    return `${this.ANALYTIC}${this.INGREDIENT}`;
  },
};
