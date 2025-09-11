import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { useImagePreview } from "@/core/hooks/useImagePreview";
import { MODE } from "@/core/types";
import { useFormContext, useWatch } from "react-hook-form";
import {
  companyEditDetailsSchema,
  type CompanyEditFormType,
} from "../../schema/companyEdit.schema";

interface CompanyEditDetailsProps {
  mode: MODE;
}

const CompanyEditDetails: React.FC<CompanyEditDetailsProps> = ({ mode }) => {
  const { control, setValue } = useFormContext<CompanyEditFormType>();

  const companyId = useWatch({
    control,
    name: "_id",
  });
  const companyName = useWatch({
    control,
    name: "companyName",
  });

  const profileData = useWatch({
    control,
    name: "logo_files",
  })?.[0];
  const profileDataLogo = useWatch({
    control,
    name: "logo",
  });

  const uploadFields = companyEditDetailsSchema.uploadImage({
    mode,
    hasCompany: !!companyId || !companyName,
  }) as FormFieldConfig<CompanyEditFormType>[];

  const infoFields = companyEditDetailsSchema.company_information({
    mode,
    hasCompany: !!companyId || !companyName,
  }) as FormFieldConfig<CompanyEditFormType>[];

  const { element } = useImagePreview(profileData, profileDataLogo, {
    clear: () => {
      setValue("logo_files", undefined);
      setValue("logo", "");
    },
  });

  return (
    <>
      <div className="flex items-center gap-4">
        {element}
        <FormFieldsRenderer<CompanyEditFormType>
          className="w-full grid-cols-1 sm:grid-cols-1 lg:grid-cols-1"
          control={control}
          fieldConfigs={uploadFields}
        />
      </div>
      <br />
      <FormFieldsRenderer<CompanyEditFormType>
        className="gap-6"
        control={control}
        fieldConfigs={infoFields}
      />
    </>
  );
};

export default CompanyEditDetails;
