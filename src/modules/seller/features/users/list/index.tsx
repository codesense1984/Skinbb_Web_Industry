import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { PageContent } from "@/core/components/ui/structure";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetCompanyUsers } from "@/modules/panel/services/http/company.service";
import { columns } from "./data.tsx";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth.ts";

const fetcher = (companyId: string) =>
  createSimpleFetcher((...item) => apiGetCompanyUsers(companyId, ...item), {
    dataPath: "data.items",
    totalPath: "data.totalRecords",
    filterMapping: {
      status: "status", // Map the status column filter to the status API parameter
    },
  });

const CompanyUsersList = () => {
  const { getCompanyId } = useSellerAuth();

  const companyId = getCompanyId();

  if (!companyId) {
    return (
      <PageContent
        header={{
          title: "Company Users",
          description: "Company ID is required to view users.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid company ID provided.</p>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: "Users",
        description: "Manage company users",
      }}
    >
      <div className="space-y-4">
        <DataTable
          // tableHeading={companyName}
          columns={columns(companyId)}
          isServerSide
          fetcher={fetcher(companyId)}
          queryKeyPrefix={PANEL_ROUTES.COMPANY.USERS(companyId)}
        />
      </div>
    </PageContent>
  );
};

export default CompanyUsersList;
