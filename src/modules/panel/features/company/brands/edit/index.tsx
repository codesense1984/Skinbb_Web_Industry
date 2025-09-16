import { useParams, useNavigate } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

const CompanyBrandEdit = () => {
  const { companyId, brandId } = useParams();
  const navigate = useNavigate();

  if (!companyId || !brandId) {
    return (
      <PageContent
        header={{
          title: "Edit Brand",
          description: "Company ID and Brand ID are required to edit brand.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid company or brand ID provided.</p>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: "Edit Brand",
        description: `Edit brand details for brand ID: ${brandId}`,
        actions: (
          <Button
            onClick={() =>
              navigate(PANEL_ROUTES.COMPANY.BRAND_VIEW(companyId, brandId))
            }
            variant="outlined"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Brand Details
          </Button>
        ),
      }}
    >
      <div className="py-8 text-center">
        <p className="text-gray-500">
          Brand edit form will be implemented here.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          This will use the existing brand form component with the API data.
        </p>
      </div>
    </PageContent>
  );
};

export default CompanyBrandEdit;
