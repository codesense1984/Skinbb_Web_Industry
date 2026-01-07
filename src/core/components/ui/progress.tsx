import React from "react";
import { cn } from "@/core/utils";

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  children?: React.ReactNode;
}

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  className,
  children,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("h-2 w-full rounded-full bg-gray-200", className)}>
      <div
        className="h-2 rounded-full bg-blue-600 transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
      {children}
    </div>
  );
};
