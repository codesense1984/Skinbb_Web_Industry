import { cn } from "@/core/utils";
import React, {
  useEffect,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { Button } from "./button";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { fadeInUp } from "@/core/styles/animation/presets";

type PageContentProps = {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
  noPadding?: boolean;
  header?: PageHeaderProps;
  hideGradient?: boolean;
  showBorder?: boolean;
};

export function PageContent({
  as: Tag = "div",
  children,
  className,
  header,
  ariaLabel = "Page content",
  noPadding,
  hideGradient = false,
  showBorder = false,
}: PageContentProps) {
  return (
    <Tag
      aria-label={ariaLabel}
      className={cn(
        "min-h-[calc(100dvh-56px)] rounded-t-md inset-shadow-sm md:gap-6",
        !hideGradient &&
          "bg-linear-150 from-[#FFBCA850] via-[#FAFAFA70] to-[#DBD3FF70]",
        showBorder && "border-t border-l",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex min-h-[calc(100dvh-56px)] max-w-7xl flex-col gap-4",
          !noPadding && "p-4 md:p-6",
        )}
      >
        {header && <PageHeader {...header} />}
        {children}
      </div>
    </Tag>
  );
}

type PageHeaderProps = {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  hasBack?: boolean;
  fallbackBackUrl?: string;
  className?: string;
  backLink?: string;
  animate?: boolean;
};

export const PageHeader = ({
  title,
  description,
  actions,
  hasBack = true,
  fallbackBackUrl = "/",
  className,
  backLink,
  animate = false,
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 2);
  }, []);

  const handleBack = () => {
    if (backLink) {
      navigate(backLink);
    } else if (canGoBack) {
      navigate(-1);
    } else {
      navigate(fallbackBackUrl);
    }
  };

  if (!title && !description && !actions) return null;

  return (
    <motion.header
      {...(animate && fadeInUp)}
      className={cn(
        "flex flex-wrap items-center justify-between gap-2",
        className,
      )}
    >
      <div>
        {title && hasBack && canGoBack ? (
          <div className="flex items-center gap-2">
            <Button
              className="border-muted-foreground"
              variant="ghost"
              color="default"
              size="icon"
              onClick={handleBack}
              aria-label="Go back"
            >
              <ArrowLeftIcon />
            </Button>
            <h4>{title}</h4>
          </div>
        ) : (
          <h4>{title}</h4>
        )}
        {description && <p>{description}</p>}
      </div>
      {actions}
    </motion.header>
  );
};

type ContainerProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  id?: string;
  ariaLabelledBy?: string;
};

export function Container({
  as: Tag = "div",
  children,
  className,
  noPadding = false,
  id,
  ariaLabelledBy,
}: ContainerProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "bg-background w-full rounded-md",
        !noPadding && "p-4 md:p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
