import { BrandPageWrapper } from "../components/BrandPageWrapper";
import { useBrandUpdateMutation } from "../hooks/useBrandMutations";
import { MODE } from "@/core/types";
import type { BrandFormData } from "../schema/brand.schema";
import { useParams } from "react-router";

const CompanyLocationBrandEdit = () => {
  const { brandId } = useParams();
  const brandMutation = useBrandUpdateMutation();

  const handleSubmit = (data: BrandFormData) => {
    brandMutation.mutate(data);
  };

  return (
    <BrandPageWrapper
      mode={MODE.EDIT}
      title="Edit Brand"
      description="Update brand information and details"
      onSubmit={handleSubmit}
      submitting={brandMutation.isPending}
      brandId={brandId}
    />
  );
};

export default CompanyLocationBrandEdit;
