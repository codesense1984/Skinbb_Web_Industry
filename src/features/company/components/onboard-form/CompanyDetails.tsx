import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/components/ui/form-input";
import { TitledSection } from "@/components/ui/section";
import { useImagePreview } from "@/hooks/useImagePreview";
import { MODE, type Company } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Step, useOnBoardContext } from ".";
import {
  fullCompanyDefaultValues,
  fullCompanyDetailsSchema,
  fullCompanyZodSchema,
} from "../../schema/fullCompany.schema";
import { toast } from "sonner";

const CompanyDetails = () => {
  const { mode, steps, goToNextStep, form: formValues } = useOnBoardContext();

  const form = useForm<Company>({
    defaultValues: fullCompanyDefaultValues(formValues[Step.company_details]),
    resolver: zodResolver(fullCompanyZodSchema),
  });

  const { control, setValue, watch, handleSubmit, reset } = form;

  const profileData = watch("logo_files")?.[0];

  const { element } = useImagePreview(profileData, {
    clear: () => {
      setValue("logo_files", []);
      setValue("logo", undefined);
    },
  });

  const onSubmit = (data: Company) => {
    console.log("Submitted", data);
    toast.success(`${steps[0].title} submitted successfully!`);
    goToNextStep();
  };

  const action = (
    <div className="flex justify-end gap-4">
      <Button variant="outlined" type="reset" onClick={() => reset()}>
        Reset
      </Button>
      <Button color="primary" type="submit">
        Save & Next
      </Button>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TitledSection
          className="space-y-8"
          title="Add Company details"
          titleProps={{ className: "h5" }}
          actions={mode !== MODE.VIEW && action}
        >
          <div className="flex items-center gap-4">
            {element}
            <FormFieldsRenderer<Company>
              className="flex"
              control={control}
              fieldConfigs={
                fullCompanyDetailsSchema.uploadImage({
                  mode,
                }) as FormFieldConfig<Company>[]
              }
            />
          </div>

          <TitledSection title="Company Information">
            <FormFieldsRenderer<Company>
              control={control}
              fieldConfigs={
                fullCompanyDetailsSchema.company_information({
                  mode,
                }) as FormFieldConfig<Company>[]
              }
            />
          </TitledSection>

          <TitledSection title="Legal Documents">
            <FormFieldsRenderer<Company>
              control={control}
              fieldConfigs={
                fullCompanyDetailsSchema.legal_documents({
                  mode,
                }) as FormFieldConfig<Company>[]
              }
            />
          </TitledSection>

          <TitledSection title="Address Information">
            <FormFieldsRenderer<Company>
              control={control}
              fieldConfigs={
                fullCompanyDetailsSchema.address({
                  mode,
                }) as FormFieldConfig<Company>[]
              }
            />
          </TitledSection>

          {mode !== MODE.VIEW && action}
        </TitledSection>
      </form>
    </Form>
  );
};

export default CompanyDetails;
