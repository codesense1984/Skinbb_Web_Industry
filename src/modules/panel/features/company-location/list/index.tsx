import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { PageContent } from "@/core/components/ui/structure";
import { apiGetCompanyLocationList } from "@/modules/panel/services/http/company-location.service";
import { useParams } from "react-router";
import { createColumns } from "./data";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

const fetcher = (companyId: string) =>
  createSimpleFetcher(
    (params: any, signal?: AbortSignal) =>
      apiGetCompanyLocationList(companyId, params, signal),
    {
      dataPath: "data.items",
      totalPath: "data.total",
    },
  );

const CompanyLocationList = () => {
  const { id: companyId } = useParams();

  if (!companyId) {
    return (
      <PageContent
        header={{
          title: "Company Locations",
          description: "Company ID is required to view locations.",
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
        title: "Company Locations",
        description: "Manage and view all company locations.",
      }}
    >
      <DataTable
        columns={createColumns(companyId)}
        isServerSide
        fetcher={fetcher(companyId)}
        queryKeyPrefix={PANEL_ROUTES.COMPANY_LOCATION.LIST(companyId)}
      />
    </PageContent>
  );
};

export default CompanyLocationList;
