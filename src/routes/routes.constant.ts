export const ROUTES = {
  CREATE: "/create",
  EDIT: "/edit",
  // Dashboard routes
  DASHBOARD: "/",
  BRAND: "/brand",
  BRAND_LIST: "/brands",
  BRAND_CREATE: "/brand/create",
  BRAND_EDIT: "/brand/edit",
  ANALYTICS: "/analytics",
  ANALYTIC: "/analytic",
  PLATFORM: "/platform",
  INGREDIENT: "/ingredient",
  CHAT: "/chat",
  RELATIONSHIP_PREVIEW: "/relationship",
  SURVEY: "/survey",
  SURVEYS: "/surveys",
  
  INGREDIENT_DETAILS: "/ingredient-details",
  // analytics
  get PLATFORM_ANALYTIC() {
    return `${this.ANALYTIC}${this.PLATFORM}`;
  },
  get BRAND_ANALYTIC() {
    return `${this.ANALYTIC}${this.BRAND}`;
  },
  get INGREDIENT_ANALYTIC() {
    return `${this.ANALYTIC}${this.INGREDIENT}`;
  },

  // survey
  get SURVEY_CREATE() {
    return `${this.SURVEY}${this.CREATE}`;
  },
  get SURVEY_EDIT() {
    return `${this.SURVEY}${this.EDIT}`;
  },

  // Auth routes
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",

  // DUMMY
  D_CHARTS: "/dummy/charts",
  D_TABLE: "/dummy/tables",
};
