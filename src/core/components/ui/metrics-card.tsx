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
    <div className={cn(
      "bg-white rounded-lg p-6 shadow-sm border border-gray-100 relative",
      "border-l-4 border-l-pink-300",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-normal text-gray-600 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={cn(
              "text-sm font-medium mt-1",
              change.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {change.value}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="bg-pink-100 rounded-full p-3 flex items-center justify-center">
            <div className="text-pink-600">
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
