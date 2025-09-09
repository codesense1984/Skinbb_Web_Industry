import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetCompanyUsers } from "@/modules/panel/services/http/company.service";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router";
import { columns } from "./data.tsx";

const fetcher = (companyId: string) =>
  createSimpleFetcher((...item) => apiGetCompanyUsers(companyId, ...item), {
    dataPath: "data.items",
    totalPath: "data.total",
    filterMapping: {
      status: "status", // Map the status column filter to the status API parameter
    },
  });

const CompanyUsersList = () => {
  const { id: companyId } = useParams();
  const navigate = useNavigate();

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
        actions: (
          <Button
            onClick={() =>
              navigate(PANEL_ROUTES.COMPANY.USER_CREATE(companyId))
            }
            variant="contained"
            color="secondary"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add User
          </Button>
        ),
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
