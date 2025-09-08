import MainLayout from "@/core/layouts/main-layout";
import IngredientDetail from "@/features/ingredient-detail";
import { lazy } from "react";
import type { RouteObject } from "react-router";
import { PANEL_ROUTES } from "./constant";

export const panelRoutes: RouteObject = {
  Component: MainLayout,
  children: [
    {
      index: true,
      Component: lazy(() => import("@/modules/panel/features/dashboard")),
    },
    //brand
    {
      path: PANEL_ROUTES.BRAND.LIST,
      Component: lazy(
        () => import("@/modules/panel/features/brands/brand-list"),
      ),
    },
    {
      path: PANEL_ROUTES.BRAND.CREATE,
      Component: lazy(
        () => import("@/modules/panel/features/brands/brand-form"),
      ),
    },
    {
      path: PANEL_ROUTES.BRAND.EDIT(),
      Component: lazy(
        () => import("@/modules/panel/features/brands/brand-form"),
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

    // orders
    {
      path: PANEL_ROUTES.ORDER.LIST,
      Component: lazy(() => import("@/modules/panel/features/orders/list")),
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
      Component: lazy(() => import("@/modules/panel/features/users/list")),
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
    // {
    //   path: PANEL_ROUTES.COMPANY.EDIT(),
    //   Component: lazy(() => import("@/modules/panel/features/company/edit")),
    // },
    // {
    //   path: PANEL_ROUTES.COMPANY.DETAIL(),
    //   Component: lazy(() => import("@/modules/panel/features/company/edit")),
    // },

    { path: PANEL_ROUTES.INGREDIENT_DETAILS, Component: IngredientDetail },
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
