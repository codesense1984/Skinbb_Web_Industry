import React, { Fragment, useMemo } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import {
  companyEditDetailsSchema,
  type CompanyEditFormType,
} from "../../schema/companyEdit.schema";
import { Separator } from "@/core/components/ui/separator";

interface CompanyEditAddressDetailsProps {
  mode: MODE;
}

export const CompanyEditAddressDetails: React.FC<
  CompanyEditAddressDetailsProps
> = ({ mode }) => {
  const { control } = useFormContext<CompanyEditFormType>();

  const { fields } = useFieldArray({
    control,
    name: "address",
  });

  // Watch all address types to check if any is already "registered"
  const addressTypes = useWatch({
    control,
    name: "address",
  });

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
      {!fields.length && (
        <div className="text-muted-foreground">No address found</div>
      )}

      {fields?.map((field, idx) => {
        // Check if this address is already "registered"
        const isCurrentRegistered = field.addressType === "registered";

        // for each block, prefix all names with `address.${idx}.`
        const configs = companyEditDetailsSchema.address_information({
          mode,
          index: idx,
          disabledAddressType: isCurrentRegistered && !!companyId,
          disabled: field.addressType === "registered" && !!companyId,
        }) as FormFieldConfig<CompanyEditFormType>[];

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
            <FormFieldsRenderer<CompanyEditFormType>
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
