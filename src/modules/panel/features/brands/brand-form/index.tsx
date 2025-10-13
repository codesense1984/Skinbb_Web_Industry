import { useParams, useLocation } from "react-router";
import { MODE } from "@/core/types/base.type";
import UnifiedBrandForm from "../shared/UnifiedBrandForm";

const BrandForm = () => {
  const { id, companyId, locationId } = useParams();
  const location = useLocation();
  const pathname = location.pathname;

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
    <UnifiedBrandForm
      mode={mode}
      title={getTitle()}
      description={getDescription()}
      companyId={companyId}
      locationId={locationId}
      brandId={id}
    />
  );
};

export default BrandForm;