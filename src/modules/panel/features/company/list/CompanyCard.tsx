import { StatusBadge } from "@/core/components/ui/badge";
import type { CompanyList } from "@/core/types/company.type";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
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

interface CompanyCardProps {
  company: CompanyList;
}

export const CompanyCard: FC<CompanyCardProps> = ({ company }) => {
  return (
    <NavLink to={PANEL_ROUTES.COMPANY.EDIT(company.id)}>
      <article className="bg-background hover:ring-primary flex flex-col gap-4 rounded-md p-4 shadow-md hover:ring-3 md:p-5">
        <header className="flex items-center gap-2">
          <img
            src={company.logo || ""}
            alt={`${company.companyName} logo`}
            className="h-15 w-15 rounded-md border object-contain p-1"
          />
          <div>
            <h6 className="font-medium">{company.companyName}</h6>
            <p>{company.category}</p>
            <StatusBadge module="brand" status={company.status} />
          </div>
        </header>
      </article>
    </NavLink>
  );
};
