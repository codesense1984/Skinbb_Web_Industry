import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatValue } from "@/core/components/ui/stat";
import { Badge } from "@/core/components/ui/badge";
import { 
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

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

  const isUrgent = pendingData.urgentCount > 0;

  return (
    <Card className={cn(
      "bg-gradient-to-br border-2",
      isUrgent 
        ? "from-orange-50 to-orange-100 border-orange-200" 
        : "from-gray-50 to-gray-100 border-gray-200"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "text-sm font-medium",
            isUrgent ? "text-orange-700" : "text-gray-700"
          )}>
            Pending Orders
          </CardTitle>
          <ClockIcon className={cn(
            "h-5 w-5",
            isUrgent ? "text-orange-600" : "text-gray-600"
          )} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <StatValue
            value={pendingData.count}
            valueProps={{
              className: cn(
                "text-2xl font-bold",
                isUrgent ? "text-orange-900" : "text-gray-900"
              )
            }}
          />
          <div className="space-y-1">
            {isUrgent && (
              <Badge 
                variant="destructive"
                className="bg-red-100 text-red-800 hover:bg-red-100 text-xs px-2 py-1"
              >
                <div className="flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-3 w-3" />
                  {pendingData.urgentCount} urgent
                </div>
              </Badge>
            )}
            <div className="text-xs text-gray-600">
              Avg wait: {pendingData.avgWaitTime}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
