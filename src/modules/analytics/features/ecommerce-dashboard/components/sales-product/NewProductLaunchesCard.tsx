import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { 
  SparklesIcon,
  EyeIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

interface NewProductLaunchesCardProps {
  className?: string;
}

interface NewProduct {
  id: string;
  name: string;
  image: string;
  brand: string;
  launchDate: string;
  status: 'launched' | 'coming-soon' | 'preview';
  category: string;
}

export const NewProductLaunchesCard: React.FC<NewProductLaunchesCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const newProducts: NewProduct[] = [
    {
      id: "1",
      name: "Advanced Retinol Complex",
      image: "/placeholder-product.jpg",
      brand: "Luxury Skincare Co.",
      launchDate: "2024-01-15",
      status: 'launched',
      category: "Anti-Aging"
    },
    {
      id: "2",
      name: "Vitamin C + E Serum",
      image: "/placeholder-product.jpg",
      brand: "Natural Beauty",
      launchDate: "2024-01-20",
      status: 'coming-soon',
      category: "Brightening"
    },
    {
      id: "3",
      name: "Hyaluronic Acid Mask",
      image: "/placeholder-product.jpg",
      brand: "HydraCare",
      launchDate: "2024-01-25",
      status: 'preview',
      category: "Hydration"
    },
    {
      id: "4",
      name: "Gentle Exfoliating Toner",
      image: "/placeholder-product.jpg",
      brand: "Pure Skin",
      launchDate: "2024-01-30",
      status: 'coming-soon',
      category: "Cleansing"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'launched':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs px-2 py-1">
            Launched
          </Badge>
        );
      case 'coming-soon':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs px-2 py-1">
            Coming Soon
          </Badge>
        );
      case 'preview':
        return (
          <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs px-2 py-1">
            Preview
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            New Product Launches
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {newProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
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
                  {product.brand} • {product.category}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {formatDate(product.launchDate)}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(product.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
