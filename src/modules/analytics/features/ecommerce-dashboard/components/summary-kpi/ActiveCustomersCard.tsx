import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatValue } from "@/core/components/ui/stat";
import { Badge } from "@/core/components/ui/badge";
import { 
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon 
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

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

  const isPositive = customersData.change > 0;
  const formattedCount = customersData.count.toLocaleString();

  return (
    <Card className={cn("bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-indigo-700">
            Active Customers
          </CardTitle>
          <UsersIcon className="h-5 w-5 text-indigo-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <StatValue
            value={formattedCount}
            valueProps={{
              className: "text-2xl font-bold text-indigo-900"
            }}
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge 
                variant={isPositive ? "default" : "destructive"}
                className={cn(
                  "text-xs px-2 py-1",
                  isPositive 
                    ? "bg-green-100 text-green-800 hover:bg-green-100" 
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                )}
              >
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-3 w-3" />
                  )}
                  {Math.abs(customersData.change)}%
                </div>
              </Badge>
              <span className="text-xs text-gray-600">{customersData.period}</span>
            </div>
            <div className="text-xs text-gray-500">{customersData.timeframe}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
