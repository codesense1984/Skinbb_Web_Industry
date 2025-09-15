import { PageContent } from "@/core/components/ui/structure";
import { FullLoader } from "@/core/components/ui/loader";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGetCompanyLocationBrandById } from "@/modules/panel/services/http/company.service";
import BrandForm from "../shared/brand-form";
import { MODE } from "@/core/types";
import type { BrandFormData } from "../schema/brand.schema";
import { getDefaultValues } from "../shared/brand-form";
import { BRAND_MESSAGES } from "../utils/brand.utils";
import { useBrandData } from "../hooks/useBrandMutations";

interface BrandPageWrapperProps {
  mode: MODE;
  title: string;
  description: string;
  onSubmit: (data: BrandFormData) => void;
  submitting?: boolean;
  brandId?: string;
}

/**
 * Reusable wrapper component for brand pages (create/edit)
 * Handles data fetching for edit mode and provides consistent page structure
 */
export const BrandPageWrapper = ({
  mode,
  title,
  description,
  onSubmit,
  submitting = false,
  brandId,
}: BrandPageWrapperProps) => {
  const { companyId, locationId, queryKey, enabled } = useBrandData(
    brandId || "",
  );

  // Fetch brand data for edit mode
  const {
    data: brandData,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey,
    queryFn: () =>
      apiGetCompanyLocationBrandById(companyId!, locationId!, brandId!),
    enabled: enabled && mode === MODE.EDIT,
  });

  if (isLoading) {
    return <FullLoader />;
  }

  if (fetchError) {
    toast.error(fetchError?.message || BRAND_MESSAGES.LOAD_ERROR);
    return null;
  }

  const defaultValues =
    mode === MODE.EDIT ? getDefaultValues(brandData?.data) : undefined;

  return (
    <PageContent
      header={{
        title,
        description,
      }}
    >
      <BrandForm
        mode={mode}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitting={submitting}
      />
    </PageContent>
  );
};
