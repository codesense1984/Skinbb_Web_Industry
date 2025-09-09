// src/components/onboarding/AddressForm.tsx
import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import {
  fullCompanyDetailsSchema,
  type FullCompanyFormType,
} from "../../../schema/fullCompany.schema";
import { StepKey } from "../../../config/steps.config";
import { useLocationData } from "../../../hooks/useLocationData";

interface AddressFormProps {
  mode: MODE;
  addressIndex: number;
  field: any;
  companyId?: string;
  hasRegisteredAddress: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  mode,
  hasRegisteredAddress,
  addressIndex,
  field,
  companyId,
}) => {
  const { control } = useFormContext<FullCompanyFormType>();

  // Get location data for this address
  const locationData = useLocationData({
    addressIndex,
  });

  // Watch the country field for this specific address
  const countryValue = useWatch({
    control,
    name: `address.${addressIndex}.country` as any,
  });

  // Check if country is selected for this address
  const isCountrySelected = !!countryValue;

  // Generate form field configurations
  const configs = fullCompanyDetailsSchema[StepKey.ADDRESS_DETAILS]({
    mode,
    index: addressIndex,
    // disabledAddressType: isCurrentRegistered && !!companyId,
    // disabled:
    //   (field.addressType === "registered" && !!companyId) || !!field.addressId,
    disabled: mode === MODE.EDIT ? false : !!field.addressId,
    disabledAddressType: false,
    isCountrySelected,
    dynamicOptions: {
      countries: locationData.countries,
      states: locationData.states,
    },
  }) as FormFieldConfig<FullCompanyFormType>[];

  // Modify the address type field options to hide "registered" if already selected elsewhere
  const modifiedConfigs = configs.map((config) => {
    if (
      config.name === `address.${addressIndex}.addressType` &&
      config.type === "select"
    ) {
      return {
        ...config,
        options: config.options?.map((option) => ({
          ...option,
          disabled: hasRegisteredAddress && option.value === "registered",
        })),
      };
    }
    return config;
  });

  return (
    <FormFieldsRenderer<FullCompanyFormType>
      control={control}
      fieldConfigs={modifiedConfigs}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2"
    />
  );
};
