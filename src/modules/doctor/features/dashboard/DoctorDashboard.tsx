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
import { DOCTOR_ROUTES } from "../../routes/constant";

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
    title: "Doctor Chatroom",
    description: "Connect and communicate with other doctors",
    buttons: [{ name: "Open Chatroom", href: DOCTOR_ROUTES.CHATROOM.LIST }],
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
    title: "BrandConnect",
    description: "Engage with brands through surveys and inquiries",
    buttons: [
      { name: "Survey", href: DOCTOR_ROUTES.BRANDCONNECT.SURVEY.LIST },
      { name: "Inquiry", href: DOCTOR_ROUTES.BRANDCONNECT.INQUIRY.LIST },
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
    title: "Promotion",
    description: "Manage and view promotional campaigns",
    buttons: [{ name: "View Promotions", href: DOCTOR_ROUTES.PROMOTION.LIST }],
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
    title: "Community (Educate)",
    description: "Share knowledge and educate the community",
    buttons: [{ name: "Explore", href: DOCTOR_ROUTES.COMMUNITY.LIST }],
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
          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
  {
    title: "Create Content",
    description: "Create and manage your content",
    buttons: [{ name: "Create", href: DOCTOR_ROUTES.CONTENT.CREATE }],
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
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
        />
      </svg>
    ),
  },
  {
    title: "CMS Analytics",
    description: "View comprehensive analytics and insights",
    buttons: [
      { name: "View Analytics", href: DOCTOR_ROUTES.ANALYTICS.CMS.BASE },
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
    title: "Rewards",
    description: "Track your rewards from surveys and customer transfers",
    buttons: [
      { name: "Survey Rewards", href: DOCTOR_ROUTES.REWARDS.SURVEY.LIST },
      {
        name: "Customer Transfer",
        href: DOCTOR_ROUTES.REWARDS.CUSTOMER_TRANSFER.LIST,
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
          d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5V12m2.25-4.125A2.625 2.625 0 1 1 14.625 7.5V12m-8.25 3.75h16.5M12 15.75v-8.25"
        />
      </svg>
    ),
  },
];

const DoctorDashboard = () => {
  const { user } = useAuth();

  // Show all cards for doctor role - no permission filtering needed
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
          "Your dashboard is ready — explore insights, manage your content, and connect with the community.",
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

export default DoctorDashboard;

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
