import { useParams, useNavigate } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/solid";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

const CompanyBrandsList = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  if (!companyId) {
    return (
      <PageContent
        header={{
          title: "Brands",
          description: "Company ID is required to view brands.",
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
        title: "Company Brands",
        description: `Manage all brands for Company ${companyId}`,
        actions: (
          <Button
            onClick={() =>
              navigate(PANEL_ROUTES.COMPANY.BRAND_CREATE(companyId))
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
      <div className="space-y-4">
        <div className="py-8 text-center">
          <p className="mb-4 text-gray-500">
            Company brands listing will be implemented with the proper API
            endpoints.
          </p>
          <p className="mb-4 text-sm text-gray-400">Company ID: {companyId}</p>
          <Button
            onClick={() => navigate(PANEL_ROUTES.COMPANY.LIST)}
            variant="outlined"
          >
            Back to Companies
          </Button>
        </div>
      </div>
    </PageContent>
  );
};

export default CompanyBrandsList;
