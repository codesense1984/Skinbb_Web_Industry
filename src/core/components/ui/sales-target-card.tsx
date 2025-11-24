import React from "react";
import { CircularProgress } from "./circular-progress";
import { TimePeriodSelector, type TimePeriod } from "./time-period-selector";
import { cn } from "@/core/utils";

interface SalesTargetCardProps {
  current: number;
  target: number;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  description?: string;
  className?: string;
}

export const SalesTargetCard: React.FC<SalesTargetCardProps> = ({
  current,
  target,
  period,
  onPeriodChange,
  description = "Made this month year",
  className,
}) => {
  const percentage = Math.round((current / target) * 100);
  const currentFormatted =
    current >= 1000 ? `${(current / 1000).toFixed(1)}K` : current.toString();
  const targetFormatted =
    target >= 1000 ? `${(target / 1000).toFixed(1)}K` : target.toString();

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-100 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Sales target</h3>
        <TimePeriodSelector
          value={period}
          onChange={onPeriodChange}
          className="scale-75"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="mb-1 text-2xl font-bold text-gray-900">
            {currentFormatted} / {targetFormatted} Units
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex-shrink-0">
          <CircularProgress
            percentage={percentage}
            size={80}
            strokeWidth={6}
            className="text-blue-600"
          >
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {percentage}%
              </div>
            </div>
          </CircularProgress>
        </div>
      </div>
    </div>
  );
};
