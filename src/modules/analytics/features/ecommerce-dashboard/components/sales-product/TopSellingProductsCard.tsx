import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { 
  TrophyIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

interface TopSellingProductsCardProps {
  className?: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  sales: number;
  change: number;
  isPositive: boolean;
  rank: number;
}

export const TopSellingProductsCard: React.FC<TopSellingProductsCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const products: Product[] = [
    {
      id: "1",
      name: "Retinol Night Serum",
      image: "/placeholder-product.jpg",
      sales: 1247,
      change: 15.3,
      isPositive: true,
      rank: 1
    },
    {
      id: "2", 
      name: "Vitamin C Brightening Cream",
      image: "/placeholder-product.jpg",
      sales: 892,
      change: 8.7,
      isPositive: true,
      rank: 2
    },
    {
      id: "3",
      name: "Hyaluronic Acid Moisturizer",
      image: "/placeholder-product.jpg", 
      sales: 756,
      change: -2.1,
      isPositive: false,
      rank: 3
    },
    {
      id: "4",
      name: "Niacinamide Serum",
      image: "/placeholder-product.jpg",
      sales: 634,
      change: 22.4,
      isPositive: true,
      rank: 4
    },
    {
      id: "5",
      name: "Gentle Cleansing Foam",
      image: "/placeholder-product.jpg",
      sales: 521,
      change: 5.8,
      isPositive: true,
      rank: 5
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIcon className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <div className="h-4 w-4 rounded-full bg-gray-400 flex items-center justify-center text-xs text-white font-bold">2</div>;
      case 3:
        return <div className="h-4 w-4 rounded-full bg-orange-400 flex items-center justify-center text-xs text-white font-bold">3</div>;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 font-bold">{rank}</div>;
    }
  };

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Top Selling Products
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                {getRankIcon(product.rank)}
              </div>
              <div className="flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">
                  {product.sales.toLocaleString()} sales
                </p>
              </div>
              <div className="flex-shrink-0">
                <Badge 
                  variant={product.isPositive ? "default" : "destructive"}
                  className={cn(
                    "text-xs px-2 py-1",
                    product.isPositive 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  )}
                >
                  <div className="flex items-center gap-1">
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                    {Math.abs(product.change)}%
                  </div>
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
