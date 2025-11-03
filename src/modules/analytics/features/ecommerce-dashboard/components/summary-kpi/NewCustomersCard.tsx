import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { UserPlusIcon } from "@heroicons/react/24/outline";

interface NewCustomersCardProps {
  className?: string;
}

interface NewCustomersData {
  count: number;
  change: number;
  period: string;
  timeframe: string;
}

export const NewCustomersCard: React.FC<NewCustomersCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const newCustomersData: NewCustomersData = {
    count: 89,
    change: 22.7,
    period: "vs last month",
    timeframe: "this week"
  };

  const formattedCount = newCustomersData.count.toLocaleString();

  return (
    <StatCard
      title="New Customers"
      value={formattedCount}
      barColor="bg-chart-1"
      icon={
        <div className="bg-[var(--chart-1)]/20 rounded-full p-3 flex items-center justify-center">
          <UserPlusIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
