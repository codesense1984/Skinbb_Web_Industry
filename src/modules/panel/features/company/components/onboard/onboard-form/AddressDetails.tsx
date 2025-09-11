// src/components/onboarding/AddressDetails.tsx
import React, { Fragment, useMemo } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { MODE } from "@/core/types";
import { type FullCompanyFormType } from "../../../schema/fullCompany.schema";
import { Separator } from "@/core/components/ui/separator";
import { AddressForm } from "./AddressForm";

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
        return (
          <Fragment key={field.id}>
            <AddressForm
              mode={mode}
              addressIndex={idx}
              field={field}
              companyId={companyId}
              hasRegisteredAddress={hasRegisteredAddress}
            />
            {idx !== fields.length - 1 && <Separator className="my-8" />}
          </Fragment>
        );
      })}
    </div>
  );
};
