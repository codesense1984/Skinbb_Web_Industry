import React from "react";
import { cn } from "@/core/utils";

interface Product {
  id: string;
  name: string;
  image: string;
  sold: number;
  change: number;
  isPositive: boolean;
}

interface TopProductsListProps {
  products: Product[];
  onViewAll?: () => void;
  className?: string;
}

export const TopProductsList: React.FC<TopProductsListProps> = ({
  products,
  onViewAll,
  className,
}) => {
  return (
    <div className={cn("bg-white rounded-lg p-6 shadow-sm border border-gray-100", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top product</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center gap-3">
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
                Sold: {product.sold.toLocaleString()}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                  product.isPositive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {product.isPositive ? "+" : ""}{product.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
