import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatValue } from "@/core/components/ui/stat";
import { Badge } from "@/core/components/ui/badge";
import { 
  UserPlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon 
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

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

  const isPositive = newCustomersData.change > 0;
  const formattedCount = newCustomersData.count.toLocaleString();

  return (
    <Card className={cn("bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-emerald-700">
            New Customers
          </CardTitle>
          <UserPlusIcon className="h-5 w-5 text-emerald-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <StatValue
            value={formattedCount}
            valueProps={{
              className: "text-2xl font-bold text-emerald-900"
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
                  {Math.abs(newCustomersData.change)}%
                </div>
              </Badge>
              <span className="text-xs text-gray-600">{newCustomersData.period}</span>
            </div>
            <div className="text-xs text-gray-500">{newCustomersData.timeframe}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
