import { StatusBadge } from "@/core/components/ui/badge";
import type { Brand } from "@/modules/panel/types/brand.type";
import { formatNumber } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { memo, type FC } from "react";
import { NavLink } from "react-router";

const Stat = memo(
  ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  ),
);
Stat.displayName = "Stat";

interface BrandCardProps {
  brand: Brand;
}

export const BrandCard: FC<BrandCardProps> = ({ brand }) => {
  const cleanDescription = brand.aboutTheBrand.replace(/<[^>]*>/g, ''); // Remove HTML tags
  
  return (
    <NavLink to={PANEL_ROUTES.BRAND.EDIT(brand._id)}>
      <article className="bg-background hover:ring-primary flex flex-col gap-4 rounded-md p-4 shadow-md hover:ring-3 md:p-5">
        <header className="flex items-center gap-3">
          <img
            src={brand.logoImage?.url || ""}
            alt={`${brand.name} logo`}
            className="h-15 w-15 rounded-md border object-contain p-1"
          />
          <div className="flex-1 min-w-0">
            <h6 className="font-medium truncate">{brand.name}</h6>
            <p className="text-sm text-muted-foreground">{brand.slug}</p>
            {cleanDescription && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {cleanDescription}
              </p>
            )}
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <Stat 
            label="Products" 
            value={formatNumber(brand.associatedProductsCount)} 
          />
          <Stat 
            label="Users" 
            value={formatNumber(brand.associatedUsers)} 
          />
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created {new Date(brand.createdAt).toLocaleDateString()}</span>
          <StatusBadge 
            module="brand" 
            status={brand.isActive ? "active" : "inactive"} 
          />
        </div>
      </article>
    </NavLink>
  );
};
