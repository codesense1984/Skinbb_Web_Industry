import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import type { AnalyticsOverviewData } from "@/modules/analytics/features/ecommerce/types";

interface NewCustomersCardProps {
  className?: string;
  data?: AnalyticsOverviewData;
}

export const NewCustomersCard: React.FC<NewCustomersCardProps> = ({ className, data }) => {
  const newCustomers = data?.newCustomers ?? 0;
  const formattedCount = newCustomers.toLocaleString();

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
