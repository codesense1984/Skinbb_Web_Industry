// src/components/onboarding/AddressDetails.tsx
import { FormFieldsRenderer } from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import React, { useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  fullCompanyDetailsSchema,
  type FullCompanyFormType,
} from "../../schema/fullCompany.schema";
import type { CompanyDocument } from "@/modules/panel/types";

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
    title: "Goods & Services Tax (GST) (optional)",
    numberLabel: "GST Number",
    numberPlaceholder: "Enter GST number",
    uploadLabel: "Upload GST Certificate",
    uploadPlaceholder: "Upload file",
    required: false,
  },
  {
    key: "msme" as CompanyDocument["type"],
    title: "MSME Registration (optional)",
    numberLabel: "MSME Number",
    numberPlaceholder: "Enter MSME number",
    uploadLabel: "Upload MSME Certificate",
    uploadPlaceholder: "Upload file",
    required: false,
  },
  {
    key: "brandAuthorisation" as CompanyDocument["type"],
    title: "Brand Authorisation Letter",
    numberLabel: "",
    numberPlaceholder: "",
    uploadLabel: "Upload Brand Authorisation Letter",
    uploadPlaceholder: "Upload file",
    required: true,
    showNumber: false,
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
          append({ ...blankDoc, type: key as CompanyDocument["type"] });
          return null;
        }

        const configs = fullCompanyDetailsSchema.documents_information({
          mode,
          index: idx,
          numberLabel: labels.numberLabel,
          numberPlaceholder: labels.numberPlaceholder,
          uploadLabel: labels.uploadLabel,
          uploadPlaceholder: labels.uploadPlaceholder,
          showNumber: labels.showNumber,
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
    </div>
  );
};
