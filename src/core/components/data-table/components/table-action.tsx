import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/utils";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import type { ReactNode } from "react";

export interface ActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "contained" | "outlined" | "ghost" | "text" | "link";
  size?: "tiny" | "sm" | "md" | "lg" | "icon";
  className?: string;
  icon?: ReactNode;
  tooltip?: string;
}

export interface TableActionProps {
  view?: ActionButtonProps;
  edit?: ActionButtonProps;
  delete?: ActionButtonProps;
  children?: ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
}

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

  const renderActionButton = (
    action: ActionButtonProps | undefined,
    defaultIcon: ReactNode,
    defaultVariant: ActionButtonProps["variant"] = "outlined",
  ) => {
    if (!action) return null;

    const {
      onClick,
      disabled = false,
      loading = false,
      variant = defaultVariant,
      size = "icon",
      className: buttonClassName,
      icon,
      tooltip,
      ...restProps
    } = action;

    return (
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn("size-7 border", buttonClassName)}
        title={tooltip}
        {...restProps}
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          icon || defaultIcon
        )}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "flex w-max items-center",
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
