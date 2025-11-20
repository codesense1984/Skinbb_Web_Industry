import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import type { Control } from "react-hook-form";
import { brandFormSchema, type BrandFormData } from "../brand.schema";

interface SocialMediaSectionProps {
  control: Control<BrandFormData>;
  mode: MODE;
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  control,
  mode,
}) => {
  const fieldConfigs = brandFormSchema.social_media_urls.map((field) => ({
    ...field,
    disabled: mode === MODE.VIEW,
  })) as FormFieldConfig<BrandFormData>[];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Social Media URLs</h2>
      <FormFieldsRenderer<BrandFormData>
        control={control}
        fieldConfigs={fieldConfigs}
        className="!sm:grid-cols-2 !grid !grid-cols-1 !gap-4"
      />
    </div>
  );
};
