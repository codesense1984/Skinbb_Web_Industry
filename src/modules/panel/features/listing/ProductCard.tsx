import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { StatusBadge } from "@/core/components/ui/badge";
import type { Product } from "@/modules/panel/types/product.type";
import { formatCurrency, formatDate } from "@/core/utils";
import { memo, type FC } from "react";

const Stat = memo(
  ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  ),
);
Stat.displayName = "Stat";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
  // Safe access to arrays with fallbacks
  const variants = product.variants || [];
  const categories = product.productCategory || [];
  const priceRange = product.priceRange || { min: 0, max: 0 };
  const salePriceRange = product.salePriceRange || { min: 0, max: 0 };
  
  return (
    <article className="bg-background hover:ring-primary flex flex-col gap-4 rounded-md p-4 shadow-md hover:ring-3 md:p-5">
      <header className="flex items-center gap-3">
        <Avatar className="size-12 rounded-md border">
          <AvatarImage
            className="object-cover"
            src={product.thumbnail?.url}
            alt={`${product.productName} thumbnail`}
          />
          <AvatarFallback className="rounded-md capitalize">
            {product.productName?.charAt(0) || 'P'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h6 className="font-medium truncate">
            {product.productName || 'Unnamed Product'}
          </h6>
          <p className="text-sm text-muted-foreground">{product.brand?.name || 'Unknown Brand'}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {categories.slice(0, 2).map((category, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {category.name}
              </span>
            ))}
            {categories.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{categories.length - 2}
              </span>
            )}
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
        <Stat 
          label="Variants" 
          value={`${variants.length} variant${variants.length !== 1 ? 's' : ''}`}
        />
        <Stat 
          label="Price Range" 
          value={`${formatCurrency(priceRange.min, { useAbbreviation: true })} - ${formatCurrency(priceRange.max, { useAbbreviation: true })}`}
        />
      </div>
      
      {salePriceRange && (salePriceRange.min > 0 || salePriceRange.max > 0) && (
        <div className="text-xs text-green-600 font-medium">
          Sale: {formatCurrency(salePriceRange.min, { useAbbreviation: true })} - {formatCurrency(salePriceRange.max, { useAbbreviation: true })}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Added {product.capturedDate ? formatDate(product.capturedDate) : 'Unknown'}</span>
        <StatusBadge 
          module="product" 
          status={product.status || 'draft'}
          variant="badge"
        />
      </div>
    </article>
  );
};
