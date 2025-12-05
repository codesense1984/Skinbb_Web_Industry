import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import type { CompanyDocument } from "@/modules/panel/types";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import React from "react";
import {
  useFieldArray,
  useFormContext,
  useWatch,
  type Control,
  type FieldArrayWithId,
  type UseFormSetValue,
} from "react-hook-form";
import {
  fullCompanyDetailsSchema,
  type FullCompanyFormType,
} from "../../../schema/fullCompany.schema";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/core/components/ui/button";

interface DocumentDetailsProps {
  mode: MODE;
  onVerificationComplete?: (index: number) => void;
}

interface DocumentConfigItemProps {
  key: string;
  title: string;
  numberLabel: string;
  numberPlaceholder: string;
  uploadLabel: string;
  uploadPlaceholder: string;
  required: boolean;
  showNumber?: false;
}

const DOC_VERIFIED_KEYS = ["coi", "gstLicense", "pan"];

const DOC_CONFIGS: DocumentConfigItemProps[] = [
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
    required: true,
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
  {
    key: "fssai" as CompanyDocument["type"],
    title: "FSSAI Registration",
    numberLabel: "FSSAI Number",
    numberPlaceholder: "Enter FSSAI number",
    uploadLabel: "Upload FSSAI Certificate",
    uploadPlaceholder: "Upload file",
    required: false,
  },
  {
    key: "drug_license" as CompanyDocument["type"],
    title: "Drug License",
    numberLabel: "Drug License Number",
    numberPlaceholder: "Enter Drug License number",
    uploadLabel: "Upload Drug License Certificate",
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
  const { control, setValue } = useFormContext<FullCompanyFormType>();

  const { fields } = useFieldArray({
    control,
    name: "documents",
  });

  // Watch businessType to conditionally show/hide CIN field
  const businessType = useWatch({
    control,
    name: "businessType",
  });

  // Filter out CIN document for proprietor business type
  const filteredDocConfigs = DOC_CONFIGS.filter((document) => {
    if (document.key === "coi" && businessType === "proprietor") {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {filteredDocConfigs.map((document) => (
        <DocumentItem
          key={document.key}
          document={document}
          fields={fields}
          mode={mode}
          control={control}
          setValue={setValue}
        />
      ))}
    </div>
  );
};

const DocumentItem = ({
  document,
  fields,
  mode,
  control,
  setValue,
}: {
  document: DocumentConfigItemProps;
  fields: FieldArrayWithId<FullCompanyFormType, "documents", "id">[];
  mode: MODE;
  control: Control<FullCompanyFormType>;
  setValue: UseFormSetValue<FullCompanyFormType>;
}) => {
  const { key, title, ...labels } = document;
  const idx = fields.findIndex((f) => f.type === key);

  const isVerified = useWatch({
    control,
    name: `documents.${idx}.verified`,
  });

  if (idx === -1) {
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
    key: key,
    required: labels.required,
  });

  const changeConfigs = configs.map((config) => {
    if (DOC_VERIFIED_KEYS.includes(String(config.key ?? ""))) {
      return {
        ...config,
        disabled:
          mode === MODE.VIEW || config.type === "text" ? isVerified : false,
        label:
          config.type === "text" && isVerified ? (
            <span className="flex items-center gap-1">
              {config.label}
              <CheckCircleIcon
                className="h-4 w-4 text-green-500"
                title={`${config.label} is verified`}
              />
            </span>
          ) : (
            config.label
          ),
        inputProps: {
          ...config.inputProps,
          endIcon:
            config.type === "text" && isVerified ? (
              <Button
                type="button"
                size={"icon"}
                variant={"outlined"}
                className="-me-0.5 rounded-l-none"
                onClick={() => {
                  setValue(`documents.${idx}.verified`, false, {
                    shouldValidate: true,
                  });
                }}
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            ) : undefined,
        },
      };
    }
    return config;
  }) as FormFieldConfig<FullCompanyFormType>[];

  return (
    <div key={key} className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-foreground text-lg font-medium">{title}</p>
      </div>
      <FormFieldsRenderer<FullCompanyFormType>
        control={control}
        fieldConfigs={changeConfigs}
        className="lg:grid-cols-2"
      />
    </div>
  );
};
