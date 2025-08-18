import { StatusBadge } from "@/core/components/ui/badge";
import { ROUTES } from "@/core/routes/routes.constant";
import type { Brand } from "@/core/types/brand.type";
import { formatCurrency, formatNumber } from "@/core/utils";
import { memo, type FC } from "react";
import { NavLink } from "react-router";

const Stat = memo(
  ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <p className="text-sm">{label}</p>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  ),
);
Stat.displayName = "Stat";

interface BrandCardProps {
  brand: Brand;
}

export const BrandCard: FC<BrandCardProps> = ({ brand }) => {
  return (
    <NavLink to={`${ROUTES.BRAND_EDIT}/${brand.id}`}>
      <article className="bg-background hover:ring-primary flex flex-col gap-4 rounded-md p-4 shadow-md hover:ring-3 md:p-5">
        <header className="flex items-center gap-2">
          <img
            src={brand.image}
            alt={`${brand.name} logo`}
            className="h-15 w-15 rounded-md border object-contain p-1"
          />
          <div>
            <h6 className="font-medium">{brand.name}</h6>
            <p>{brand.category}</p>
          </div>
        </header>

        <hr />

        <section className="flex justify-around gap-2 text-center">
          <Stat label="Products" value={formatNumber(brand.products)} />
          <Stat label="Surveys" value={formatNumber(brand.surveys)} />
          <Stat label="Promotions" value={formatNumber(brand.promotions)} />
        </section>

        <hr />

        <section className="flex justify-around gap-2 text-center">
          <Stat
            label="Earnings"
            value={`${formatCurrency(brand.earnings, { useAbbreviation: false })}`}
          />
          <div>
            <p className="text-sm">Status</p>
            <StatusBadge module="brand" status={brand.status} />
          </div>
        </section>
      </article>
    </NavLink>
  );
};
