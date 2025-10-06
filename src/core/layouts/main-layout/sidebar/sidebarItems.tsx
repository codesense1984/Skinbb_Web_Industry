import { ROUTES } from "@/core/routes/constant";
import {
  PAGE,
  PERMISSION,
  ROLE,
  type Permission,
  type Role,
} from "@/modules/auth/types/permission.type.";
import { ANALYTICS_ROUTES } from "@/modules/analytics/routes/constants";
import { SURVEY_ROUTES } from "@/modules/survey/routes/constant";
import {
  BoltIcon,
  BuildingStorefrontIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import type { MatchMode } from "@/modules/auth/components/guard";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { SELLER_ROUTES } from "@/modules/seller";

export interface SidebarItem {
  name: string;
  href?: string;
  children?: string[];
  icon?: React.ReactNode;
  requiredRoles?: Role[];
  requiredPermission?: Permission & {
    mode?: MatchMode;
  };
}

export const panelSidebarItems: Readonly<Record<string, SidebarItem>> = {
  sidebar: {
    name: "sidebar",
    children: [
      "dashboard",
      "brands",
      "company",
      "masterData",
      "analytics",
      "surveys",
      "promotions",
      "listing",
      "customers",
      "chat",
      "formulationLooker",
    ],
  },
  dashboard: {
    name: "dashboard",
    href: ROUTES.DASHBOARD,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
        />
      </svg>
    ),
  },
  brands: {
    name: "brands",
    requiredPermission: {
      page: PAGE.BRANDS,
      action: [PERMISSION.VIEW],
    },
    href: PANEL_ROUTES.BRAND.LIST,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
        />
      </svg>
    ),
  },
  company: {
    name: "company",
    href: PANEL_ROUTES.COMPANY.LIST,
    // requiredRoles: [ROLE.ADMIN],
    requiredPermission: {
      page: PAGE.COMPANIES,
      action: [PERMISSION.VIEW],
    },
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M3.75 5.25h16.5m-16.5 0a3 3 0 0 1 3-3h10.5a3 3 0 0 1 3 3v.75H3.75V5.25Z"
        />
      </svg>
    ),
  },
  masterData: {
    name: "Master Data",
    requiredRoles: [ROLE.ADMIN],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 6h.008v.008H6V6Z"
        />
      </svg>
    ),
    children: [
      "productCategories",
      "productTags",
      "productAttributes",
      "discountCoupons",
    ],
  },
  productCategories: {
    name: "Product Categories",
    href: PANEL_ROUTES.MASTER.PRODUCT_CATEGORY,
    requiredRoles: [ROLE.ADMIN],
  },
  productTags: {
    name: "Product Tags",
    href: PANEL_ROUTES.MASTER.PRODUCT_TAG,
    requiredRoles: [ROLE.ADMIN],
  },
  productAttributes: {
    name: "Product Attributes",
    href: PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE,
    requiredRoles: [ROLE.ADMIN],
  },
  discountCoupons: {
    name: "Discount Coupons",
    href: PANEL_ROUTES.MASTER.DISCOUNT_COUPON,
    requiredRoles: [ROLE.ADMIN],
  },
  analytics: {
    name: "analytics",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
        />
      </svg>
    ),
    children: [
      "platform analysis",
      "brand analysis",
      "user insight",
      "market trends",
      "ingredient analysis",
      "ecommerce analysis",
    ],
  },
  "platform analysis": {
    name: "Platform insight",
    href: ANALYTICS_ROUTES.PLATFORM.BASE,
    requiredRoles: [ROLE.ADMIN],
  },
  "brand analysis": {
    name: "Brand insight",
    href: ANALYTICS_ROUTES.BRAND.BASE,
    requiredRoles: [ROLE.ADMIN],
  },
  "user insight": {
    name: "user insight",
    href: "/user-insight",
    requiredRoles: [ROLE.ADMIN],
  },
  "market trends": {
    name: "market trends",
    href: "/market-trends",
    requiredRoles: [ROLE.ADMIN],
  },
  "ingredient analysis": {
    name: "Ingredient insight",
    href: ANALYTICS_ROUTES.INGREDIENT.BASE,
    requiredRoles: [ROLE.ADMIN],
  },
  "ecommerce analysis": {
    name: "Ecommerce insight",
    href: ANALYTICS_ROUTES.ECOMMERCE.BASE,
    requiredRoles: [ROLE.ADMIN],
  },
  listing: {
    name: "listing",
    href: "/listing",
    requiredPermission: {
      page: PAGE.PRODUCTS,
      action: [PERMISSION.VIEW, PERMISSION.CREATE],
    },
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.46-.662M4.5 12l3 3m-3-3-3 3"
        />
      </svg>
    ),
    children: ["products", "orders", "coupons"],
  },

  products: {
    name: "Products",
    href: "/listing",
    requiredPermission: {
      page: PAGE.PRODUCTS,
      action: [PERMISSION.VIEW, PERMISSION.CREATE],
    },
  },
  orders: {
    name: "Orders",
    href: PANEL_ROUTES.ORDER.LIST,
    requiredPermission: {
      page: PAGE.ORDERS,
      action: [PERMISSION.VIEW, PERMISSION.CREATE],
    },
  },
  coupons: {
    name: "Coupons",
    href: "/listing",
    requiredPermission: {
      page: PAGE.COUPONS,
      action: [PERMISSION.VIEW, PERMISSION.CREATE],
    },
  },

  surveys: {
    name: "brand surveys",
    requiredRoles: [ROLE.ADMIN],

    href: SURVEY_ROUTES.LIST,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      </svg>
    ),
  },
  promotions: {
    name: "promotions",
    href: "/promo",
    requiredRoles: [ROLE.ADMIN],

    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
  },

  customers: {
    name: "customers",
    href: PANEL_ROUTES.CUSTOMER.LIST,
    requiredRoles: [ROLE.ADMIN],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      </svg>
    ),
  },
  chat: {
    name: "chat",
    href: PANEL_ROUTES.CHAT,
    icon: <BoltIcon />,
    requiredRoles: [ROLE.ADMIN],
  },
  formulationLooker: {
    name: "Formulation Looker",
    href: PANEL_ROUTES.INGREDIENT_DETAILS,
    requiredRoles: [ROLE.ADMIN],
    icon: <BuildingStorefrontIcon />,
  },
};

export const sellerSidebarItems: Readonly<Record<string, SidebarItem>> = {
  sidebar: {
    name: "sidebar",
    children: ["dashboard", "products", "orders", "brands", "users"],
  },
  dashboard: {
    name: "dashboard",
    href: SELLER_ROUTES.DASHBOARD.HOME,
    icon: <HomeIcon />,
  },
  products: {
    name: "products",
    href: SELLER_ROUTES.PRODUCTS.LIST,
    icon: <ShoppingBagIcon />,
  },
  orders: {
    name: "orders",
    href: SELLER_ROUTES.ORDERS.LIST,
    icon: <ShoppingBagIcon />,
  },
  brands: {
    name: "brands",
    href: SELLER_ROUTES.SELLER_BRANDS.LIST,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
        />
      </svg>
    ),
  },
  users: {
    name: "users",
    href: SELLER_ROUTES.USERS.LIST(),
    icon: <UserIcon />,
  },
};
