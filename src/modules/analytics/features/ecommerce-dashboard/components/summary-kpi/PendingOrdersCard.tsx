import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { ClockIcon } from "@heroicons/react/24/outline";

interface PendingOrdersCardProps {
  className?: string;
}

interface PendingOrdersData {
  count: number;
  urgentCount: number;
  avgWaitTime: string;
}

export const PendingOrdersCard: React.FC<PendingOrdersCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const pendingData: PendingOrdersData = {
    count: 23,
    urgentCount: 5,
    avgWaitTime: "2.3 hours"
  };

  return (
    <StatCard
      title="Pending Orders"
      value={pendingData.count}
      barColor="bg-chart-1"
      icon={
        <div className="bg-[var(--chart-1)]/20 rounded-full p-3 flex items-center justify-center">
          <ClockIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
