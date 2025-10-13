import { useParams } from "react-router";
import UnifiedBrandList from "../../../brands/shared/UnifiedBrandList";
import type { BrandListConfig } from "../../../brands/shared/UnifiedBrandList";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

const CompanyBrandsList = () => {
  const { companyId } = useParams();

  if (!companyId) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Invalid company ID provided.</p>
      </div>
    );
  }

  const config: BrandListConfig = {
    mode: "company",
    title: "Company Brands",
    description: `Manage all brands for Company ${companyId}`,
    showFilters: true,
    showAddButton: true,
    addButtonText: "Add Brand",
    addButtonRoute: PANEL_ROUTES.COMPANY.BRAND_CREATE(companyId),
    autoSelectCompany: companyId,
    disableFilterEditing: true,
  };

  return (
    <UnifiedBrandList
      config={config}
      companyId={companyId}
    />
  );
};

export default CompanyBrandsList;
