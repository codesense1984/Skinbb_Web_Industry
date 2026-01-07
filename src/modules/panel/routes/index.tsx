import IngredientDetail from "@/features/ingredient-detail";
import React, { lazy } from "react";
import type { RouteObject } from "react-router";
import { PANEL_ROUTES } from "./constant";

const NotFoundPage = lazy(async () => {
  const module = await import("@/core/features/not-found");
  return { default: () => React.createElement(module.NotFoundComponent) };
});

export const panelRoutes: RouteObject = {
  Component: lazy(() => import("@/core/layouts/main-layout")),
  children: [
    {
      index: true,
      Component: lazy(() => import("@/modules/panel/features/dashboard")),
    },
    //brand
    {
      path: PANEL_ROUTES.BRAND.LIST,
      Component: lazy(
        () => import("@/modules/panel/features/brands/BrandList"),
      ),
    },
    {
      path: PANEL_ROUTES.BRAND.CREATE,
      Component: lazy(
        () => import("@/modules/panel/features/brands/BrandCreate"),
      ),
    },
    {
      path: PANEL_ROUTES.BRAND.VIEW(),
      Component: lazy(
        () => import("@/modules/panel/features/brands/BrandView"),
      ),
    },
    {
      path: PANEL_ROUTES.BRAND.EDIT(),
      Component: lazy(
        () => import("@/modules/panel/features/brands/BrandEdit"),
      ),
    },

    // company
    {
      path: PANEL_ROUTES.COMPANY.LIST,
      Component: lazy(() => import("@/modules/panel/features/company/list")),
    },
    {
      path: PANEL_ROUTES.COMPANY.EDIT(),
      Component: lazy(() => import("@/modules/panel/features/company/edit")),
    },
    {
      path: PANEL_ROUTES.COMPANY.VIEW(),
      Component: lazy(() => import("@/modules/panel/features/company/view")),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.VIEW(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location/view"),
      ),
    },

    // company-location
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.LIST(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location/list"),
      ),
    },

    // company-location-brands
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
    //   path: PANEL_ROUTES.COMPANY_LOCATION.BRAND_EDIT(),
    //   Component: lazy(
    //     () => import("@/modules/panel/features/company-location-brands/edit"),
    //   ),
    // },
    // {
    //   path: PANEL_ROUTES.COMPANY_LOCATION.BRAND_VIEW(),
    //   Component: lazy(
    //     () => import("@/modules/panel/features/company-location-brands/view"),
    //   ),
    // },
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
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_VIEW(),
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/company-location-brands/products/view"
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

    // company-location-products
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCTS(),
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/company-location-products/list/redirect"
          ),
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
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_EDIT(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-products/edit"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_VIEW(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-products/view"),
      ),
    },

    // company-users
    {
      path: PANEL_ROUTES.COMPANY.USERS(),
      Component: lazy(
        () => import("@/modules/panel/features/company/users/list"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY.USER_CREATE(),
      Component: lazy(
        () => import("@/modules/panel/features/company/users/user-form"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY.USER_EDIT(),
      Component: lazy(
        () => import("@/modules/panel/features/company/users/user-form"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY.USER_VIEW(),
      Component: lazy(
        () => import("@/modules/panel/features/company/users/user-form"),
      ),
    },

    // master data - product categories
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_CATEGORY,
      Component: lazy(
        () => import("@/modules/panel/features/master/product_category/list"),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_CATEGORY_CREATE,
      Component: lazy(
        () => import("@/modules/panel/features/master/product_category/create"),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_CATEGORY_EDIT(),
      Component: lazy(
        () => import("@/modules/panel/features/master/product_category/edit"),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_CATEGORY_VIEW(),
      Component: lazy(
        () => import("@/modules/panel/features/master/product_category/view"),
      ),
    },

    // master data - product tags
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_TAG,
      Component: lazy(
        () => import("@/modules/panel/features/master/product_tag"),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_TAG_CREATE,
      Component: lazy(
        () => import("@/modules/panel/features/master/product_tag/tag-form"),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_TAG_EDIT(),
      Component: lazy(
        () => import("@/modules/panel/features/master/product_tag/tag-form"),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_TAG_VIEW(),
      Component: lazy(
        () => import("@/modules/panel/features/master/product_tag/tag-form"),
      ),
    },

    // master data - product attributes
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE,
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/master/product_attributes/list/index"
          ),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_CREATE,
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/master/product_attributes/create/index"
          ),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_EDIT(),
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/master/product_attributes/edit/index"
          ),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_VIEW(),
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/master/product_attributes/view/index"
          ),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_VALUES(),
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/master/product_attributes/values/list"
          ),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_VALUE_CREATE(),
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/master/product_attributes/values/create/index"
          ),
      ),
    },

    // master data - discount coupons
    {
      path: PANEL_ROUTES.MASTER.DISCOUNT_COUPON,
      Component: lazy(
        () => import("@/modules/panel/features/master/discount-coupons/list"),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.DISCOUNT_COUPON_CREATE,
      Component: lazy(
        () => import("@/modules/panel/features/master/discount-coupons/create"),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.DISCOUNT_COUPON_EDIT(),
      Component: lazy(
        () => import("@/modules/panel/features/master/discount-coupons/edit"),
      ),
    },
    {
      path: PANEL_ROUTES.MASTER.DISCOUNT_COUPON_VIEW(),
      Component: lazy(
        () => import("@/modules/panel/features/master/discount-coupons/view"),
      ),
    },

    // orders
    {
      path: PANEL_ROUTES.ORDER.LIST,
      Component: lazy(() => import("@/modules/panel/features/orders/list")),
    },
    {
      path: PANEL_ROUTES.ORDER.VIEW(),
      Component: lazy(() => import("@/modules/panel/features/orders/view")),
    },

    // customers
    {
      path: PANEL_ROUTES.CUSTOMER.LIST,
      Component: lazy(() => import("@/modules/panel/features/customers/list")),
    },
    {
      path: PANEL_ROUTES.CUSTOMER.CREATE,
      Component: lazy(
        () => import("@/modules/panel/features/customers/customer-form"),
      ),
    },
    {
      path: PANEL_ROUTES.CUSTOMER.EDIT(),
      Component: lazy(() => import("@/modules/panel/features/customers/edit")),
    },
    {
      path: PANEL_ROUTES.CUSTOMER.VIEW(),
      Component: lazy(() => import("@/modules/panel/features/customers/view")),
    },

    // users
    {
      path: PANEL_ROUTES.USER.LIST,
      Component: lazy(
        () => import("@/modules/panel/features/settings/UserRolesPermissions"),
      ),
    },
    {
      path: PANEL_ROUTES.USER.CREATE,
      Component: lazy(() => import("@/modules/panel/features/users/user-form")),
    },
    {
      path: PANEL_ROUTES.USER.EDIT(),
      Component: lazy(() => import("@/modules/panel/features/users/user-form")),
    },
    {
      path: PANEL_ROUTES.USER.VIEW(),
      Component: lazy(() => import("@/modules/panel/features/users/user-form")),
    },

    // listing/products
    {
      path: PANEL_ROUTES.LISTING.LIST,
      Component: lazy(() => import("@/modules/panel/features/listing")),
    },
    {
      path: PANEL_ROUTES.LISTING.CREATE,
      Component: lazy(
        () => import("@/modules/panel/features/listing/ProductCreate"),
      ),
    },
    {
      path: PANEL_ROUTES.LISTING.CATALOG,
      Component: lazy(
        () => import("@/modules/panel/features/listing/AddCatalog"),
      ),
    },
    {
      path: PANEL_ROUTES.LISTING.CATALOG_LIST,
      Component: lazy(
        () => import("@/modules/panel/features/listing/CatalogList"),
      ),
    },

    // products
    {
      path: PANEL_ROUTES.PRODUCT.LIST,
      Component: lazy(() => import("@/modules/panel/features/products/list")),
    },
    {
      path: PANEL_ROUTES.PRODUCT.CREATE,
      Component: lazy(() => import("@/modules/panel/features/products/create")),
    },
    {
      path: PANEL_ROUTES.PRODUCT.EDIT(),
      Component: lazy(() => import("@/modules/panel/features/products/edit")),
    },
    {
      path: PANEL_ROUTES.PRODUCT.VIEW(),
      Component: lazy(() => import("@/modules/panel/features/products/view")),
    },
    {
      path: "/test-products",
      Component: lazy(
        () => import("@/modules/panel/features/products/test-routes"),
      ),
    },
    // {
    //   path: PANEL_ROUTES.COMPANY.EDIT(),
    //   Component: lazy(() => import("@/modules/panel/features/company/edit")),
    // },
    // {
    //   path: PANEL_ROUTES.COMPANY.DETAIL(),
    //   Component: lazy(() => import("@/modules/panel/features/company/edit")),
    // },

    { path: PANEL_ROUTES.INGREDIENT_DETAILS, Component: IngredientDetail },

    // face analysis
    {
      path: PANEL_ROUTES.FACE_ANALYSIS,
      Component: lazy(
        () => import("@/modules/face-analysis/features/face-analysis-page"),
      ),
    },

    // Promotions Route
    {
      path: "/promo",
      Component: lazy(() => import("@/modules/panel/features/promotions")),
    },

    // Survey Routes
    {
      path: PANEL_ROUTES.SURVEY.LIST,
      Component: lazy(
        () => import("@/modules/panel/features/survey/SurveyList"),
      ),
    },
    {
      path: PANEL_ROUTES.SURVEY.CREATE,
      Component: lazy(
        () => import("@/modules/panel/features/survey/SurveyCreate"),
      ),
    },
    {
      path: PANEL_ROUTES.SURVEY.EDIT(),
      Component: lazy(
        () => import("@/modules/panel/features/survey/SurveyEdit"),
      ),
    },
    {
      path: PANEL_ROUTES.SURVEY.VIEW(),
      Component: lazy(
        () => import("@/modules/panel/features/survey/SurveyView"),
      ),
    },
    {
      path: PANEL_ROUTES.SURVEY.DETAIL(),
      Component: lazy(
        () => import("@/modules/panel/features/survey/market-research-detail"),
      ),
    },

    // Settings Subpages
    {
      path: "/settings/company-management",
      Component: lazy(
        () => import("@/modules/panel/features/settings/CompanyManagement"),
      ),
    },
    {
      path: "/settings/user-roles-permissions",
      Component: lazy(
        () => import("@/modules/panel/features/settings/UserRolesPermissions"),
      ),
    },
    {
      path: "/api-integrations",
      Component: lazy(
        () => import("@/modules/panel/features/settings/ApiIntegrations"),
      ),
    },
    {
      path: "/notifications",
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/settings/NotificationsEmailTemplates"
          ),
      ),
    },

    // Account Route (shared with seller)
    {
      path: PANEL_ROUTES.ACCOUNT,
      Component: lazy(() => import("@/modules/seller/features/account")),
    },
    {
      path: "*",
      Component: NotFoundPage,
    },
  ],
};

export const panelOpenRoutes: RouteObject[] = [
  {
    path: PANEL_ROUTES.RELATIONSHIP_PREVIEW,
    Component: lazy(() => import("@/features/relationship-preview")),
  },
  // {
  //   path: PANEL_ROUTES.COMPANY.ONBOARD,
  //   Component: lazy(() => import("@/modules/panel/features/company/onboard")),
  // },
  {
    path: PANEL_ROUTES.ONBOARD.BASE,
    Component: lazy(
      () =>
        import(
          "@/modules/panel/features/company/components/onboard/OnboardingLayout"
        ),
    ),
    children: [
      {
        path: PANEL_ROUTES.ONBOARD.COMPANY,
        Component: lazy(
          () => import("@/modules/panel/features/company/onboard/create"),
        ),
      },
      {
        path: PANEL_ROUTES.ONBOARD.COMPANY_CREATE,
        Component: lazy(
          () =>
            import(
              "@/modules/panel/features/company/components/onboard/onboard-form"
            ),
        ),
      },
      {
        path: PANEL_ROUTES.ONBOARD.COMPANY_STATUS,
        Component: lazy(
          () => import("@/modules/panel/features/company/onboard/status"),
        ),
      },
      {
        path: PANEL_ROUTES.ONBOARD.COMPANY_EDIT(),
        Component: lazy(
          () => import("@/modules/panel/features/company/onboard/edit"),
        ),
      },
    ],
  },
];
