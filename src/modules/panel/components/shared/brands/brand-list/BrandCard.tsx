import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
} from "@/core/components/ui/avatar";
import { StatusBadge } from "@/core/components/ui/badge";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type {
  Brand,
  BrandLogoImage,
  CompanyLocationBrand,
} from "@/modules/panel/types/brand.type";
import { memo, type FC } from "react";
import { NavLink } from "react-router";

const Stat = memo(
  ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  ),
);
Stat.displayName = "Stat";

interface BrandCardProps {
  brand: Brand | CompanyLocationBrand;
}

export const BrandCard: FC<BrandCardProps> = ({ brand }) => {
  // Transform brand to ensure all required fields are present
  const brandForCard: Brand = {
    ...brand,
    _id: brand._id,
    name: brand.name,
    slug: brand.slug,
    aboutTheBrand: (brand as CompanyLocationBrand).aboutTheBrand || "",
    logoImage:
      typeof brand.logoImage === "string"
        ? { _id: "", url: brand.logoImage }
        : brand.logoImage,
    isActive: (brand as CompanyLocationBrand).isActive ?? true,
    associatedProductsCount: (brand as CompanyLocationBrand).totalSKU || 0,
    associatedUsers: 0,
    createdAt: brand.createdAt,
  };

  return (
    <article className="bg-background hover:ring-primary flex flex-col gap-4 rounded-md p-4 shadow-md hover:ring-3 md:p-5">
      <header className="flex items-center gap-3">
        <AvatarRoot className="size-15 rounded-md border">
          <AvatarImage
            className="object-contain"
            src={
              typeof brandForCard.logoImage === "string"
                ? brandForCard.logoImage
                : ((brandForCard.logoImage as BrandLogoImage)?.url ?? "")
            }
            alt={`${brandForCard.name} logo`}
          />
          <AvatarFallback className="rounded-md capitalize">
            {brandForCard.name?.charAt(0)}
          </AvatarFallback>
        </AvatarRoot>

        <div className="min-w-0 flex-1">
          <h6 className="truncate font-medium">{brandForCard.name}</h6>
          <p className="text-muted-foreground text-sm">{brandForCard.slug}</p>
        </div>
      </header>

      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>{formatDate(brandForCard?.createdAt ?? "")}</span>
        <StatusBadge
          module="brand"
          status={brandForCard.isActive ? "active" : "inactive"}
          variant="badge"
        />
      </div>
    </article>
  );
};
