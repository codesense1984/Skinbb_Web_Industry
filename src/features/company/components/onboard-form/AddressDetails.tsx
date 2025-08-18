// src/components/onboarding/AddressDetails.tsx
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import {
  fullCompanyDetailsSchema,
  type FullCompanyFormType,
} from "../../schema/fullCompany.schema";
import { StepKey } from ".";

interface AddressDetailsProps {
  mode: MODE;
}

export const AddressDetails: React.FC<AddressDetailsProps> = ({ mode }) => {
  const { control } = useFormContext<FullCompanyFormType>();

  const { fields } = useFieldArray({
    control,
    name: "address",
  });

  return (
    <div className="space-y-6">
      {fields.map((field, idx) => {
        // for each block, prefix all names with `address.${idx}.`
        const configs = fullCompanyDetailsSchema[StepKey.ADDRESS_DETAILS]({
          mode,
          index: idx,
        }) as FormFieldConfig<FullCompanyFormType>[];

        return (
          <FormFieldsRenderer<FullCompanyFormType>
            key={field.id}
            control={control}
            fieldConfigs={configs}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          />
        );
      })}
    </div>
  );
};
