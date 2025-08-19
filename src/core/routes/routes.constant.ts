export const ROUTES = {
  CREATE: "/create",
  EDIT: "/edit",
  // Dashboard routes
  DASHBOARD: "/",
  BRAND: "/brand",
  BRAND_LIST: "/brands",
  BRAND_CREATE: "/brand/create",
  BRAND_EDIT: "/brand/edit",
  // ANALYTICS: "/analytics",
  // ANALYTIC: "/analytic",
  // PLATFORM: "/platform",
  // INGREDIENT: "/ingredient",
  CHAT: "/chat",
  RELATIONSHIP_PREVIEW: "/relationship",
  // SURVEY: "/survey",
  // SURVEYS: "/surveys",
  COMPANIES: "/companies",
  COMPANY: "/company",
  ONBOARD: "/onboard",

  INGREDIENT_DETAILS: "/ingredient-details",
  // analytics
  // get PLATFORM_ANALYTIC() {
  //   return `${this.ANALYTIC}${this.PLATFORM}`;
  // },
  // get BRAND_ANALYTIC() {
  //   return `${this.ANALYTIC}${this.BRAND}`;
  // },
  // get INGREDIENT_ANALYTIC() {
  //   return `${this.ANALYTIC}${this.INGREDIENT}`;
  // },

  // survey
  // get SURVEY_CREATE() {
  //   return `${this.SURVEY}${this.CREATE}`;
  // },
  // get SURVEY_EDIT() {
  //   return `${this.SURVEY}${this.EDIT}`;
  // },

  // company
  get COMPANY_CREATE() {
    return `${this.COMPANY}${this.CREATE}`;
  },
  get COMPANY_EDIT() {
    return `${this.COMPANY}${this.EDIT}`;
  },
  get COMPANY_ONBOARD() {
    return `${this.COMPANY}${this.ONBOARD}`;
  },
  get COMPANY_DETAIL() {
    return `${this.COMPANY}`;
  },

  // DUMMY
  D_CHARTS: "/dummy/charts",
  D_TABLE: "/dummy/tables",
};
