import * as React from "react";
import { cn } from "@/core/utils";

interface SegmentedControlProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export function SegmentedControl({
  value,
  onValueChange,
  options,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg bg-white border border-gray-200 shadow-sm",
        className
      )}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => onValueChange(option.value)}
          className={cn(
            "relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
            "first:rounded-l-lg last:rounded-r-lg",
            "border-r border-gray-200 last:border-r-0",
            value === option.value
              ? "bg-primary text-primary-foreground font-semibold"
              : "bg-white text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
