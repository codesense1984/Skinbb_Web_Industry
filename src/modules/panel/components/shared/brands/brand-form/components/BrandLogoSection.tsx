import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { useImagePreview } from "@/core/hooks/useImagePreview";
import { MODE } from "@/core/types";
import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";
import { brandFormSchema, type BrandFormData } from "../brand.schema";

interface BrandLogoSectionProps {
  control: Control<BrandFormData>;
  mode: MODE;
  onClearLogo: () => void;
}

export const BrandLogoSection: React.FC<BrandLogoSectionProps> = ({
  control,
  mode,
  onClearLogo,
}) => {
  const profileData = useWatch({ control, name: "brand_logo_files" })?.[0];
  const existingLogoUrl = useWatch({ control, name: "brand_logo" });

  const { element } = useImagePreview(profileData, existingLogoUrl, {
    clear: onClearLogo,
  });

  const fieldConfigs = brandFormSchema.uploadbrandImage.map((field) => ({
    ...field,
    disabled: mode === MODE.VIEW,
  })) as FormFieldConfig<BrandFormData>[];

  return (
    <div className="space-y-4">
      <h2 className="col-span-1 text-xl font-semibold text-gray-900">
        Brand Logo
      </h2>
      <div className="flex items-center justify-start gap-6">
        <div className="flex">{element}</div>
        <div className="w-full">
          <FormFieldsRenderer<BrandFormData>
            className="w-full md:grid-cols-1 lg:grid-cols-1"
            control={control}
            fieldConfigs={fieldConfigs}
          />
        </div>
      </div>
    </div>
  );
};
