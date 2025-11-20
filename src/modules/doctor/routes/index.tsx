import { lazy } from "react";
import type { RouteObject } from "react-router";
import { DOCTOR_ROUTES } from "./constant";

export const doctorRoutes: RouteObject = {
  Component: lazy(() => import("@/core/layouts/main-layout")),
  children: [
    // Dashboard
    {
      index: true,
      Component: lazy(() => import("@/modules/doctor/features/dashboard")),
    },

    // News/Updates Routes
    {
      path: DOCTOR_ROUTES.NEWS_UPDATES.LIST,
      Component: lazy(() => import("@/modules/doctor/features/news-updates")),
    },
    {
      path: DOCTOR_ROUTES.NEWS_UPDATES.CREATE,
      Component: lazy(() => import("@/modules/doctor/features/news-updates")),
    },
    {
      path: DOCTOR_ROUTES.NEWS_UPDATES.VIEW(),
      Component: lazy(() => import("@/modules/doctor/features/news-updates")),
    },
    {
      path: DOCTOR_ROUTES.NEWS_UPDATES.EDIT(),
      Component: lazy(() => import("@/modules/doctor/features/news-updates")),
    },

    // Chatroom Routes
    {
      path: DOCTOR_ROUTES.CHATROOM.LIST,
      Component: lazy(() => import("@/modules/doctor/features/chatroom")),
    },

    // BrandConnect - Survey Routes
    {
      path: DOCTOR_ROUTES.BRANDCONNECT.SURVEY.LIST,
      Component: lazy(
        () => import("@/modules/doctor/features/brandconnect/survey"),
      ),
    },
    {
      path: DOCTOR_ROUTES.BRANDCONNECT.SURVEY.CREATE,
      Component: lazy(
        () => import("@/modules/doctor/features/brandconnect/survey"),
      ),
    },
    {
      path: DOCTOR_ROUTES.BRANDCONNECT.SURVEY.VIEW(),
      Component: lazy(
        () => import("@/modules/doctor/features/brandconnect/survey"),
      ),
    },

    // BrandConnect - Inquiry Routes
    {
      path: DOCTOR_ROUTES.BRANDCONNECT.INQUIRY.LIST,
      Component: lazy(
        () => import("@/modules/doctor/features/brandconnect/inquiry"),
      ),
    },
    {
      path: DOCTOR_ROUTES.BRANDCONNECT.INQUIRY.CREATE,
      Component: lazy(
        () => import("@/modules/doctor/features/brandconnect/inquiry"),
      ),
    },
    {
      path: DOCTOR_ROUTES.BRANDCONNECT.INQUIRY.VIEW(),
      Component: lazy(
        () => import("@/modules/doctor/features/brandconnect/inquiry"),
      ),
    },

    // Promotion Routes
    {
      path: DOCTOR_ROUTES.PROMOTION.LIST,
      Component: lazy(() => import("@/modules/doctor/features/promotion")),
    },
    {
      path: DOCTOR_ROUTES.PROMOTION.CREATE,
      Component: lazy(() => import("@/modules/doctor/features/promotion")),
    },
    {
      path: DOCTOR_ROUTES.PROMOTION.VIEW(),
      Component: lazy(() => import("@/modules/doctor/features/promotion")),
    },
    {
      path: DOCTOR_ROUTES.PROMOTION.EDIT(),
      Component: lazy(() => import("@/modules/doctor/features/promotion")),
    },

    // Community Routes
    {
      path: DOCTOR_ROUTES.COMMUNITY.LIST,
      Component: lazy(() => import("@/modules/doctor/features/community")),
    },
    {
      path: DOCTOR_ROUTES.COMMUNITY.CREATE,
      Component: lazy(() => import("@/modules/doctor/features/community")),
    },
    {
      path: DOCTOR_ROUTES.COMMUNITY.VIEW(),
      Component: lazy(() => import("@/modules/doctor/features/community")),
    },
    {
      path: DOCTOR_ROUTES.COMMUNITY.EDIT(),
      Component: lazy(() => import("@/modules/doctor/features/community")),
    },

    // Content Routes
    {
      path: DOCTOR_ROUTES.CONTENT.LIST,
      Component: lazy(() => import("@/modules/doctor/features/content")),
    },
    {
      path: DOCTOR_ROUTES.CONTENT.CREATE,
      Component: lazy(() => import("@/modules/doctor/features/content")),
    },
    {
      path: DOCTOR_ROUTES.CONTENT.VIEW(),
      Component: lazy(() => import("@/modules/doctor/features/content")),
    },
    {
      path: DOCTOR_ROUTES.CONTENT.EDIT(),
      Component: lazy(() => import("@/modules/doctor/features/content")),
    },

    // Analytics Routes
    {
      path: DOCTOR_ROUTES.ANALYTICS.CMS.BASE,
      Component: lazy(() => import("@/modules/doctor/features/analytics")),
    },

    // Rewards - Survey Routes
    {
      path: DOCTOR_ROUTES.REWARDS.SURVEY.LIST,
      Component: lazy(() => import("@/modules/doctor/features/rewards/survey")),
    },

    // Rewards - Customer Transfer Routes
    {
      path: DOCTOR_ROUTES.REWARDS.CUSTOMER_TRANSFER.LIST,
      Component: lazy(
        () => import("@/modules/doctor/features/rewards/customer-transfer"),
      ),
    },

    // Account Route
    {
      path: DOCTOR_ROUTES.ACCOUNT.BASE,
      Component: lazy(() => import("@/modules/doctor/features/account")),
    },

    // 404 fallback
    {
      path: "*",
      Component: lazy(() => import("@/core/features/not-found")),
    },
  ],
};
