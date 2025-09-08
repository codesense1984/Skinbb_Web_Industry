import {
  AvatarRoot,
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
      <p className="text-muted-foreground text-sm">{label}</p>
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
        <AvatarRoot className="size-12 rounded-md border">
          <AvatarImage
            className="object-cover"
            src={product.thumbnail?.url}
            alt={`${product.productName} thumbnail`}
          />
          <AvatarFallback className="rounded-md capitalize">
            {product.productName?.charAt(0) || "P"}
          </AvatarFallback>
        </AvatarRoot>
        <div className="min-w-0 flex-1">
          <h6 className="truncate font-medium">
            {product.productName || "Unnamed Product"}
          </h6>
          <p className="text-muted-foreground text-sm">
            {product.brand?.name || "Unknown Brand"}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="rounded bg-gray-100 px-2 py-1 text-xs"
              >
                {category.name}
              </span>
            ))}
            {categories.length > 2 && (
              <span className="text-muted-foreground text-xs">
                +{categories.length - 2}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 border-t pt-2">
        <Stat
          label="Variants"
          value={`${variants.length} variant${variants.length !== 1 ? "s" : ""}`}
        />
        <Stat
          label="Price Range"
          value={`${formatCurrency(priceRange.min, { useAbbreviation: true })} - ${formatCurrency(priceRange.max, { useAbbreviation: true })}`}
        />
      </div>

      {salePriceRange && (salePriceRange.min > 0 || salePriceRange.max > 0) && (
        <div className="text-xs font-medium text-green-600">
          Sale: {formatCurrency(salePriceRange.min, { useAbbreviation: true })}{" "}
          - {formatCurrency(salePriceRange.max, { useAbbreviation: true })}
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
