import { Button, type ButtonProps } from "@/core/components/ui/button";
import { cn } from "@/core/utils";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import type { ReactNode } from "react";
import { Link } from "react-router";

export interface ActionButtonProps extends ButtonProps {
  // onClick?: () => void;
  to?: string;
  // disabled?: boolean;
  // loading?: boolean;
  // variant?: "contained" | "outlined" | "ghost" | "text" | "link";
  // size?: "tiny" | "sm" | "md" | "lg" | "icon";
  // className?: string;
  // icon?: ReactNode;
  // tooltip?: string;
  // children?: ReactNode;
}

export interface TableActionProps {
  view?: ActionButtonProps;
  edit?: ActionButtonProps;
  delete?: ActionButtonProps;
  children?: ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
}

export const renderActionButton = (
  action: ActionButtonProps | undefined,
  defaultIcon: ReactNode,
  defaultVariant: ButtonProps["variant"] = "outlined",
) => {
  if (!action) return null;

  const {
    to,
    startIcon = defaultIcon,
    variant = defaultVariant,
    size = "icon",
    className: buttonClassName,
    children,
    ...restProps
  } = action;

  // If 'to' prop is provided, use Link with Button asChild
  if (to) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("size-7 border", buttonClassName)}
        startIcon={startIcon}
        asChild
        {...restProps}
      >
        <Link to={to}>{children}</Link>
      </Button>
    );
  }

  // Otherwise, use regular button with onClick
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("size-7 border", buttonClassName)}
      startIcon={startIcon}
      {...restProps}
    >
      {children}
    </Button>
  );
};
export function TableAction({
  view,
  edit,
  delete: deleteAction,
  children,
  className,
  spacing = "sm",
}: TableActionProps) {
  const spacingClasses = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3",
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center",
        spacingClasses[spacing],
        className,
      )}
    >
      {renderActionButton(view, <EyeIcon className="!size-4" />)}
      {renderActionButton(edit, <PencilIcon className="!size-4" />)}
      {renderActionButton(deleteAction, <TrashIcon className="!size-4" />)}
      {children}
    </div>
  );
}
