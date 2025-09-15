import { BrandPageWrapper } from "../components/BrandPageWrapper";
import { useBrandCreateMutation } from "../hooks/useBrandMutations";
import { MODE } from "@/core/types";
import type { BrandFormData } from "../schema/brand.schema";

const CompanyLocationBrandCreate = () => {
  const brandMutation = useBrandCreateMutation();

  const handleSubmit = (data: BrandFormData) => {
    brandMutation.mutate(data);
  };

  return (
    <BrandPageWrapper
      mode={MODE.ADD}
      title="Create Brand"
      description="Add a new brand for this location"
      onSubmit={handleSubmit}
      submitting={brandMutation.isPending}
    />
  );
};

export default CompanyLocationBrandCreate;
