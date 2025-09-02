// src/components/onboarding/AddressDetails.tsx
import React, { Fragment, useMemo } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
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
import { Separator } from "@/core/components/ui/separator";

interface AddressDetailsProps {
  mode: MODE;
}

export const AddressDetails: React.FC<AddressDetailsProps> = ({ mode }) => {
  const { control } = useFormContext<FullCompanyFormType>();

  const { fields } = useFieldArray({
    control,
    name: "address",
  });

  // Watch all address types to check if any is already "registered"
  const addressTypes = useWatch({
    control,
    name: "address",
  });
  // Watch all address types to check if any is already "registered"
  const companyId = useWatch({
    control,
    name: "_id",
  });

  // Check if any address is already marked as "registered"
  const hasRegisteredAddress = useMemo(() => {
    return addressTypes?.some((addr) => addr?.addressType === "registered");
  }, [addressTypes]);

  return (
    <div className="space-y-6">
      {fields.map((field, idx) => {
        // Check if this address is already "registered"
        const isCurrentRegistered = field.addressType === "registered";

        // for each block, prefix all names with `address.${idx}.`
        const configs = fullCompanyDetailsSchema[StepKey.ADDRESS_DETAILS]({
          mode,
          index: idx,
          disabledAddressType: isCurrentRegistered && !!companyId,
          disabled: field.addressType === "registered" && !!companyId,
        }) as FormFieldConfig<FullCompanyFormType>[];

        // Modify the address type field options to hide "registered" if already selected elsewhere
        const modifiedConfigs = configs.map((config) => {
          if (
            config.name === `address.${idx}.addressType` &&
            config.type === "select"
          ) {
            return {
              ...config,
              options: config.options?.filter((option) => {
                // If this address is already registered, show all options
                if (isCurrentRegistered) return true;
                // If another address is registered, hide "registered" option
                if (hasRegisteredAddress && option.value === "registered")
                  return false;
                return true;
              }),
            };
          }
          return config;
        });

        return (
          <Fragment key={field.id}>
            <FormFieldsRenderer<FullCompanyFormType>
              control={control}
              fieldConfigs={modifiedConfigs}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2"
            />
            {idx !== fields.length - 1 && <Separator className="my-8" />}
          </Fragment>
        );
      })}
    </div>
  );
};
