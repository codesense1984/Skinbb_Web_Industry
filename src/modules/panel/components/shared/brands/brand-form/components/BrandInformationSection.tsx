import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { MODE, type Option } from "@/core/types";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { brandFormSchema, type BrandFormData } from "../brand.schema";

interface BrandInformationSectionProps {
  control: Control<BrandFormData>;
  mode: MODE;
  productCategoryOptions: Option[];
}

export const BrandInformationSection: React.FC<
  BrandInformationSectionProps
> = ({ control, mode, productCategoryOptions }) => {
  const fieldConfigs = useMemo(
    () =>
      brandFormSchema.brand_information.map((field) => ({
        ...field,
        disabled: field.name === "status" ? true : mode === MODE.VIEW,
        ...(field.name === "product_category" &&
          productCategoryOptions && {
            options: productCategoryOptions,
          }),
      })) as FormFieldConfig<BrandFormData>[],
    [mode, productCategoryOptions],
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Brand Information</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormFieldsRenderer<BrandFormData>
          control={control}
          fieldConfigs={fieldConfigs}
          className="contents"
        />
      </div>
    </div>
  );
};
