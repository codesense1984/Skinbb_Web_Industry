import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { UsersIcon } from "@heroicons/react/24/outline";

interface ActiveCustomersCardProps {
  className?: string;
}

interface ActiveCustomersData {
  count: number;
  change: number;
  period: string;
  timeframe: string;
}

export const ActiveCustomersCard: React.FC<ActiveCustomersCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const customersData: ActiveCustomersData = {
    count: 1247,
    change: 15.3,
    period: "vs last month",
    timeframe: "last 30 days"
  };

  const formattedCount = customersData.count.toLocaleString();

  return (
    <StatCard
      title="Active Customers"
      value={formattedCount}
      barColor="bg-chart-1"
      icon={
        <div className="bg-[var(--chart-1)]/20 rounded-full p-3 flex items-center justify-center">
          <UsersIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
