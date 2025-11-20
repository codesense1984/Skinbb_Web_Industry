import { MODE } from "@/core/types";
import { UnifiedBrandForm } from "@/modules/panel/components/pages/brands/brand-form";
import { useParams } from "react-router";

const BrandView = () => {
  const { id: brandId } = useParams();

  return (
    <UnifiedBrandForm
      mode={MODE.VIEW}
      title="View Brand"
      description="View brand information and details"
      brandId={brandId}
    />
  );
};

export default BrandView;
