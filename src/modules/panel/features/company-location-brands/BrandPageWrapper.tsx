import { useParams } from "react-router";
import { MODE } from "@/core/types";
import UnifiedBrandForm from "../brands/shared/UnifiedBrandForm";
import type { BrandFormData } from "./brand.schema";
import { useBrandUpdateMutation } from "./useBrandMutations";

interface BrandPageWrapperProps {
  mode: MODE;
  title: string;
  description: string;
  onSubmit?: (data: BrandFormData) => void;
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
  const { companyId, locationId } = useParams();
  const brandMutation = useBrandUpdateMutation();

  const handleSubmit = (data: BrandFormData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      brandMutation.mutate(data);
    }
  };

  return (
    <UnifiedBrandForm
      mode={mode}
      title={title}
      description={description}
      companyId={companyId}
      locationId={locationId}
      brandId={brandId}
      onSubmit={handleSubmit}
      submitting={submitting || brandMutation.isPending}
    />
  );
};
