import { MODE } from "@/core/types";
import { useParams, useSearchParams } from "react-router";
import {
  BrandPageWrapper,
  useBrandUpdateMutation,
} from "../../../components/pages/brands/brand-form";
import type { BrandFormData } from "../create/formSchema";

const CompanyLocationBrandEdit = () => {
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
  }: {
    companyId: string;
    locationId: string;
    brandId: string;
    data: BrandFormData;
  }) => {
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
    <BrandPageWrapper
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

export default CompanyLocationBrandEdit;
