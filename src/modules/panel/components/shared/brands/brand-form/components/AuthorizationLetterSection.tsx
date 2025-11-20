import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import type { Control } from "react-hook-form";
import { brandFormSchema, type BrandFormData } from "../brand.schema";

interface AuthorizationLetterSectionProps {
  control: Control<BrandFormData>;
  mode: MODE;
}

export const AuthorizationLetterSection: React.FC<
  AuthorizationLetterSectionProps
> = ({ control, mode }) => {
  const fieldConfigs = brandFormSchema.brand_authorization_letter.map(
    (field) => ({
      ...field,
      disabled: mode === MODE.VIEW,
      required: mode === MODE.ADD,
    }),
  ) as FormFieldConfig<BrandFormData>[];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Brand Authorization Letter
        {mode === MODE.EDIT && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Optional)
          </span>
        )}
      </h2>
      <div className="flex items-center justify-start gap-6">
        <div className="left-0 col-span-1 flex">
          <FormFieldsRenderer<BrandFormData>
            control={control}
            fieldConfigs={fieldConfigs}
            className="!sm:grid-cols-2 !grid w-full !grid-cols-1 !gap-4"
          />
        </div>
      </div>
    </div>
  );
};
