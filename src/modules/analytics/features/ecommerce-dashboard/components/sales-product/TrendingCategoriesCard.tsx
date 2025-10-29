import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

interface TrendingCategoriesCardProps {
  className?: string;
}

interface Category {
  id: string;
  name: string;
  sales: number;
  change: number;
  isPositive: boolean;
  color: string;
}

export const TrendingCategoriesCard: React.FC<TrendingCategoriesCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const categories: Category[] = [
    {
      id: "1",
      name: "Anti-Aging",
      sales: 15420,
      change: 18.5,
      isPositive: true,
      color: "bg-purple-500"
    },
    {
      id: "2",
      name: "Hydration",
      sales: 12890,
      change: 12.3,
      isPositive: true,
      color: "bg-blue-500"
    },
    {
      id: "3",
      name: "Brightening",
      sales: 9876,
      change: -3.2,
      isPositive: false,
      color: "bg-yellow-500"
    },
    {
      id: "4",
      name: "Acne Treatment",
      sales: 7654,
      change: 25.7,
      isPositive: true,
      color: "bg-green-500"
    },
    {
      id: "5",
      name: "Sensitive Skin",
      sales: 5432,
      change: 7.8,
      isPositive: true,
      color: "bg-pink-500"
    }
  ];

  const maxSales = Math.max(...categories.map(c => c.sales));

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Trending Categories
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", category.color)}></div>
                  <span className="text-sm font-medium text-gray-900">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    ${category.sales.toLocaleString()}
                  </span>
                  <Badge 
                    variant={category.isPositive ? "default" : "destructive"}
                    className={cn(
                      "text-xs px-2 py-1",
                      category.isPositive 
                        ? "bg-green-100 text-green-800 hover:bg-green-100" 
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <ArrowTrendingUpIcon className="h-3 w-3" />
                      {Math.abs(category.change)}%
                    </div>
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn("h-2 rounded-full transition-all duration-300", category.color)}
                  style={{ width: `${(category.sales / maxSales) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
