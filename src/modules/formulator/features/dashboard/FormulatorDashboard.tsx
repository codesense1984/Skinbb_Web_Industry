import { BlobIcon, Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { useMotionConfig } from "@/core/store/motion-provider";
import { fadeInUp } from "@/core/styles/animation/presets";
import { cn } from "@/core/utils";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { motion } from "motion/react";
import { Fragment, type ReactElement, type SVGProps } from "react";
import { NavLink } from "react-router";
import { FORMULATOR_ROUTES } from "../../routes/constant";
import FormulatorChatbot from "../../components/FormulatorChatbot";

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

const FormulatorDashboard = () => {
  const { user } = useAuth();

  const cardData = [
    {
      title: "Decode Formulations",
      description: "Analyze and decode existing formulations with detailed ingredient breakdown",
      buttons: [{ name: "Decode", href: FORMULATOR_ROUTES.FORMULATIONS.DECODE }],
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
            d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232 1.232 3.228 0 4.46s-3.228 1.232-4.46 0l-1.403-1.403m-4.46 0-1.402 1.402c-1.232 1.232-3.228 1.232-4.46 0s-1.232-3.228 0-4.46l1.403-1.403m0 0L3.98 8.807m5.464-4.31a2.25 2.25 0 0 1 1.591-.659h4.83a2.25 2.25 0 0 1 1.591.659l1.83 1.83c.926.926 1.591 2.191 1.591 3.515v8.67a2.25 2.25 0 0 1-.659 1.591l-1.83 1.83c-.926.926-2.191 1.591-3.515 1.591h-4.83a2.25 2.25 0 0 1-1.591-.659l-1.83-1.83a4.5 4.5 0 0 1-1.591-3.515V8.807m5.464 4.31-1.591-1.591-1.591 1.591m1.591-1.591v8.67"
          />
        </svg>
      ),
    },
    {
      title: "Market Research",
      description: "Find products with matching ingredients",
      buttons: [{ name: "Search Products", href: FORMULATOR_ROUTES.MARKET_RESEARCH.BASE }],
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
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          />
        </svg>
      ),
    },
    {
      title: "Compare",
      description: "Compare ingredients from two different product URLs",
      buttons: [{ name: "Compare", href: FORMULATOR_ROUTES.COMPARE.BASE }],
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
            d="M16.5 18.75h-8.25m-4.5 0h-1.5m0 0v-1.5m0 1.5h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0h-1.5m8.25 0h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0h-1.5m8.25 0h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0h-1.5m-8.25-3h8.25m-4.5 0h-1.5m0 0v-1.5m0 1.5h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0h-1.5m8.25 0h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0h-1.5m-8.25-3h8.25m-4.5 0h-1.5m0 0v-1.5m0 1.5h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0h-1.5m8.25 0h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0h-1.5m-8.25-3h8.25m-4.5 0h-1.5m0 0v-1.5m0 1.5h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0h-1.5m8.25 0h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0v-1.5m0 1.5h1.5m-1.5 0h-1.5"
          />
        </svg>
      ),
    },
    {
      title: "Create A Wish",
      description: "Describe your dream product and let AI design the perfect formula",
      buttons: [{ name: "Create Wish", href: FORMULATOR_ROUTES.CREATE_WISH.BASE }],
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
      title: "Cost Calculator",
      description: "Calculate detailed costs for your formulations with batch analysis and pricing scenarios",
      buttons: [{ name: "Calculate", href: FORMULATOR_ROUTES.COST_CALCULATOR.BASE }],
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
            d="M12 6v12m-3-3h6m-9-3a9 9 0 1 1 18 0 9 9 0 1 1-18 0Z"
          />
        </svg>
      ),
    },
    {
      title: "Substitution Finder",
      description: "Find alternative ingredients with detailed comparisons and usage recommendations",
      buttons: [{ name: "Find Substitutes", href: FORMULATOR_ROUTES.SUBSTITUTION_FINDER.BASE }],
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
            d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
          />
        </svg>
      ),
    },
    {
      title: "Inspiration Boards",
      description: "Collect, analyze, and compare competitor products with detailed ingredient breakdowns",
      buttons: [{ name: "View Boards", href: FORMULATOR_ROUTES.INSPIRATION_BOARDS.BASE }],
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
          />
        </svg>
      ),
    },
  ];

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
          "Your formulator dashboard — decode existing formulations, do market research, compare products, and more.",
        hasBack: false,
        animate: true,
      }}
    >
      {/* Updates Banner */}
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
          <h5 className="mb-1 font-medium">Updates & Announcements</h5>
          <p>Stay informed with the latest formulation updates and regulatory changes</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {cardData.map(({ title, description, buttons, icon }, index) => (
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

      {/* Formulator Chatbot */}
      <FormulatorChatbot />
    </PageContent>
  );
};

export default FormulatorDashboard;

