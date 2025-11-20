import { MODE } from "@/core/types";
import type { BrandSubmitRequest } from "@/modules/panel/components/pages/brands/brand-form/types";
import { useParams, useSearchParams } from "react-router";
import {
  UnifiedBrandForm,
  useBrandUpdateMutation,
} from "../../components/pages/brands/brand-form";

const BrandEdit = () => {
  const { id: brandId } = useParams();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId") ?? undefined;
  const locationId = searchParams.get("locationId") ?? undefined;
  const brandMutation = useBrandUpdateMutation();

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
      companyId={companyId}
      locationId={locationId}
      onSubmit={handleSubmit}
      submitting={brandMutation.isPending}
      brandId={brandId}
    />
  );
};

export default BrandEdit;
