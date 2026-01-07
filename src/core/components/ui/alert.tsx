import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import { cn } from "@/core/utils/index";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        warning:
          "bg-yellow-50 text-yellow-600 border-yellow-300 [&>svg]:text-yellow-600 *:data-[slot=alert-description]:text-yellow-600/90",
        info: "bg-blue-50 text-blue-600 border-blue-300 [&>svg]:text-blue-600 *:data-[slot=alert-description]:text-blue-600/90",
        destructive:
          "text-destructive bg-destructive/5 [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90 border-destructive/30",
        success:
          "bg-green-50 text-green-600 border-green-300 [&>svg]:text-green-600 *:data-[slot=alert-description]:text-green-600/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// New Alert component with built-in icons and better variant handling
function Alert({
  className,
  variant = "default",
  title,
  description,
  icon,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    title?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
  }) {
  const getDefaultIcon = () => {
    switch (variant) {
      case "destructive":
        return <ExclamationCircleIcon />;
      case "warning":
        return <ExclamationTriangleIcon />;
      case "info":
        return <InformationCircleIcon />;
      case "success":
        return <CheckCircleIcon />;
      default:
        return null;
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {displayIcon}
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
      {children}
    </div>
  );
}

// Renamed existing Alert component to AlertBase
function AlertBase({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-medium", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertBase, AlertTitle, AlertDescription };
