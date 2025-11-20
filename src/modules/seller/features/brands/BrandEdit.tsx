import { MODE } from "@/core/types";
import {
  UnifiedBrandForm,
  useBrandUpdateMutation,
} from "@/modules/panel/components/pages/brands/brand-form";
import type { BrandSubmitRequest } from "@/modules/panel/components/pages/brands/brand-form/types";
import { useParams } from "react-router";
import { SELLER_ROUTES } from "../../routes/constant";

const BrandEdit = () => {
  const { id: brandId } = useParams();
  const brandMutation = useBrandUpdateMutation(`${SELLER_ROUTES.BRAND.LIST}`);

  const handleSubmit = ({
    companyId,
    locationId,
    brandId,
    data,
  }: BrandSubmitRequest) => {
    if (!companyId || !locationId || !brandId) {
      console.error("Missing companyId, locationId, or brandId");
      return;
    }
    brandMutation.mutate({
      companyId,
      locationId,
      brandId,
      data,
    });
  };

  return (
    <UnifiedBrandForm
      mode={MODE.EDIT}
      title="Edit Brand"
      description="Update brand information and details"
      onSubmit={handleSubmit}
      submitting={brandMutation.isPending}
      brandId={brandId}
    />
  );
};

export default BrandEdit;
