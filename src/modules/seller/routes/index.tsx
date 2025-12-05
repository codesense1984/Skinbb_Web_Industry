import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { lazy } from "react";
import type { RouteObject } from "react-router";
import { SELLER_ROUTES } from "./constant";

export const sellerRoutes: RouteObject = {
  // Component: MainLayout,
  Component: lazy(() => import("@/core/layouts/main-layout")),
  children: [
    // Dashboard
    {
      index: true,
      Component: lazy(() => import("@/modules/seller/features/dashboard")),
    },

    // Company Management
    {
      path: "/company/:id/view",
      Component: lazy(() => import("@/modules/panel/features/company/view")),
    },
    {
      path: "/company/:id/edit",
      Component: lazy(() => import("@/modules/panel/features/company/edit")),
    },

    // Company Location
    {
      path: SELLER_ROUTES.COMPANY_LOCATION.VIEW(),
      Component: lazy(
        () => import("@/modules/seller/features/CompanyLocationView"),
      ),
    },

    // Brand Management - Using simplified routes
    {
      path: SELLER_ROUTES.BRAND.LIST,
      Component: lazy(
        () => import("@/modules/seller/features/brands/BrandList"),
      ),
    },
    {
      path: SELLER_ROUTES.BRAND.CREATE,
      Component: lazy(
        () => import("@/modules/seller/features/brands/BrandCreate"),
      ),
    },
    {
      path: SELLER_ROUTES.BRAND.VIEW(),
      Component: lazy(
        () => import("@/modules/seller/features/brands/BrandView"),
      ),
    },
    {
      path: SELLER_ROUTES.BRAND.EDIT(),
      Component: lazy(
        () => import("@/modules/seller/features/brands/BrandEdit"),
      ),
    },
    // {
    //   path: "/brands",
    //   Component: lazy(
    //     () => import("@/modules/seller/features/brands/BrandList"),
    //   ),
    // },
    // {
    //   path: "/brand/create",
    //   Component: lazy(
    //     () => import("@/modules/panel/features/brands/BrandCreate"),
    //   ),
    // },
    // {
    //   path: "/brand/:id/view",
    //   Component: lazy(
    //     () => import("@/modules/panel/features/brands/BrandView"),
    //   ),
    // },
    // {
    //   path: "/brand/:id/edit",
    //   Component: lazy(
    //     () => import("@/modules/panel/features/brands/BrandEdit"),
    //   ),
    // },

    // Product Management - Using simplified routes (redirected to unified listing)
    {
      path: "/products",
      Component: lazy(
        () => import("@/modules/seller/features/products/redirect"),
      ),
    },
    {
      path: "/products/create",
      Component: lazy(
        () => import("@/modules/panel/features/listing/ProductCreate"),
      ),
    },
    {
      path: "/product/:id/view",
      Component: lazy(
        () => import("@/modules/panel/features/listing/ProductCreate"),
      ),
    },
    {
      path: "/product/:id/edit",
      Component: lazy(
        () => import("@/modules/panel/features/listing/ProductCreate"),
      ),
    },

    // Order Management
    {
      path: "/orders",
      Component: lazy(
        () => import("@/modules/seller/features/orders/SellerOrderList"),
      ),
    },
    {
      path: "/order/:id/view",
      Component: lazy(
        () => import("@/modules/seller/features/orders/OrderView"),
      ),
    },

    // User Management
    {
      path: SELLER_ROUTES.USERS.LIST(),
      Component: lazy(() => import("@/modules/seller/features/users/list")),
    },

    // Marketing Routes - Seller-specific components
    {
      path: SELLER_ROUTES.MARKETING.DISCOUNT_COUPONS.LIST,
      Component: lazy(
        () => import("@/modules/seller/features/marketing/DiscountCouponsList"),
      ),
    },
    {
      path: SELLER_ROUTES.MARKETING.DISCOUNT_COUPONS.CREATE,
      Component: lazy(
        () => import("@/modules/seller/features/marketing/DiscountCouponForm"),
      ),
    },
    {
      path: SELLER_ROUTES.MARKETING.DISCOUNT_COUPONS.VIEW(),
      Component: lazy(
        () => import("@/modules/seller/features/marketing/DiscountCouponForm"),
      ),
    },
    {
      path: SELLER_ROUTES.MARKETING.DISCOUNT_COUPONS.EDIT(),
      Component: lazy(
        () => import("@/modules/seller/features/marketing/DiscountCouponForm"),
      ),
    },
    // Survey Routes
    {
      path: SELLER_ROUTES.SURVEY.LIST,
      Component: lazy(
        () => import("@/modules/seller/features/survey/SurveyList"),
      ),
    },
    {
      path: SELLER_ROUTES.SURVEY.CREATE,
      Component: lazy(
        () => import("@/modules/seller/features/survey/SurveyCreate"),
      ),
    },
    {
      path: SELLER_ROUTES.SURVEY.VIEW(),
      Component: lazy(
        () => import("@/modules/seller/features/survey/SurveyView"),
      ),
    },
    // {
    //   path: SELLER_ROUTES.SURVEY.VIEW(),
    //   Component: lazy(
    //     () => import("@/modules/seller/features/survey/SurveyDetail"),
    //   ),
    // },
    {
      path: SELLER_ROUTES.SURVEY.EDIT(),
      Component: lazy(
        () => import("@/modules/seller/features/survey/SurveyEdit"),
      ),
    },
    // Promotions Routes
    {
      path: SELLER_ROUTES.MARKETING.PROMOTIONS.LIST,
      Component: lazy(
        () => import("@/modules/seller/features/marketing/PromotionsList"),
      ),
    },
    {
      path: SELLER_ROUTES.MARKETING.PROMOTIONS.CREATE,
      Component: lazy(
        () => import("@/modules/seller/features/marketing/PromotionsList"),
      ),
    },
    {
      path: SELLER_ROUTES.MARKETING.PROMOTIONS.VIEW(),
      Component: lazy(
        () => import("@/modules/seller/features/marketing/PromotionsList"),
      ),
    },
    {
      path: SELLER_ROUTES.MARKETING.PROMOTIONS.EDIT(),
      Component: lazy(
        () => import("@/modules/seller/features/marketing/PromotionsList"),
      ),
    },

    // Analytics Routes
    {
      path: SELLER_ROUTES.ANALYTICS.PLATFORM.BASE,
      Component: lazy(() => import("@/modules/analytics/features/platform")),
    },
    {
      path: SELLER_ROUTES.ANALYTICS.BRAND.BASE,
      Component: lazy(() => import("@/modules/analytics/features/brand")),
    },
    {
      path: SELLER_ROUTES.ANALYTICS.INGREDIENT.BASE,
      Component: lazy(() => import("@/modules/analytics/features/ingredient")),
    },
    {
      path: SELLER_ROUTES.ANALYTICS.SALES_INSIGHTS.BASE,
      Component: lazy(
        () => import("@/modules/seller/features/analytics/SalesInsights"),
      ),
    },
    {
      path: SELLER_ROUTES.ANALYTICS.INGREDIENT_INSIGHTS.BASE,
      Component: lazy(
        () => import("@/modules/seller/features/analytics/IngredientInsights"),
      ),
    },
    {
      path: SELLER_ROUTES.ANALYTICS.BRAND_INSIGHTS.BASE,
      Component: lazy(
        () => import("@/modules/seller/features/analytics/BrandInsights"),
      ),
    },
    {
      path: SELLER_ROUTES.ANALYTICS.CUSTOMER_INSIGHTS.BASE,
      Component: lazy(
        () => import("@/modules/seller/features/analytics/CustomerInsights"),
      ),
    },
    {
      path: SELLER_ROUTES.ANALYTICS.MARKET_TRENDS.BASE,
      Component: lazy(
        () => import("@/modules/seller/features/analytics/MarketTrends"),
      ),
    },
    {
      path: SELLER_ROUTES.ANALYTICS.ECOMMERCE.BASE,
      Component: lazy(
        () => import("@/modules/analytics/features/ecommerce-dashboard"),
      ),
    },

    // User Settings Routes
    {
      path: SELLER_ROUTES.USER_SETTINGS.BASE,
      Component: lazy(
        () => import("@/modules/seller/features/settings/Settings"),
      ),
    },
    {
      path: SELLER_ROUTES.USER_SETTINGS.PERMISSIONS.BASE,
      Component: lazy(
        () => import("@/modules/seller/features/settings/PermissionsSettings"),
      ),
    },
    {
      path: SELLER_ROUTES.USER_SETTINGS.PREFERENCES.BASE,
      Component: lazy(
        () => import("@/modules/seller/features/settings/PreferencesSettings"),
      ),
    },

    // Account Route
    {
      path: SELLER_ROUTES.ACCOUNT.BASE,
      Component: lazy(() => import("@/modules/seller/features/account")),
    },
    // Listing/Product Management
    {
      path: "/listings",
      Component: lazy(() => import("@/modules/panel/features/listing")),
    },
    {
      path: "/listing/create",
      Component: lazy(
        () => import("@/modules/panel/features/listing/ProductCreate"),
      ),
    },

    // Product Management - Using existing admin listing routes
    {
      path: "/listing",
      Component: lazy(() => import("@/modules/panel/features/listing")),
    },
    {
      path: "/listing/catalog",
      Component: lazy(
        () => import("@/modules/panel/features/listing/AddCatalog"),
      ),
    },

    // Catalog Management - Dedicated catalog list
    {
      path: "/catalog",
      Component: lazy(
        () => import("@/modules/panel/features/listing/CatalogList"),
      ),
    },

    // Company Location Brand Management (Complex routes)
    // {
    //   path: PANEL_ROUTES.COMPANY_LOCATION.BRANDS(),
    //   Component: lazy(
    //     () => import("@/modules/panel/features/company-location-brands/list"),
    //   ),
    // },
    // {
    //   path: PANEL_ROUTES.COMPANY_LOCATION.BRAND_CREATE(),
    //   Component: lazy(
    //     () => import("@/modules/panel/features/company-location-brands/create"),
    //   ),
    // },
    // {
    //   path: PANEL_ROUTES.BRAND.BRAND_VIEW(),
    //   Component: lazy(
    //     () => import("@/modules/panel/features/company-location-brands/view"),
    //   ),
    // },
    // {
    //   path: PANEL_ROUTES.COMPANY_LOCATION.BRAND_EDIT(),
    //   Component: lazy(
    //     () => import("@/modules/panel/features/company-location-brands/edit"),
    //   ),
    // },

    // Company Location Product Management (Complex routes - redirected to unified listing)
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCTS(),
      Component: lazy(
        () => import("@/modules/seller/features/ProductListRedirect"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_CREATE(),
      Component: lazy(
        () =>
          import("@/modules/panel/features/company-location-products/create"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_VIEW(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-products/view"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_EDIT(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-products/edit"),
      ),
    },

    // Brand Product Management (Complex routes - redirected to unified listing)
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.BRAND_PRODUCTS(),
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/company-location-brands/products/list/redirect"
          ),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.BRAND_PRODUCT_CREATE(),
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/company-location-brands/products/create"
          ),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_EDIT(),
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/company-location-brands/products/edit"
          ),
      ),
    },

    // Survey Routes
    {
      path: SELLER_ROUTES.SURVEY.LIST,
      Component: lazy(
        () => import("@/modules/seller/features/survey/SurveyList"),
      ),
    },
    {
      path: SELLER_ROUTES.SURVEY.CREATE,
      Component: lazy(
        () => import("@/modules/seller/features/survey/SurveyCreate"),
      ),
    },
    {
      path: SELLER_ROUTES.SURVEY.DETAIL(),
      Component: lazy(
        () => import("@/modules/seller/features/survey/SurveyDetail"),
      ),
    },
    {
      path: SELLER_ROUTES.SURVEY.EDIT(),
      Component: lazy(
        () => import("@/modules/seller/features/survey/SurveyEdit"),
      ),
    },

    // 404 fallback
    {
      path: "*",
      // element: <NotFoundComponent />,
      Component: lazy(() => import("@/core/features/not-found")),
    },
  ],
};
