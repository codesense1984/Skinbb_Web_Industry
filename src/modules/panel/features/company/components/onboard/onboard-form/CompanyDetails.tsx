import { ComboBox } from "@/core/components/ui/combo-box";
import {
  FormFieldsRenderer,
  type CustomRenders,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { Input } from "@/core/components/ui/input";
import { useImagePreview } from "@/core/hooks/useImagePreview";
import { MODE } from "@/core/types";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import {
  apiGetCompanyDropdownList,
  apiGetOnboardCompanyDetailById,
} from "@/modules/panel/services/http/company.service";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
import { Button } from "@/core/components/ui/button";
import { STATUS_MAP } from "@/core/config/status";
import { cn } from "@/core/utils";

interface CompanyDetailsProps {
  mode: MODE;
}
const CompanyDetails: FC<CompanyDetailsProps> = ({ mode }) => {
  const { control, setValue, reset } = useFormContext<FullCompanyFormType>();
  const [isLoadingCompanyDetails, setIsLoadingCompanyDetails] = useState(false);

  const isSubsidiary = useWatch({
    control,
    name: "isSubsidiary",
    defaultValue: "false",
  });

  const logoFiles = useWatch({
    control,
    name: "logo_files",
  });

  // Extract File from FileList or array
  const profileData = logoFiles
    ? logoFiles instanceof FileList
      ? logoFiles[0] || null
      : Array.isArray(logoFiles)
        ? logoFiles[0] || null
        : logoFiles instanceof File
          ? logoFiles
          : null
    : null;

  const profileDataLogo = useWatch({
    control,
    name: "logo",
  });

  const isCreatingNewCompany = useWatch({
    control,
    name: "isCreatingNewCompany",
  });

  const disabledCompanyName = useWatch({
    control,
    name: "disabledCompanyName",
  });

  const disabledCompanyDetails = useWatch({
    control,
    name: "disabledCompanyDetails",
  });

  // Fetch company details for dropdown
  const { data: companyDetailsResponse, isLoading: isLoadingCompanies } =
    useQuery({
      queryKey: [ENDPOINTS.SELLER.GET_COMPANY_LIST],
      queryFn: () => apiGetCompanyDropdownList(),
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
      disabled: company.companyStatus !== STATUS_MAP.company.approved.value,
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
        const response = await apiGetOnboardCompanyDetailById(
          selectedCompany._id,
        );

        if (response.company) {
          reset(transformApiResponseToFormData(response.company));
          setValue("disabledCompanyDetails", true, {
            shouldDirty: true,
            shouldTouch: true,
          });
          setValue("isCreatingNewCompany", false, {
            shouldDirty: true,
            shouldTouch: true,
          });
        } else {
          toast.error("Failed to fetch company details");
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
        reset(transformApiResponseToFormData());
        toast.error("Failed to fetch company details");
      } finally {
        setIsLoadingCompanyDetails(false);
      }
    }
  };

  const uploadFields = fullCompanyDetailsSchema.uploadImage({
    mode,
    disabled: disabledCompanyDetails,
  }) as FormFieldConfig<FullCompanyFormType>[];

  const rawCompannyNameFields = fullCompanyDetailsSchema.company_name({
    mode,
  }) as FormFieldConfig<FullCompanyFormType>[];

  const rawInfoFields = fullCompanyDetailsSchema.company_information({
    mode,
    disabled: disabledCompanyDetails,
  }) as FormFieldConfig<FullCompanyFormType>[];

  // Create custom fields with company name field that handles change
  const compannyNameFields = rawCompannyNameFields.map((field) => {
    if (field.name === "companyName") {
      const overridden = {
        ...field,
        type: "custom" as const,
        className: "col-span-2 w-full",
        render: ({
          field: formField,
          fieldState,
        }: CustomRenders<FullCompanyFormType, "companyName">) => {
          if (isCreatingNewCompany)
            return (
              <div
                className="space-y-2"
                key={`company-field-${isCreatingNewCompany}`}
              >
                <Input
                  type="text"
                  placeholder="Enter new company name..."
                  className={mode !== MODE.EDIT ? "pe-15" : ""}
                  invalid={!!fieldState.error}
                  disabled={mode === MODE.EDIT || disabledCompanyName}
                  endIcon={
                    mode !== MODE.EDIT ? (
                      <Button
                        variant={"outlined"}
                        color={"default"}
                        title="Change company select"
                        className="!mr-0 rounded-l-none"
                        startIcon={<XMarkIcon className="size-4" />}
                        type="button"
                        onClick={() => {
                          setValue("isCreatingNewCompany", false, {
                            shouldDirty: true,
                            shouldTouch: true,
                          });
                          setValue("disabledCompanyDetails", true, {
                            shouldDirty: true,
                            shouldTouch: true,
                          });
                          formField.onChange("");
                        }}
                      />
                    ) : undefined
                  }
                  {...formField}
                />
              </div>
            );

          return (
            <div
              className="w-full"
              key={`company-field-${isCreatingNewCompany}`}
            >
              <ComboBox
                options={companyOptions}
                value={formField.value}
                onChange={(value) => {
                  if (value === "__create_new__") {
                    reset(transformApiResponseToFormData());
                    setValue("disabledCompanyDetails", false, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                    formField.onChange("");
                    setValue("isCreatingNewCompany", true, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  } else {
                    formField.onChange(value);
                    handleCompanyChange(value as string);
                  }
                }}
                placeholder="Select a company"
                className={cn(fieldState.error ? "border-red-500" : "")}
                error={!!fieldState.error}
                disabled={
                  isLoadingCompanies ||
                  isLoadingCompanyDetails ||
                  disabledCompanyName
                }
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
          );
        },
      } as unknown as FormFieldConfig<FullCompanyFormType>;
      return overridden;
    }
    return field;
  });
  const infoFields = rawInfoFields.map((field) => {
    return field;
  });

  const filteredInfoFields = infoFields.filter(
    (field) =>
      field.name !== "headquarterLocation" || !!(isSubsidiary === "true"),
  );

  const { element } = useImagePreview(profileData, profileDataLogo, {
    clear: () => {
      setValue("logo_files", undefined);
      setValue("logo", "");
    },
    avatarProps: {
      className: "size-16 rounded-md border border-border",
    },
  });

  return (
    <div className="space-y-8 space-x-8">
      <div className="grid grid-cols-2 gap-6">
        <FormFieldsRenderer<FullCompanyFormType>
          className="gap-6 lg:grid-cols-2"
          control={control}
          fieldConfigs={compannyNameFields}
        />

        <div className="flex items-start gap-4">
          {element}
          <FormFieldsRenderer<FullCompanyFormType>
            className="w-full grid-cols-1 sm:grid-cols-1 lg:grid-cols-1"
            control={control}
            fieldConfigs={uploadFields}
          />
        </div>
      </div>
      <FormFieldsRenderer<FullCompanyFormType>
        className="gap-6 lg:grid-cols-2"
        control={control}
        fieldConfigs={filteredInfoFields}
      />
    </div>
  );
};

export default CompanyDetails;
