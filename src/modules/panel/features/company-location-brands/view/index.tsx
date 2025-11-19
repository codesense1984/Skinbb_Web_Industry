import { MODE } from "@/core/types";
import { useParams } from "react-router";
import { BrandPageWrapper } from "../../../components/pages/brands/brand-form/BrandPageWrapper";

const CompanyLocationBrandView = () => {
  const { companyId, locationId, brandId } = useParams();

  return (
    <BrandPageWrapper
      mode={MODE.VIEW}
      title="View Brand"
      description="View brand information and details"
      companyId={companyId}
      locationId={locationId}
      brandId={brandId}
    />
  );
};

export default CompanyLocationBrandView;
