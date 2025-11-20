import { MODE } from "@/core/types";
import { useParams, useSearchParams } from "react-router";
import { UnifiedBrandForm } from "../../components/shared/brands/brand-form";

const BrandView = () => {
  const { id: brandId } = useParams();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId") ?? undefined;
  const locationId = searchParams.get("locationId") ?? undefined;

  return (
    <UnifiedBrandForm
      mode={MODE.VIEW}
      title="View Brand"
      description="View brand information and details"
      companyId={companyId}
      locationId={locationId}
      brandId={brandId}
    />
  );
};

export default BrandView;
