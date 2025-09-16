import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { STATUS_MAP, type ModuleType } from "@/core/config/status";
import { cn } from "@/core/utils/index";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-sm font-medium w-fit shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

type StatusBadgeVariant = "default" | "label" | "badge" | "contained";

interface StatusBadgeProps extends React.ComponentProps<"div"> {
  module: ModuleType;
  status: string;
  variant?: StatusBadgeVariant;
  showDot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  module,
  status,
  variant = "default",
  className,
  showDot = true,
  ...props
}) => {
  const statusInfo = Object.values(STATUS_MAP[module])?.find(
    (item) => item.value === status,
  );

  if (!statusInfo) return "Not found";

  const { label, textColor, bgColor } = statusInfo;
  const colorClasses = cn(textColor, bgColor);

  switch (variant) {
    case "default":
      return (
        <div
          className={cn(
            "flex items-center gap-2",
            colorClasses,
            "bg-transparent",
            className,
          )}
          {...props}
        >
          {showDot && <span className="h-2 w-2 rounded-full bg-current" />}
          <span className="capitalize">{label}</span>
        </div>
      );

    case "label":
      return (
        <span
          className={cn(
            "text-sm font-medium capitalize",
            colorClasses,
            "bg-transparent",
            className,
          )}
          {...props}
        >
          {label}
        </span>
      );

    case "badge":
      return (
        <Badge
          variant={"outline"}
          className={cn(
            "capitalizela flex items-center gap-2",
            colorClasses,
            "bg-transparent",
            className,
          )}
        >
          {showDot && <span className="h-2 w-2 rounded-full bg-current" />}
          {label}
        </Badge>
      );
    case "contained":
      return (
        <Badge
          variant={"outline"}
          className={cn(
            "capitalizela flex items-center gap-2 border-current",
            colorClasses,
            // "bg-transparent",
            className,
          )}
        >
          {showDot && <span className="h-2 w-2 rounded-full bg-current" />}
          {label}
        </Badge>
      );

    default:
      return null;
  }
};

export { Badge, badgeVariants, StatusBadge };
