import { MODE } from "@/core/types/base.type";
import { useLocation, useParams, useSearchParams } from "react-router";
import {
  BrandPageWrapper,
  useBrandCreateMutation,
  type BrandFormData,
} from "../../company-location-brands";

const BrandForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const locationId = searchParams.get("locationId");
  const location = useLocation();
  const pathname = location.pathname;

  const brandMutation = useBrandCreateMutation();

  const handleSubmit = (data: BrandFormData) => {
    brandMutation.mutate(data);
  };

  // Determine mode based on URL path
  let mode = MODE.ADD;
  if (id) {
    if (pathname.endsWith("/view")) {
      mode = MODE.VIEW;
    } else if (pathname.endsWith("/edit")) {
      mode = MODE.EDIT;
    } else {
      mode = MODE.EDIT; // fallback
    }
  }

  const getTitle = () => {
    switch (mode) {
      case MODE.VIEW:
        return "View Brand";
      case MODE.EDIT:
        return "Edit Brand";
      default:
        return "Create Brand";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case MODE.VIEW:
        return "View brand information and details";
      case MODE.EDIT:
        return "Update your brand information";
      default:
        return "Add a new brand to your portfolio";
    }
  };

  return (
    <>
      Brand Form
      <BrandPageWrapper
        mode={mode}
        title={getTitle()}
        description={getDescription()}
        companyId={companyId || undefined}
        locationId={locationId || undefined}
        onSubmit={handleSubmit}
        submitting={brandMutation.isPending}
      />
      {/* <UnifiedBrandForm
        mode={mode}
        title={getTitle()}
        description={getDescription()}
        companyId={companyId}
        locationId={locationId}
        brandId={id}
      /> */}
    </>
  );
};

export default BrandForm;
