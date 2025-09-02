import { ComboBox } from "@/core/components/ui/combo-box";
import {
  FormFieldsRenderer,
  type CustomRenders,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { Input } from "@/core/components/ui/input";
import { useImagePreview } from "@/core/hooks/useImagePreview";
import { MODE } from "@/core/types";
import {
  apiGetCompanyList,
  apiGetCompanyDetailById,
} from "@/modules/panel/services/http/company.service";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  fullCompanyDetailsSchema,
  type FullCompanyFormType,
} from "../../../schema/fullCompany.schema";
import { transformApiResponseToFormData } from "../../../utils/onboarding.utils";

interface CompanyDetailsProps {
  mode: MODE;
}
const CompanyDetails: FC<CompanyDetailsProps> = ({ mode }) => {
  const { control, setValue, reset } = useFormContext<FullCompanyFormType>();
  const [isCreatingNewCompany, setIsCreatingNewCompany] = useState(false);
  const [isLoadingCompanyDetails, setIsLoadingCompanyDetails] = useState(false);

  const isSubsidiary = useWatch({
    control,
    name: "isSubsidiary",
    defaultValue: "false",
  });

  const profileData = useWatch({
    control,
    name: "logo_files",
  })?.[0];

  const companyId = useWatch({
    control,
    name: "_id",
  });
  const companyName = useWatch({
    control,
    name: "companyName",
  });

  // Fetch company details for dropdown
  const { data: companyDetailsResponse, isLoading: isLoadingCompanies } =
    useQuery({
      queryKey: ["companyDetails"],
      queryFn: () => apiGetCompanyList(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  // Transform company data for dropdown options
  const companyOptions = [
    {
      label: (
        <>
          <PlusIcon /> Create new company
        </>
      ),
      value: "__create_new__",
      data: null,
    },
    ...(companyDetailsResponse?.data?.map((company) => ({
      label: company.companyName,
      value: company.companyName,
      data: company,
    })) || []),
  ];

  // Handle company selection and auto-fill
  const handleCompanyChange = async (companyName: string) => {
    const selectedCompany = companyDetailsResponse?.data?.find(
      (company) => company.companyName === companyName,
    );

    if (selectedCompany) {
      setIsLoadingCompanyDetails(true);
      try {
        // Call the API to get detailed company information
        const response = await apiGetCompanyDetailById(selectedCompany._id);

        if (response.data && response.success) {
          reset(transformApiResponseToFormData(response.data));
        } else {
          toast.error("Failed to fetch company details");
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
        toast.error("Failed to fetch company details");
      } finally {
        setIsLoadingCompanyDetails(false);
      }
    }
  };

  const uploadFields = fullCompanyDetailsSchema.uploadImage({
    mode,
    hasCompany: !!companyId || !companyName,
  }) as FormFieldConfig<FullCompanyFormType>[];

  const rawCompannyNameFields = fullCompanyDetailsSchema.company_name({
    mode,
  }) as FormFieldConfig<FullCompanyFormType>[];

  const rawInfoFields = fullCompanyDetailsSchema.company_information({
    mode,
    hasCompany: !!companyId || !companyName,
  }) as FormFieldConfig<FullCompanyFormType>[];

  // Create custom fields with company name field that handles change
  const compannyNameFields = rawCompannyNameFields.map((field) => {
    if (field.name === "companyName") {
      const overridden = {
        ...field,
        type: "custom" as const,
        className: "col-span-2",
        render: ({
          field: formField,
          fieldState,
        }: CustomRenders<FullCompanyFormType, "companyName">) => (
          <div className="space-y-2">
            {isCreatingNewCompany ? (
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter new company name..."
                  className={`form-control ${fieldState.error ? "border-red-500" : ""}`}
                  {...formField}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNewCompany(false);
                    formField.onChange("");
                  }}
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  ← Back to existing companies
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <ComboBox
                  options={companyOptions}
                  value={formField.value}
                  onChange={(value) => {
                    if (value === "__create_new__") {
                      setIsCreatingNewCompany(true);
                      formField.onChange("");
                      reset(transformApiResponseToFormData());
                    } else {
                      formField.onChange(value);
                      handleCompanyChange(value as string);
                    }
                  }}
                  placeholder="Select a company..."
                  className={fieldState.error ? "border-red-500" : ""}
                  error={!!fieldState.error}
                  disabled={isLoadingCompanies || isLoadingCompanyDetails}
                  loading={isLoadingCompanies}
                  clearable={true}
                  searchable={true}
                />
                {isLoadingCompanyDetails && (
                  <div className="border-muted-foreground flex items-center gap-2 text-sm">
                    <div className="border-muted-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Loading company details...
                  </div>
                )}
              </div>
            )}
          </div>
        ),
      } as unknown as FormFieldConfig<FullCompanyFormType>;
      return overridden;
    }
    return field;
  });
  const infoFields = rawInfoFields.map((field) => {
    return field;
  });

  const filteredInfoFields = infoFields.filter(
    (field) => field.name !== "headquarterLocation" || JSON.parse(isSubsidiary),
  );

  const { element } = useImagePreview(profileData, {
    clear: () => {
      setValue("logo_files", undefined);
      setValue("logo", "");
    },
  });

  return (
    <>
      <FormFieldsRenderer<FullCompanyFormType>
        className="gap-6 lg:grid-cols-2"
        control={control}
        fieldConfigs={compannyNameFields}
      />

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
        fieldConfigs={filteredInfoFields}
      />
    </>
  );
};

export default CompanyDetails;
