import { BlobIcon, Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { useMotionConfig } from "@/core/store/motion-provider";
import { fadeInUp } from "@/core/styles/animation/presets";
import { cn } from "@/core/utils";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  type Permission,
  type PermissionElement,
  type Role,
} from "@/modules/auth/types/permission.type.";
import type { MatchMode } from "@/modules/auth/components/guard";
import { motion } from "motion/react";
import { Fragment, type ReactElement, type SVGProps } from "react";
import { NavLink } from "react-router";
import { MANUFACTURER_ROUTES } from "../../routes/constant";

type CardConfig = {
  title: string;
  description: string;
  buttons: ButtonLink[];
  icon: ReactElement<SVGProps<SVGSVGElement>>;
  requiredRoles?: Role[];
  requiredPermissions?: {
    page: Permission["page"];
    action?: PermissionElement | ReadonlyArray<PermissionElement>;
    mode?: MatchMode;
  };
};

const cardData: CardConfig[] = [
  {
    title: "Product Management",
    description: "Manage products, formulations, ingredients, and regulatory documents",
    buttons: [
      { name: "All Products", href: MANUFACTURER_ROUTES.PRODUCTS.ALL },
      { name: "Formulations", href: MANUFACTURER_ROUTES.PRODUCTS.FORMULATIONS },
      { name: "Ingredients", href: MANUFACTURER_ROUTES.PRODUCTS.INGREDIENTS_LIBRARY },
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={0.7}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.46-.662M4.5 12l3 3m-3-3-3 3"
        />
      </svg>
    ),
  },
  {
    title: "Production & Batch",
    description: "Create batches, track production, and manage quality reports",
    buttons: [
      { name: "Create Batch", href: MANUFACTURER_ROUTES.PRODUCTION.CREATE_BATCH },
      { name: "Batch Tracking", href: MANUFACTURER_ROUTES.PRODUCTION.BATCH_TRACKING },
      { name: "Quality Reports", href: MANUFACTURER_ROUTES.PRODUCTION.QUALITY_REPORTS },
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={0.7}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
        />
      </svg>
    ),
  },
  {
    title: "Inventory",
    description: "Track raw materials, packaging, and finished goods inventory",
    buttons: [
      { name: "Raw Materials", href: MANUFACTURER_ROUTES.INVENTORY.RAW_MATERIAL },
      { name: "Packaging", href: MANUFACTURER_ROUTES.INVENTORY.PACKAGING },
      { name: "Finished Goods", href: MANUFACTURER_ROUTES.INVENTORY.FINISHED_GOODS },
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={0.7}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
        />
      </svg>
    ),
  },
  {
    title: "Orders",
    description: "Manage purchase orders, distributor orders, and fulfillment",
    buttons: [
      { name: "Purchase Orders", href: MANUFACTURER_ROUTES.ORDERS.PURCHASE_ORDERS },
      { name: "Distributor Orders", href: MANUFACTURER_ROUTES.ORDERS.DISTRIBUTOR_ORDERS },
      { name: "Fulfillment", href: MANUFACTURER_ROUTES.ORDERS.FULFILLMENT },
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={0.7}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>
    ),
  },
  {
    title: "Supplier Management",
    description: "Manage approved suppliers, onboarding, and compliance",
    buttons: [
      { name: "Approved Suppliers", href: MANUFACTURER_ROUTES.SUPPLIERS.APPROVED },
      { name: "Onboarding", href: MANUFACTURER_ROUTES.SUPPLIERS.ONBOARDING },
      { name: "Ratings", href: MANUFACTURER_ROUTES.SUPPLIERS.RATINGS },
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={0.7}
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
  {
    title: "Compliance & QA",
    description: "Manage QA reports, stability studies, and compliance checklists",
    buttons: [
      { name: "QA Reports", href: MANUFACTURER_ROUTES.COMPLIANCE.QA_REPORTS },
      { name: "Stability Studies", href: MANUFACTURER_ROUTES.COMPLIANCE.STABILITY_STUDIES },
      { name: "Audit Logs", href: MANUFACTURER_ROUTES.COMPLIANCE.AUDIT_LOGS },
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={0.7}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
        />
      </svg>
    ),
  },
  {
    title: "Brand Collaboration",
    description: "Manage OEM requests, brand briefs, and formulation requests",
    buttons: [
      { name: "OEM Requests", href: MANUFACTURER_ROUTES.BRAND_COLLABORATION.OEM_REQUESTS },
      { name: "Brand Briefs", href: MANUFACTURER_ROUTES.BRAND_COLLABORATION.BRAND_BRIEFS },
      { name: "Formulation Requests", href: MANUFACTURER_ROUTES.BRAND_COLLABORATION.FORMULATION_REQUESTS },
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={0.7}
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
  {
    title: "Marketing Support",
    description: "Manage product media, marketing kits, and content library",
    buttons: [
      { name: "Media Files", href: MANUFACTURER_ROUTES.MARKETING.MEDIA_FILES },
      { name: "Marketing Kits", href: MANUFACTURER_ROUTES.MARKETING.MARKETING_KITS },
      { name: "Content Library", href: MANUFACTURER_ROUTES.MARKETING.CONTENT_LIBRARY },
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={0.7}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
        />
      </svg>
    ),
  },
  {
    title: "Analytics",
    description: "View production analytics, COGS, and demand forecasts",
    buttons: [
      { name: "Production Analytics", href: MANUFACTURER_ROUTES.ANALYTICS.PRODUCTION },
      { name: "COGS", href: MANUFACTURER_ROUTES.ANALYTICS.COGS },
      { name: "Demand Forecast", href: MANUFACTURER_ROUTES.ANALYTICS.DEMAND_FORECAST },
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={0.7}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
        />
      </svg>
    ),
  },
  {
    title: "Communication",
    description: "Chat with brands, distributors, and manage support tickets",
    buttons: [
      { name: "Brand Chats", href: MANUFACTURER_ROUTES.COMMUNICATION.BRAND_CHATS },
      { name: "Distributor Chats", href: MANUFACTURER_ROUTES.COMMUNICATION.DISTRIBUTOR_CHATS },
      { name: "Support Tickets", href: MANUFACTURER_ROUTES.COMMUNICATION.SUPPORT_TICKETS },
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={0.7}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
        />
      </svg>
    ),
  },
  {
    title: "Finance",
    description: "Manage payouts, expenses, cost sheets, and pricing",
    buttons: [
      { name: "Payouts", href: MANUFACTURER_ROUTES.FINANCE.PAYOUTS },
      { name: "Expense Tracking", href: MANUFACTURER_ROUTES.FINANCE.EXPENSE_TRACKING },
      { name: "Cost Sheets", href: MANUFACTURER_ROUTES.FINANCE.COST_SHEETS },
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={0.7}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v5.25c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
  },
];

const ManufacturerDashboard = () => {
  const { user } = useAuth();

  // Show all cards for manufacturer role - no permission filtering needed
  const visibleCards = cardData;

  return (
    <PageContent
      ariaLabel="dashboard"
      header={{
        title: (
          <div>
            Hi, Welcome back,{" "}
            <span className="text-primary">
              {user?.firstName} {user?.lastName}
            </span>{" "}
            👋
          </div>
        ),
        description:
          "Your manufacturer dashboard is ready — manage production, inventory, compliance, and track your manufacturing operations.",
        hasBack: false,
        animate: true,
      }}
    >
      {/* News/Updates Banner */}
      <motion.div
        {...fadeInUp}
        className="mb-6 w-full bg-background flex flex-col items-center gap-3 rounded-lg py-7 px-6 shadow-md"
      >
        <BlobIcon size="lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={0.7}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v4.5H6v-4.5Z"
            />
          </svg>
        </BlobIcon>
        <div className="flex flex-col items-center text-center">
          <h5 className="mb-1 font-medium">News & Updates</h5>
          <p>Stay informed with the latest announcements and important updates</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {visibleCards.map(({ title, description, buttons, icon }, index) => (
          <Card
            key={title}
            title={title}
            description={description}
            buttons={buttons}
            icon={icon}
            index={index}
          />
        ))}
      </div>
    </PageContent>
  );
};

export default ManufacturerDashboard;

type ButtonLink = {
  name: string;
  href: string;
};
interface CardProps {
  title: string;
  description: string;
  buttons: ButtonLink[];
  icon: ReactElement<SVGProps<SVGSVGElement>>;
  index: number;
}

const Card = ({ title, description, buttons, icon, index }: CardProps) => {
  const { reducedMotion } = useMotionConfig();
  const delay = reducedMotion ? 0 : Math.max(0, index) * 0.06;

  const containerMotion = {
    ...fadeInUp,
    transition: { ...fadeInUp.transition, delay },
  };

  const element = (
    <>
      <BlobIcon size="lg">{icon}</BlobIcon>
      <div className="flex flex-col items-center text-center">
        <h5 className="mb-1 font-medium">{title}</h5>
        <p className="mb-4 text-sm leading-relaxed">{description}</p>
        <div className="divide-primary/20 divide-y-0.5 grid auto-cols-max grid-flow-col items-center">
          {buttons.map((link, index) => (
            <Fragment key={link.name}>
              <Button
                key={link.name}
                color={"primary"}
                variant={"link"}
                asChild
                className="text-xs"
              >
                {buttons.length !== 1 ? (
                  <NavLink to={link.href}>{link.name}</NavLink>
                ) : (
                  <span>{link.name}</span>
                )}
              </Button>
              {buttons.length - 1 !== index && (
                <hr className="bg-border h-5 w-0.5" />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );

  const className =
    "bg-background hover:ring-primary visited:ring-3 visited:ring-primary flex flex-col items-center gap-3 rounded-lg py-7 px-6 shadow-md hover:ring-3";

  if (buttons.length === 1) {
    return (
      <motion.div {...containerMotion} role="group">
        <NavLink
          to={buttons[0].href}
          className={cn("text-foreground no-underline", className)}
        >
          {element}
        </NavLink>
      </motion.div>
    );
  }

  return (
    <motion.div {...containerMotion} className={className}>
      {element}
    </motion.div>
  );
};

