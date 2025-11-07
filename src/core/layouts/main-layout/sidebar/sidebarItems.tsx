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
import { SELLER_ROUTES } from "@/modules/seller/routes/constant";
import {
  ChartBarIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import type { MatchMode } from "@/modules/auth/components/guard";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

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
      "orders",
      "products",
      "customers",
      "brandPartners",
      "marketing",
      "analytics",
      "app",
      "settings",
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
  orders: {
    name: "Orders",
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
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>
    ),
    children: ["allOrders" /* , "draftOrders" */],
  },
  allOrders: {
    name: "All Orders",
    href: PANEL_ROUTES.ORDER.LIST,
    requiredPermission: {
      page: PAGE.ORDERS,
      action: [PERMISSION.VIEW, PERMISSION.CREATE],
    },
  },
  // draftOrders: {
  //   name: "Draft Orders",
  //   href: PANEL_ROUTES.ORDER.LIST + "?status=draft",
  //   requiredPermission: {
  //     page: PAGE.ORDERS,
  //     action: [PERMISSION.VIEW, PERMISSION.CREATE],
  //   },
  // },
  products: {
    name: "Products",
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
    children: ["allProducts", "catalog", "productCategories", "productTags", "productAttributes"],
  },
  allProducts: {
    name: "All Products",
    href: "/listing",
    requiredPermission: {
      page: PAGE.PRODUCTS,
      action: [PERMISSION.VIEW, PERMISSION.CREATE],
    },
  },
  catalog: {
    name: "Catalog",
    href: PANEL_ROUTES.LISTING.CATALOG_LIST,
    requiredRoles: [ROLE.ADMIN],
  },
  customers: {
    name: "Customers",
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
    children: ["allCustomers", "customerSegments", "customerReviews", "customerRoutines"],
  },
  allCustomers: {
    name: "All Customers",
    href: PANEL_ROUTES.CUSTOMER.LIST,
    requiredRoles: [ROLE.ADMIN],
  },
  customerSegments: {
    name: "Segments",
    href: PANEL_ROUTES.CUSTOMER.LIST + "?view=segments",
    requiredRoles: [ROLE.ADMIN],
  },
  customerReviews: {
    name: "Reviews",
    href: PANEL_ROUTES.CUSTOMER.LIST + "?view=reviews",
    requiredRoles: [ROLE.ADMIN],
  },
  customerRoutines: {
    name: "Routines",
    href: PANEL_ROUTES.CUSTOMER.LIST + "?view=routines",
    requiredRoles: [ROLE.ADMIN],
  },
  companies: {
    name: "Companies",
    href: PANEL_ROUTES.COMPANY.LIST,
    requiredPermission: {
      page: PAGE.COMPANIES,
      action: [PERMISSION.VIEW],
    },
    requiredRoles: [ROLE.ADMIN],
  },
  brandPartners: {
    name: "Brand Partners",
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
    children: ["brandDiscover", "companies", "brandOnboarding"],
  },
  brandDiscover: {
    name: "Brands",
    href: PANEL_ROUTES.BRAND.LIST,
    requiredPermission: {
      page: PAGE.BRANDS,
      action: [PERMISSION.VIEW],
    },
  },
  brandOnboarding: {
    name: "Onboarding",
    href: PANEL_ROUTES.ONBOARD.COMPANY,
    requiredRoles: [ROLE.ADMIN],
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
  marketing: {
    name: "Marketing",
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
    children: ["discountCoupons", "promotions", "surveys"],
  },
  analytics: {
    name: "Analytics",
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
      "platform",
      "brand",
      "ecommerce",
      "ingredients",
    ],
  },
  platform: {
    name: "Platform",
    href: ANALYTICS_ROUTES.PLATFORM.BASE,
    requiredRoles: [ROLE.ADMIN],
  },
  brand: {
    name: "Brand",
    href: ANALYTICS_ROUTES.BRAND.BASE,
    requiredRoles: [ROLE.ADMIN],
  },
  ecommerce: {
    name: "Ecommerce",
    href: ANALYTICS_ROUTES.ECOMMERCE.BASE,
    requiredRoles: [ROLE.ADMIN],
  },
  ingredients: {
    name: "Ingredients",
    href: ANALYTICS_ROUTES.INGREDIENT.BASE,
    requiredRoles: [ROLE.ADMIN],
  },
  app: {
    name: "App",
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
    children: ["formulationLooker", "chat", "faceAnalysis"],
  },
  

  surveys: {
    name: "Surveys",
    href: SURVEY_ROUTES.LIST,
    requiredRoles: [ROLE.ADMIN],
  },
  promotions: {
    name: "Promotions",
    href: "/promo",
    requiredRoles: [ROLE.ADMIN],
  },
  formulationLooker: {
    name: "Formulation Looker",
    href: PANEL_ROUTES.INGREDIENT_DETAILS,
    requiredRoles: [ROLE.ADMIN],
  },
  chat: {
    name: "Chat",
    href: PANEL_ROUTES.CHAT,
    requiredRoles: [ROLE.ADMIN],
  },
  faceAnalysis: {
    name: "Face Analysis",
    href: PANEL_ROUTES.FACE_ANALYSIS,
    requiredRoles: [ROLE.ADMIN],
  },
  settings: {
    name: "Settings",
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
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
    children: ["companyManagement", "userRolesPermissions", "apiIntegrations", "notificationsEmailTemplates"],
  },
  companyManagement: {
    name: "Company Management",
    href: "/settings/company-management",
    requiredPermission: {
      page: PAGE.COMPANIES,
      action: [PERMISSION.VIEW],
    },
  },
  userRolesPermissions: {
    name: "User Roles & Permissions",
    href: "/settings/user-roles-permissions",
    requiredPermission: {
      page: PAGE.USERS,
      action: [PERMISSION.VIEW],
    },
    requiredRoles: [ROLE.ADMIN],
  },
  apiIntegrations: {
    name: "API / Integrations",
    href: "/api-integrations",
    requiredRoles: [ROLE.ADMIN],
  },
  notificationsEmailTemplates: {
    name: "Notifications / Email Templates",
    href: "/notifications",
    requiredRoles: [ROLE.ADMIN],
  },
};

export const sellerSidebarItems: Readonly<Record<string, SidebarItem>> = {
  sidebar: {
    name: "sidebar",
    children: [
      "dashboard",
      "orders",
      "products",
      "brands",
      "marketing",
      "analytics",
      "users",
      "settings",
    ],
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
    children: ["all-products", "catalog"],
  },
  "all-products": {
    name: "All Products",
    href: SELLER_ROUTES.PRODUCTS.LIST,
  },
  catalog: {
    name: "Catalog",
    href: "/catalog",
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
  marketing: {
    name: "marketing",
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
    children: ["discount-coupons"],
  },
  "discount-coupons": {
    name: "Discount Coupons",
    href: SELLER_ROUTES.MARKETING.DISCOUNT_COUPONS.LIST,
  },
  // TODO: Uncomment when survey functionality is ready
  // surveys: {
  //   name: "Surveys",
  //   href: SELLER_ROUTES.MARKETING.SURVEYS.LIST,
  // },
  // TODO: Uncomment when promotion functionality is ready
  // promotions: {
  //   name: "Promotions",
  //   href: SELLER_ROUTES.MARKETING.PROMOTIONS.LIST,
  // },
  analytics: {
    name: "analytics",
    icon: <ChartBarIcon />,
    children: [
      "sales-insights",
      "ingredient-insights", 
      "brand-insights",
      "customer-insights",
      "market-trends",
      "ecommerce-analytics"
    ],
  },
  "sales-insights": {
    name: "Sales Insights",
    href: SELLER_ROUTES.ANALYTICS.SALES_INSIGHTS.BASE,
  },
  "ingredient-insights": {
    name: "Ingredient Insights",
    href: SELLER_ROUTES.ANALYTICS.INGREDIENT_INSIGHTS.BASE,
  },
  "brand-insights": {
    name: "Brand Insights",
    href: SELLER_ROUTES.ANALYTICS.BRAND_INSIGHTS.BASE,
  },
  "customer-insights": {
    name: "Customer Insights",
    href: SELLER_ROUTES.ANALYTICS.CUSTOMER_INSIGHTS.BASE,
  },
  "market-trends": {
    name: "Market Trends",
    href: SELLER_ROUTES.ANALYTICS.MARKET_TRENDS.BASE,
  },
  "ecommerce-analytics": {
    name: "Ecommerce Analytics",
    href: ANALYTICS_ROUTES.ECOMMERCE.DASHBOARD,
  },
  users: {
    name: "users",
    href: SELLER_ROUTES.USERS.LIST(),
    icon: <UserIcon />,
  },
    settings: {
      name: "settings",
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
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      ),
      children: ["permissions-settings", "preferences-settings"],
    },
  "permissions-settings": {
    name: "Permissions",
    href: SELLER_ROUTES.USER_SETTINGS.PERMISSIONS.BASE,
  },
  "preferences-settings": {
    name: "Preferences",
    href: SELLER_ROUTES.USER_SETTINGS.PREFERENCES.BASE,
  },
};
