import React from "react";
import { cn } from "@/core/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  className?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-gray-100 bg-white p-6 shadow-sm",
        "border-l-4 border-l-pink-300",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="mb-2 text-sm font-normal text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-sm font-medium",
                change.isPositive ? "text-green-600" : "text-red-600",
              )}
            >
              {change.value}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className="flex items-center justify-center rounded-full bg-pink-100 p-3">
            <div className="text-pink-600">{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
