import { EntityDialog } from "@/core/components/dialogs/EntityDialog";
import { DataTableToogle } from "@/core/components/table/data-table";
import { StatCard } from "@/core/components/ui/stat";
import { PageContent } from "@/core/components/ui/structure";
import type { CompanyList as CompanyListProps } from "@/modules/panel/types/company.type";
import { formatNumber } from "@/core/utils";
import { lazy, useCallback } from "react";
import { CompanyCard } from "./CompanyCard";
import { columns, companyData, statsData } from "./data";

const CompanyForm = lazy(() => import("../components/AddCompanyForm"));

const CompanyList = () => {
  const renderGridItem = useCallback(
    (row: CompanyListProps) => (
      <CompanyCard
        key={row.id}
        company={row}
        aria-label={`View ${row.companyName} card`}
      />
    ),
    [],
  );
  return (
    <PageContent
      header={{
        title: "Company",
        description: "Discover top brands from around the world.",
        actions: (
          <EntityDialog
            title="Add Company"
            description="Fill in the details below to add a new company."
            triggerLabel="Add Company"
            FormComponent={CompanyForm}
          />
        ),
      }}
    >
      <section
        className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4"
        aria-label="Company Statistics"
      >
        {statsData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={formatNumber(item.value)}
            barColor={item.barColor}
          />
        ))}
      </section>

      <DataTableToogle
        rows={companyData}
        columns={columns}
        gridProps={{
          renderGridItem,
        }}
      />
    </PageContent>
  );
};

export default CompanyList;
