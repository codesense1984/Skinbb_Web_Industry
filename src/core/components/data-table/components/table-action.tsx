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

  const buttonProps = {
    variant: defaultVariant,
    size,
    className: cn("size-7 border", buttonClassName),
    ...restProps,
  };

  // If 'to' prop is provided, wrap the button with Link
  if (to) {
    return (
      <Button asChild {...buttonProps}>
        <Link to={to}>
          {startIcon}
          {children}
        </Link>
      </Button>
    );
  }

  return (
    <Button {...buttonProps} startIcon={startIcon}>
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
