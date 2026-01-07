import { StatusBadge } from "@/core/components/ui/badge";
import { Badge } from "@/core/components/ui/badge";
import type { CompanyListItem } from "@/modules/panel/types/company.type";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { formatDate } from "@/core/utils";
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

interface CompanyCardProps {
  company: CompanyListItem;
}

export const CompanyCard: FC<CompanyCardProps> = ({ company }) => {
  const primaryAddress =
    company.address?.find((addr) => addr.isPrimary) || company.address?.[0];

  return (
    <NavLink to={PANEL_ROUTES.COMPANY.VIEW(company._id)}>
      <article className="bg-background hover:ring-primary flex flex-col gap-4 rounded-md p-4 shadow-md hover:ring-3 md:p-5">
        <header className="flex items-center gap-3">
          {company.logo ? (
            <img
              src={company.logo}
              alt={`${company.companyName} logo`}
              className="h-15 w-15 rounded-md border object-contain p-1"
            />
          ) : (
            <div className="flex h-15 w-15 items-center justify-center rounded-md border bg-gray-100">
              <span className="text-lg font-bold text-gray-500">
                {company.companyName?.charAt(0) || "C"}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h6 className="truncate font-medium">{company.companyName}</h6>
            <p className="text-muted-foreground text-sm">
              {company.businessType}
            </p>
            {primaryAddress && (
              <Badge variant="outline" className="mt-1 text-xs">
                {primaryAddress.city}
              </Badge>
            )}
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 border-t pt-2">
          <Stat label="Locations" value={company.address?.length || 0} />
          <Stat
            label="Brands"
            value={
              company.address?.reduce(
                (sum, addr) => sum + (addr.brands?.length || 0),
                0,
              ) || 0
            }
          />
        </div>

        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>Created {formatDate(company.createdAt)}</span>
          <StatusBadge
            module="company"
            status={company.companyStatus}
            variant="badge"
          />
        </div>
      </article>
    </NavLink>
  );
};
