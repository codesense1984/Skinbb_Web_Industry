import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatValue } from "@/core/components/ui/stat";
import { Badge } from "@/core/components/ui/badge";
import { 
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon 
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

interface TotalOrdersCardProps {
  className?: string;
}

interface OrdersData {
  total: number;
  change: number;
  period: string;
}

export const TotalOrdersCard: React.FC<TotalOrdersCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const ordersData: OrdersData = {
    total: 2847,
    change: 8.2,
    period: "vs last month"
  };

  const isPositive = ordersData.change > 0;
  const formattedTotal = ordersData.total.toLocaleString();

  return (
    <Card className={cn("bg-gradient-to-br from-green-50 to-green-100 border-green-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-green-700">
            Total Orders
          </CardTitle>
          <ShoppingBagIcon className="h-5 w-5 text-green-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <StatValue
            value={formattedTotal}
            valueProps={{
              className: "text-2xl font-bold text-green-900"
            }}
          />
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
                {Math.abs(ordersData.change)}%
              </div>
            </Badge>
            <span className="text-xs text-gray-600">{ordersData.period}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};