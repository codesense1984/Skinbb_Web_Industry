import { MODE } from "@/core/types";
import { useParams } from "react-router";
import { UnifiedBrandForm } from "../../../../components/pages/brands/brand-form";

const CompanyBrandView = () => {
  const { companyId, brandId } = useParams();

  return (
    <UnifiedBrandForm
      mode={MODE.VIEW}
      title="View Brand"
      description="View brand information and details"
      companyId={companyId}
      brandId={brandId}
    />
  );
};

export default CompanyBrandView;
