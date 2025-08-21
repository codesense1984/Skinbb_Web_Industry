import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { useImagePreview } from "@/core/hooks/useImagePreview";
import { MODE } from "@/core/types";
import type { FC } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  fullCompanyDetailsSchema,
  type FullCompanyFormType,
} from "../../schema/fullCompany.schema";
interface CompanyDetailsProps {
  mode: MODE;
}
const CompanyDetails: FC<CompanyDetailsProps> = ({ mode }) => {
  const { control, setValue } = useFormContext<FullCompanyFormType>();

  const isSubsidiary = useWatch({
    control,
    name: "isSubsidiary",
    defaultValue: "false",
  });

  const profileData = useWatch({
    control,
    name: "logo_files",
  })[0];

  const uploadFields = fullCompanyDetailsSchema.uploadImage({
    mode,
  }) as FormFieldConfig<FullCompanyFormType>[];

  const rawInfoFields = fullCompanyDetailsSchema.company_information({
    mode,
  }) as FormFieldConfig<FullCompanyFormType>[];

  const infoFields = rawInfoFields.filter(
    (field) => field.name !== "headquarterLocation" || JSON.parse(isSubsidiary),
  );

  const { element } = useImagePreview(profileData, {
    clear: () => {
      setValue("logo_files", []);
      setValue("logo", "");
    },
  });

  return (
    <>
      <div className="flex items-center gap-4">
        {element}
        <FormFieldsRenderer<FullCompanyFormType>
          className="w-full grid-cols-1 sm:grid-cols-1 lg:grid-cols-1"
          control={control}
          fieldConfigs={uploadFields}
        />
      </div>

      <FormFieldsRenderer<FullCompanyFormType>
        className="gap-6 lg:grid-cols-2"
        control={control}
        fieldConfigs={infoFields}
      />
    </>
  );
};

export default CompanyDetails;
