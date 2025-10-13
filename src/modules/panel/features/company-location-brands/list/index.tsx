import React from "react";
import { useParams } from "react-router";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import UnifiedBrandList from "../../brands/shared/UnifiedBrandList";
import type { BrandListConfig } from "../../brands/shared/UnifiedBrandList";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

const CompanyLocationBrandsList = () => {
  const { companyId, locationId } = useParams();
  const { userId } = useAuth();

  if (!companyId || !locationId || !userId) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">
          Invalid company, location, or user ID provided.
        </p>
      </div>
    );
  }

  const config: BrandListConfig = {
    mode: 'location',
    title: "Brands",
    description: "Manage brands for this location",
    showFilters: true,
    showAddButton: true,
    addButtonText: "Add Brand",
    addButtonRoute: PANEL_ROUTES.COMPANY_LOCATION.BRAND_CREATE(companyId, locationId),
    autoSelectCompany: companyId,
    autoSelectLocation: locationId,
    disableFilterEditing: true,
  };

  return (
    <UnifiedBrandList
      config={config}
      companyId={companyId}
      locationId={locationId}
      userId={userId}
    />
  );
};

export default CompanyLocationBrandsList;
