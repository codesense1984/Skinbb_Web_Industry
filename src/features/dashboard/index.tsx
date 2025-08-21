import { BlobIcon, Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { useMotionConfig } from "@/core/store/motion-provider";
import { fadeInUp } from "@/core/styles/animation/presets";
import { cn } from "@/core/utils";
import { ANALYTICS_ROUTES } from "@/modules/analytics/routes/constants";
import { hasAccess, type MatchMode } from "@/modules/auth/components/guard";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  PAGE,
  PERMISSION,
  ROLE,
  type Permission,
  type PermissionElement,
  type Role,
} from "@/modules/auth/types/permission.type.";
import { SURVEY_ROUTES } from "@/modules/survey/routes/constant";
import { motion } from "motion/react";
import { Fragment, type ReactElement, type SVGProps } from "react";
import { NavLink } from "react-router";

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
    title: "Brands",
    description: "Discover top brands from around the world.",
    buttons: [{ name: "Explore", href: "/brands" }],
    requiredPermissions: {
      page: PAGE.BRANDS,
      action: [PERMISSION.VIEW, PERMISSION.CREATE],
    },
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
          d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
        />
      </svg>
    ),
  },
  {
    title: "Analytics",
    description: "Dive into user behavior, demographics, and performance",
    requiredRoles: [ROLE.ADMIN],
    buttons: [
      {
        name: "Platform",
        href: `${ANALYTICS_ROUTES.PLATFORM_ANALYTIC}`,
      },
      {
        name: "Brand",
        href: `${ANALYTICS_ROUTES.BRAND_ANALYTIC}`,
      },
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
    title: "Survey",
    description:
      "Explore trends, ingredient interest, and competitive landscape analysis",
    buttons: [{ name: "Explore", href: SURVEY_ROUTES.SURVEYS }],
    requiredRoles: [ROLE.ADMIN],
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
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      </svg>
    ),
  },
  {
    title: "Promotion",
    description:
      "Create targeted campaigns and track promotion performance in real-time",
    buttons: [{ name: "Explore", href: "/brands" }],
    requiredRoles: [ROLE.ADMIN],
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
    title: "Listing",
    description:
      "Manage your product catalog, pricing, descriptions and media assets",
    requiredPermissions: {
      page: PAGE.PRODUCTS,
      action: [PERMISSION.VIEW, PERMISSION.CREATE],
    },
    buttons: [{ name: "Explore", href: "/brands" }],
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
          d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
        />
      </svg>
    ),
  },
  {
    title: "Sales & Revenue",
    description:
      "Overview of earnings generated from product or service sales.",
    buttons: [{ name: "Explore", href: "/brands" }],
    requiredRoles: [ROLE.ADMIN],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={0.7}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
        />
      </svg>
    ),
  },
];

const Dashboard = () => {
  const { user, role, permissions } = useAuth();

  const visibleCards = cardData.filter((c) =>
    hasAccess({
      userRole: role,
      userPermissions: permissions,
      roles: c.requiredRoles,
      page: c.requiredPermissions?.page,
      actions: c.requiredPermissions?.action,
      mode: c.requiredPermissions?.mode ?? "any",
    }),
  );
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
          "Your dashboard is ready — explore insights, manage your listings, and grow your reach.",
        hasBack: false,
        animate: true,
      }}
    >
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

export default Dashboard;

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
        <p>{description}</p>
        <div className="divide-primary/20 divide-y-0.5 grid auto-cols-max grid-flow-col items-center">
          {buttons.map((link, index) => (
            <Fragment key={link.name}>
              <Button
                key={link.name}
                color={"primary"}
                variant={"link"}
                asChild
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
