// src/components/onboarding/AddressDetails.tsx
import { FormFieldsRenderer } from "@/core/components/ui/form-input";
import { MODE, type CompanyDocument } from "@/core/types";
import React, { useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  fullCompanyDetailsSchema,
  type FullCompanyFormType,
} from "../../schema/fullCompany.schema";

interface DocumentDetailsProps {
  mode: MODE;
}

const DOC_CONFIGS = [
  {
    key: "coi" as CompanyDocument["type"],
    title: "Certificate of Incorporation",
    numberLabel: "CIN Number",
    numberPlaceholder: "Enter CIN number",
    uploadLabel: "Upload Certificate of Incorporation",
    uploadPlaceholder: "Upload file",
    required: true,
  },
  {
    key: "pan" as CompanyDocument["type"],
    title: "Permanent Account Number (PAN)",
    numberLabel: "PAN Number",
    numberPlaceholder: "Enter PAN number",
    uploadLabel: "Upload PAN Card",
    uploadPlaceholder: "Upload file",
    required: true,
  },
  {
    key: "gstLicense" as CompanyDocument["type"],
    title: "Goods & Services Tax (GST)",
    numberLabel: "GST Number",
    numberPlaceholder: "Enter GST number",
    uploadLabel: "Upload GST Certificate",
    uploadPlaceholder: "Upload file",
    required: false,
  },
  {
    key: "msme" as CompanyDocument["type"],
    title: "MSME Registration",
    numberLabel: "MSME Number",
    numberPlaceholder: "Enter MSME number",
    uploadLabel: "Upload MSME Certificate",
    uploadPlaceholder: "Upload file",
    required: false,
  },
];

export const DocumentDetails: React.FC<DocumentDetailsProps> = ({ mode }) => {
  const { control } = useFormContext<FullCompanyFormType>();

  const { fields, append } = useFieldArray({
    control,
    name: "documents",
  });

  const blankDoc: CompanyDocument = useMemo(
    () => ({ type: "coi", number: "", url: "" }),
    [],
  );

  return (
    <div className="space-y-6">
      {DOC_CONFIGS.map(({ key, title, ...labels }) => {
        const idx = fields.findIndex((f) => f.type === key);
        if (idx === -1) {
          append({ ...blankDoc, type: key });
          return null;
        }

        const configs = fullCompanyDetailsSchema.documents_information({
          mode,
          index: idx,
          numberLabel: labels.numberLabel,
          numberPlaceholder: labels.numberPlaceholder,
          uploadLabel: labels.uploadLabel,
          uploadPlaceholder: labels.uploadPlaceholder,
        });

        return (
          <div key={key} className="space-y-4">
            <p className="text-foreground text-lg font-medium">{title}</p>
            <FormFieldsRenderer<FullCompanyFormType>
              control={control}
              fieldConfigs={configs}
              className="lg:grid-cols-2"
            />
          </div>
        );
      })}

      <FormFieldsRenderer<FullCompanyFormType>
        control={control}
        fieldConfigs={fullCompanyDetailsSchema.terms({
          mode,
        })}
        className="flex"
      />
    </div>
  );
};
