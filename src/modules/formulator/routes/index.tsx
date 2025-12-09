import { lazy } from "react";
import type { RouteObject } from "react-router";
import { FORMULATOR_ROUTES } from "./constant";

export const formulatorRoutes: RouteObject = {
  Component: lazy(() => import("@/core/layouts/formulator-layout")),
  children: [
    // Dashboard
    {
      index: true,
      Component: lazy(() => import("@/modules/formulator/features/dashboard")),
    },

    // Formulations Routes
    {
      path: FORMULATOR_ROUTES.FORMULATIONS.DECODE,
      Component: lazy(
        () => import("@/modules/formulator/features/formulations/DecodeFormulations"),
      ),
    },

    // Create A Wish Route
    {
      path: FORMULATOR_ROUTES.CREATE_WISH.BASE,
      Component: lazy(() => import("@/modules/formulator/features/create-wish")),
    },

    // Market Research Route
    {
      path: FORMULATOR_ROUTES.MARKET_RESEARCH.BASE,
      Component: lazy(() => import("@/modules/formulator/features/market-research")),
    },

    // Compare Route
    {
      path: FORMULATOR_ROUTES.COMPARE.BASE,
      Component: lazy(() => import("@/modules/formulator/features/compare")),
    },

    // Account Route
    {
      path: FORMULATOR_ROUTES.ACCOUNT.BASE,
      Component: lazy(() => import("@/modules/formulator/features/account")),
    },

    // Cost Calculator Route
    {
      path: FORMULATOR_ROUTES.COST_CALCULATOR.BASE,
      Component: lazy(() => import("@/modules/formulator/features/cost-calculator")),
    },

    // Substitution Finder Route
    {
      path: FORMULATOR_ROUTES.SUBSTITUTION_FINDER.BASE,
      Component: lazy(() => import("@/modules/formulator/features/substitution-finder")),
    },

    // Inspiration Boards Route
    {
      path: FORMULATOR_ROUTES.INSPIRATION_BOARDS.BASE,
      Component: lazy(() => import("@/modules/formulator/features/inspiration-boards")),
    },
  ],
};

