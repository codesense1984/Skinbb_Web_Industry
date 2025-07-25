import type { FormFieldConfig } from "@/components/ui/form-input";
import { MAX_FILE_SIZE } from "@/config/constants";
import { MODE } from "@/types";
import type { Company } from "@/types/company.type";
import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export const fullCompanyZodSchema = z
  .object({
    // Logo Upload
    logo: z.any().optional(),
    logo_files: z.any().optional(),

    // Company Information
    companyName: z.string().min(1, "Company name is required"),
    businessType: z.string().min(1, "Business type is required"),
    registeredBusinessNumber: z
      .string()
      .min(1, "Registered business number is required"),
    taxId: z.string().min(1, "TaxId is required"),
    establishedIn: z.string().min(1, "TaxId is required"),
    website: z.string().url("Invalid website URL").optional(),
    description: z.string().optional(),

    // Legal Documents
    certificateOfIncorporation: z.any().optional(),
    gstLicense: z.any().optional(),

    // Address
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    line1: z.string().min(1, "Line1 is required"),
    line2: z.string().optional(),
    postalCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const files = data?.logo_files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      ctx.addIssue({
        path: ["logo"],
        code: z.ZodIssueCode.custom,
        message: "Only .jpg and .png files are accepted.",
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      ctx.addIssue({
        path: ["logo"],
        code: z.ZodIssueCode.custom,
        message: `Max file size is ${MAX_FILE_SIZE}MB.`,
      });
    }
  });

export function fullCompanyDefaultValues(data?: Partial<Company>): Company {
  return {
    logo_files: data?.logo_files ?? [],
    companyName: data?.companyName ?? "",
    businessType: data?.businessType ?? "",
    registeredBusinessNumber: data?.registeredBusinessNumber ?? "",
    taxId: data?.taxId ?? "",
    establishedIn: data?.establishedIn ?? "",
    website: data?.website ?? "",
    description: data?.description ?? "",
    certificateOfIncorporation: data?.certificateOfIncorporation ?? [],
    gstLicense: data?.gstLicense ?? [],
    country: data?.country ?? "",
    state: data?.state ?? "",
    city: data?.city ?? "",
    line1: data?.line1 ?? "",
    line2: data?.line2 ?? "",
    postalCode: data?.postalCode ?? "",
  };
}

export const fullCompanyDetailsSchema: Record<
  string,
  ({ mode }: { mode?: MODE }) => FormFieldConfig<Company>[]
> = {
  uploadImage: ({ mode }) => [
    {
      name: "logo",
      label: "Change Logo",
      type: "file",
      disabled: MODE.VIEW === mode,
      placeholder: "Upload company logo",
      inputProps: {
        accept: ACCEPTED_IMAGE_TYPES.join(", "),
      },
    },
  ],
  company_information: ({ mode }) => [
    {
      name: "companyName",
      label: "Company Name",
      type: "text",
      disabled: MODE.VIEW === mode,
      placeholder: "Enter company name",
    },
    {
      name: "businessType",
      label: "Business Type",
      type: "select",
      disabled: MODE.VIEW === mode,
      options: [
        { label: "Private", value: "private" },
        { label: "Public", value: "public" },
      ],
      placeholder: "Select business type",
    },
    {
      name: "registeredBusinessNumber",
      label: "Registered Business Number",
      type: "text",
      disabled: MODE.VIEW === mode,
      placeholder: "Enter business number",
    },
    {
      name: "taxId",
      label: "Tax Identification Number",
      type: "text",
      disabled: MODE.VIEW === mode,
      placeholder: "Enter tax ID",
    },
    {
      name: "establishedIn",
      label: "Established In",
      type: "text",
      disabled: MODE.VIEW === mode,
      placeholder: "Enter year of establishment",
    },
    {
      name: "website",
      label: "Website",
      type: "text",
      disabled: MODE.VIEW === mode,
      placeholder: "Enter website URL",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      disabled: MODE.VIEW === mode,
      placeholder: "Brief description about the company",
    },
  ],
  legal_documents: ({ mode }) => [
    {
      name: "certificateOfIncorporation",
      label: "Certificate of Incorporation",
      type: "file",
      disabled: MODE.VIEW === mode,
      placeholder: "Upload certificate of incorporation",
    },
    {
      name: "gstLicense",
      label: "Tax Identification",
      type: "file",
      disabled: MODE.VIEW === mode,
      placeholder: "Upload GST licence",
    },
  ],
  address: ({ mode }) => [
    {
      name: "country",
      label: "Country",
      type: "select",
      disabled: MODE.VIEW === mode,
      options: [
        { label: "India", value: "india" },
        { label: "USA", value: "usa" },
      ],
      placeholder: "Select country",
    },
    {
      name: "state",
      label: "State",
      type: "select",
      disabled: MODE.VIEW === mode,
      options: [
        { label: "Delhi", value: "delhi" },
        { label: "California", value: "california" },
      ],
      placeholder: "Select state",
    },
    {
      name: "city",
      label: "City",
      type: "text",
      disabled: MODE.VIEW === mode,
      placeholder: "Enter city",
    },
    {
      name: "line1",
      label: "Line 1",
      type: "text",
      disabled: MODE.VIEW === mode,
      placeholder: "Enter address line 1",
    },
    {
      name: "line2",
      label: "Line 2",
      type: "text",
      disabled: MODE.VIEW === mode,
      placeholder: "Enter address line 2 (optional)",
    },
    {
      name: "postalCode",
      label: "Postal Code",
      type: "text",
      disabled: MODE.VIEW === mode,
      placeholder: "Enter postal code",
    },
  ],
};
