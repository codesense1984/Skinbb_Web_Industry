import { MODE } from "@/core/types/base.type";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
import {
  UnifiedBrandForm,
  useBrandCreateMutation,
} from "@/modules/panel/components/shared/brands/brand-form";
import type { BrandSubmitRequest } from "@/modules/panel/components/shared/brands/brand-form/types";
import { SELLER_ROUTES } from "../../routes/constant";

const BrandCreate = () => {
  const { sellerInfo } = useSellerAuth();
  const companyId = sellerInfo?.companyId;

  const brandMutation = useBrandCreateMutation(
    `${SELLER_ROUTES.BRAND.LIST}?order=desc&sortBy=createdAt`,
  );

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
    <>
      <UnifiedBrandForm
        mode={mode}
        title={"Create Brand"}
        description={"Add a new brand to your portfolio"}
        companyId={companyId || undefined}
        // locationId={locationId || undefined}
        // brandId={id || undefined}
        onSubmit={handleSubmit}
        submitting={brandMutation.isPending}
      />
    </>
  );
};

export default BrandCreate;
