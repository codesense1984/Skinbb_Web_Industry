import { MODE } from "@/core/types";
import { useParams, useSearchParams } from "react-router";
import { BrandPageWrapper } from "../../../components/pages/brands/brand-form";

const CompanyLocationBrandView = () => {
  const { id: brandId } = useParams();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId") ?? undefined;
  const locationId = searchParams.get("locationId") ?? undefined;

  return (
    <BrandPageWrapper
      mode={MODE.VIEW}
      title="Edit Brand"
      description="Update brand information and details"
      companyId={companyId}
      locationId={locationId}
      brandId={brandId}
    />
  );
};

export default CompanyLocationBrandView;
