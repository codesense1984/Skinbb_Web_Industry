import { Button } from "@/core/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";
import React from "react";

interface FilterButtonProps {
  label: string;
  isActive?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
  className?: string;
  startIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const FilterButton = React.forwardRef<
  HTMLButtonElement,
  FilterButtonProps
>(
  (
    {
      label,
      isActive = false,
      isOpen = false,
      onClick,
      className,
      startIcon,
      children,
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        variant="outlined"
        onClick={onClick}
        className={cn("", isActive && "text-purple-600", className)}
      >
        <span className="flex items-center gap-2">
          {startIcon}
          {label}
          {isOpen ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </span>
        {children}
      </Button>
    );
  },
);

FilterButton.displayName = "FilterButton";
