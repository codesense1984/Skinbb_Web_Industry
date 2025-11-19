import { BrandPageWrapper } from "../BrandPageWrapper";
import { useBrandCreateMutation } from "../useBrandMutations";
import { MODE } from "@/core/types";
import type { BrandFormData } from "../brand.schema";
import { useParams } from "react-router";

const CompanyLocationBrandCreate = () => {
  const { companyId, locationId } = useParams();
  const brandMutation = useBrandCreateMutation();

  const handleSubmit = (data: BrandFormData) => {
    brandMutation.mutate(data);
  };

  return (
    <>
      Location Brands Create
      <BrandPageWrapper
        mode={MODE.ADD}
        title="Create Brand"
        description="Add a new brand for this location"
        companyId={companyId}
        locationId={locationId}
        onSubmit={handleSubmit}
        submitting={brandMutation.isPending}
      />
    </>
  );
};

export default CompanyLocationBrandCreate;
