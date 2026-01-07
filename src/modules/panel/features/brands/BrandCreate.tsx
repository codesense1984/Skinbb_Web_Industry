import { MODE } from "@/core/types/base.type";
import type { BrandSubmitRequest } from "@/modules/panel/components/shared/brands/brand-form/types";
import { useParams, useSearchParams } from "react-router";
import {
  UnifiedBrandForm,
  useBrandCreateMutation,
} from "../../components/shared/brands/brand-form";

const BrandCreate = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const locationId = searchParams.get("locationId");

  const brandMutation = useBrandCreateMutation();

  const handleSubmit = ({
    companyId,
    locationId,
    data,
  }: BrandSubmitRequest) => {
    brandMutation.mutate({
      companyId: companyId || "",
      locationId: locationId || "",
      data,
    });
  };

  const mode = MODE.ADD;

  return (
    <UnifiedBrandForm
      mode={mode}
      title={"Create Brand"}
      description={"Add a new brand to your portfolio"}
      companyId={companyId || undefined}
      locationId={locationId || undefined}
      brandId={id || undefined}
      onSubmit={handleSubmit}
      submitting={brandMutation.isPending}
    />
  );
};

export default BrandCreate;
