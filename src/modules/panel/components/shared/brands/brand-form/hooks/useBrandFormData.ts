import { useMemo } from "react";
import { defaultValues, type BrandFormData } from "../brand.schema";

interface UseBrandFormDataProps {
  companyId?: string;
  locationId?: string;
}

export const useBrandFormData = ({
  companyId,
  locationId,
}: UseBrandFormDataProps) => {
  const initialDefaultValues: BrandFormData = useMemo(
    () => ({
      ...defaultValues,
      ...(companyId && { company_id: companyId }),
      ...(locationId && { location_id: locationId }),
    }),
    [companyId, locationId],
  );

  return { initialDefaultValues };
};
