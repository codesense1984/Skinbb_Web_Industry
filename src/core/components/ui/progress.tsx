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
    <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
      {children}
    </div>
  );
};
