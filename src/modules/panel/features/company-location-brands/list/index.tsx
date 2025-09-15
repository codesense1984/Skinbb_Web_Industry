import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetCompanyLocationBrands } from "@/modules/panel/services/http/company.service";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useNavigate, useParams } from "react-router";
import { columns } from "./data";
import type { PaginationParams } from "@/core/types";

const fetcher = (companyId: string, locationId: string) =>
  createSimpleFetcher(
    (params: PaginationParams, signal?: AbortSignal) =>
      apiGetCompanyLocationBrands(companyId, locationId, params, signal),
    {
      dataPath: "data",
    },
  );

const CompanyLocationBrandsList = () => {
  const { companyId, locationId } = useParams();
  const navigate = useNavigate();

  if (!companyId || !locationId) {
    return (
      <PageContent
        header={{
          title: "Brands",
          description:
            "Company ID and Location ID are required to view brands.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">
            Invalid company or location ID provided.
          </p>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: "Brands",
        description: "Manage brands for this location",
        actions: (
          <Button
            onClick={() =>
              navigate(
                PANEL_ROUTES.COMPANY_LOCATION.BRAND_CREATE(
                  companyId,
                  locationId,
                ),
              )
            }
            variant="contained"
            color="secondary"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        ),
      }}
    >
      <DataTable
        columns={columns(companyId, locationId)}
        isServerSide={false}
        fetcher={fetcher(companyId, locationId)}
        queryKeyPrefix={ENDPOINTS.COMPANY_LOCATION_BRANDS.LIST(
          companyId,
          locationId,
        )}
      />
    </PageContent>
  );
};

export default CompanyLocationBrandsList;
