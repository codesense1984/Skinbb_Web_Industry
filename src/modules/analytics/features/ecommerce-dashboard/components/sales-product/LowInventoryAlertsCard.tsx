import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { 
  ExclamationTriangleIcon,
  EyeIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

interface LowInventoryAlertsCardProps {
  className?: string;
}

interface InventoryAlert {
  id: string;
  name: string;
  image: string;
  currentStock: number;
  minThreshold: number;
  urgency: 'low' | 'critical' | 'out';
  sku: string;
}

export const LowInventoryAlertsCard: React.FC<LowInventoryAlertsCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const alerts: InventoryAlert[] = [
    {
      id: "1",
      name: "Retinol Night Serum",
      image: "/placeholder-product.jpg",
      currentStock: 3,
      minThreshold: 10,
      urgency: 'critical',
      sku: "SKU-001"
    },
    {
      id: "2",
      name: "Vitamin C Brightening Cream",
      image: "/placeholder-product.jpg",
      currentStock: 0,
      minThreshold: 15,
      urgency: 'out',
      sku: "SKU-002"
    },
    {
      id: "3",
      name: "Hyaluronic Acid Moisturizer",
      image: "/placeholder-product.jpg",
      currentStock: 7,
      minThreshold: 20,
      urgency: 'low',
      sku: "SKU-003"
    },
    {
      id: "4",
      name: "Niacinamide Serum",
      image: "/placeholder-product.jpg",
      currentStock: 2,
      minThreshold: 12,
      urgency: 'critical',
      sku: "SKU-004"
    }
  ];

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 text-xs px-2 py-1">
            Critical
          </Badge>
        );
      case 'out':
        return (
          <Badge variant="destructive" className="bg-red-200 text-red-900 hover:bg-red-200 text-xs px-2 py-1">
            Out of Stock
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs px-2 py-1">
            Low Stock
          </Badge>
        );
      default:
        return null;
    }
  };

  const criticalCount = alerts.filter(a => a.urgency === 'critical' || a.urgency === 'out').length;

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Low Inventory Alerts
            </CardTitle>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 text-xs px-2 py-1">
                {criticalCount} Critical
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <img
                  src={alert.image}
                  alt={alert.name}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {alert.name}
                </p>
                <p className="text-xs text-gray-500">
                  SKU: {alert.sku}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-600">
                    Stock: {alert.currentStock}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600">
                    Min: {alert.minThreshold}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                {getUrgencyBadge(alert.urgency)}
                <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                  <ShoppingCartIcon className="h-3 w-3 mr-1" />
                  Reorder
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
