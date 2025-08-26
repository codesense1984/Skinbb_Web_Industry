import {
  INPUT_TYPES,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { MAX_FILE_SIZE } from "@/core/config/constants";
import { MODE } from "@/core/types";
import type {
  Company,
  CompanyAddress,
  CompanyDocument,
} from "@/modules/panel/types/company.type";
import { z } from "zod";
import { StepKey } from "../components/onboard-form";

export type CompanyFormValues = Omit<
  Company,
  "id" | "status" | "createdAt" | "updatedAt" | "documents"
> & {
  logo_files: File[];
  documents: (CompanyDocument & { url_files?: File })[];
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const ACCEPTED_FILE_TYPES = ["application/pdf"];
const DocumentSchema = z
  .object({
    type: z.enum(["coi", "pan", "gstLicense", "msme"]),
    number: z.string().optional(),
    url: z.string().optional(),
    url_files: z.any().optional(),
  })
  .superRefine((doc, ctx) => {
    if (doc.type === "coi") {
      if (!doc.number?.trim()) {
        ctx.addIssue({
          path: ["number"],
          code: z.ZodIssueCode.custom,
          message: "CIN number is required",
        });
      }
      if (doc?.url_files && doc?.url_files.length) {
        const file = doc?.url_files[0];
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          ctx.addIssue({
            path: ["url"],
            code: z.ZodIssueCode.custom,
            message: "Only .pdf files are accepted.",
          });
        }

        if (file.size > MAX_FILE_SIZE) {
          ctx.addIssue({
            path: ["url"],
            code: z.ZodIssueCode.custom,
            message: `Max file size is ${MAX_FILE_SIZE}MB.`,
          });
        }
      }
      if (!doc.url?.trim()) {
        ctx.addIssue({
          path: ["url"],
          code: z.ZodIssueCode.custom,
          message: "CIN document upload is required",
        });
      }
    }
    if (doc.type === "pan") {
      if (!doc.number?.trim()) {
        ctx.addIssue({
          path: ["number"],
          code: z.ZodIssueCode.custom,
          message: "PAN number is required",
        });
      }
      if (!doc.url?.trim()) {
        ctx.addIssue({
          path: ["url"],
          code: z.ZodIssueCode.custom,
          message: "PAN document upload is required",
        });
      }
    }
  });

export const fullCompanyZodSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phoneNumber: z.string().min(10, "Invalid phone"),
    designation: z.string().min(1, "Designation is required"),
    phoneVerified: z.boolean().refine((val) => val, {
      message: "Phone number is not verified",
    }),
    password: z
      .string()
      .nonempty("Password is required") // makes sure it's not empty
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be at most 20 characters")
      .regex(
        /^(?![0-9])(?=.*[0-9])(?=.*[@#$%!*&])([^\s])+$/,
        "Password must start with a non-digit, include at least one number, one special character (@#$%!*&), and contain no whitespace",
      ),

    logo: z.any().optional().or(z.literal("")),
    logo_files: z.any().optional(),

    companyName: z.string().min(1, "Company name is required"),
    category: z.string().min(1, "Category is required"),
    businessType: z.string().min(1, "Business type is required"),
    establishedIn: z.union([
      z.string().min(1, "Established year is required"),
      z.date(),
    ]),
    website: z
      .string()
      .refine((s) => !/^[a-z][a-z0-9+.-]*:\/\//i.test(s), {
        message: "Please omit the protocol (e.g. no “http://” or “https://”).",
      })
      .refine(
        (s) => {
          try {
            const u = new URL(`https://${s}`);
            const h = u.hostname;
            return (
              h === "localhost" ||
              /^(\d{1,3}\.){3}\d{1,3}$/.test(h) ||
              /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(h)
            );
          } catch {
            return false;
          }
        },
        {
          message:
            "Invalid URL—make sure it’s a hostname (and optional path/query/hash) only.",
        },
      )
      .optional()
      // allow empty string so optional fields don’t fail when untouched
      .or(z.literal("")),
    isSubsidiary: z.string(),
    headquarterLocation: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),

    // Step 2 (we only ever render one address, so enforce length === 1)
    address: z
      .array(
        z.object({
          addressType: z.literal("registered"),
          address: z.string().min(1, "Address is required"),
          landmark: z.string().min(1, "Landmark is required"),
          phoneNumber: z.string().min(1, "Phone number is required"),
          country: z.string().min(1, "Country is required"),
          state: z.string().min(1, "State is required"),
          city: z.string().min(1, "City is required"),
          postalCode: z
            .string()
            .min(1, "Postal code is required")
            .regex(/^\d{6}$/, "Must be exactly 6 digits"),
        }),
      )
      .length(1, "You must provide your registered address"),

    // Step 3
    documents: z.array(DocumentSchema),
    agreeTermsConditions: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const logoFiles = data?.logo_files;
    const headquarterLocation = data?.headquarterLocation;
    const phoneVerified = data?.phoneVerified;
    const isSubsidiary = JSON.parse(data?.isSubsidiary) ?? false;

    if (logoFiles && logoFiles.length) {
      const file = logoFiles[0];

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
    }

    if (isSubsidiary && !String(headquarterLocation).trim()) {
      ctx.addIssue({
        path: ["headquarterLocation"],
        code: z.ZodIssueCode.custom,
        message: "Headquarter location is required for subsidiaries.",
      });
    }

    if (!phoneVerified && data?.phoneNumber) {
      ctx.addIssue({
        path: ["phoneNumber"],
        code: z.ZodIssueCode.custom,
        message: "Phone number is not verified",
      });
    }
  });

export type FullCompanyFormType = z.infer<typeof fullCompanyZodSchema>;

export function fullCompanyDefaultValues(
  data?: Partial<FullCompanyFormType>,
): FullCompanyFormType {
  return {
    // personal details
    name: data?.name ?? "",
    email: data?.email ?? "",
    designation: data?.email ?? "",
    password: data?.password ?? "",
    phoneNumber: data?.phoneNumber ?? "",
    phoneVerified: data?.phoneVerified ?? false,

    // Step 1
    logo: data?.logo ?? "",
    logo_files: data?.logo_files ?? [],
    companyName: data?.companyName ?? "",
    category: data?.category ?? "",
    businessType: data?.businessType ?? "",
    establishedIn: data?.establishedIn ?? "",
    website: data?.website ?? "",
    isSubsidiary: String(data?.isSubsidiary ?? false),
    headquarterLocation: data?.headquarterLocation ?? "",
    description: data?.description ?? "",

    // Step 2 (single-address array)
    address:
      data?.address?.length === 1
        ? data.address
        : [
            {
              addressType: "registered",
              address: "",
              landmark: "",
              phoneNumber: "",
              country: "",
              state: "",
              city: "",
              postalCode: "",
            },
          ],

    // Step 3 (four documents)
    documents:
      data?.documents?.length === 4
        ? data.documents
        : [
            { type: "coi", number: "", url: "" },
            { type: "pan", number: "", url: "" },
            { type: "gstLicense", number: "", url: "" },
            { type: "msme", number: "", url: "" },
          ],

    // Terms
    agreeTermsConditions: data?.agreeTermsConditions ?? false,
  };
}

type ModeProps = { mode: MODE };
type FieldProps = {
  uploadImage: ModeProps;
  [StepKey.PERSONAL_INFORMATION]: ModeProps;
  [StepKey.COMPANY_DETAILS]: ModeProps;
  [StepKey.DOCUMENTS_DETAILS]: ModeProps & {
    index: number;
    numberLabel?: string;
    numberPlaceholder?: string;
    uploadLabel?: string;
    uploadPlaceholder?: string;
  };
  [StepKey.ADDRESS_DETAILS]: ModeProps & { index: number };
  terms: ModeProps;
};

export type FullCompanyDetailsSchemaProps = {
  [K in keyof FieldProps]: (
    props: FieldProps[K],
  ) => FormFieldConfig<FullCompanyFormType>[];
};

export const fullCompanyDetailsSchema: FullCompanyDetailsSchemaProps = {
  personal_information: ({ mode }) => [
    {
      name: "name",
      label: "Full Name",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter full name",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "email",
      label: "Email Address",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter email address",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "designation",
      label: "Designation",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter designation",
      disabled: mode === MODE.VIEW,
    },
  ],
  uploadImage: ({ mode }) => [
    {
      name: "logo",
      label: "Company Logo",
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
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter company name",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "category",
      label: "Category",
      type: INPUT_TYPES.SELECT,
      options: [
        { label: "Principle", value: "principle" },
        { label: "Distributor", value: "distributor" },
      ],
      placeholder: "Select category",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "businessType",
      label: "Business Type",
      type: INPUT_TYPES.SELECT,
      options: [
        { label: "Private LTD", value: "private-ltd" },
        { label: "Public", value: "public" },
      ],
      placeholder: "Select business type",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "establishedIn",
      label: "Established In",
      type: INPUT_TYPES.DATEPICKER,
      mode: "single",
      placeholder: "Enter year of establishment",
      disabled: mode === MODE.VIEW,
    },

    {
      name: "website",
      label: "Website (optional)",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter website URL",
      disabled: mode === MODE.VIEW,
      inputProps: {
        startIcon: <p>https://</p>,
        className: "pl-17",
      },
    },
    {
      name: "isSubsidiary",
      label: "Subsidiary of global business?",
      type: INPUT_TYPES.SELECT,
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
      placeholder: "Select option",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "headquarterLocation",
      label: "Headquarters Location",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter HQ location",
      disabled: mode === MODE.VIEW,
      className: "sm:col-span-2",
    },
    {
      name: "description",
      label: "Company Description (optional)",
      type: INPUT_TYPES.TEXTAREA,
      placeholder: "Brief description about the company",
      disabled: mode === MODE.VIEW,
      className: "sm:col-span-2",
    },
  ],

  documents_information: ({
    mode,
    index,
    numberLabel = "Number",
    numberPlaceholder = "Enter Number",
    uploadLabel = "Upload Document",
    uploadPlaceholder = "Upload Document",
  }) => {
    const prefix = `documents.${index}`; // dynamic prefix

    const makeName = (field: keyof CompanyDocument) =>
      `${prefix}.${field}` as keyof FullCompanyFormType;

    return [
      {
        name: makeName("number"),
        label: numberLabel,
        type: INPUT_TYPES.TEXT,
        placeholder: numberPlaceholder,
        disabled: mode === MODE.VIEW,
      },
      {
        name: makeName("url"),
        label: uploadLabel,
        type: INPUT_TYPES.FILE,
        placeholder: uploadPlaceholder,
        disabled: mode === MODE.VIEW,
        inputProps: { accept: ACCEPTED_FILE_TYPES.join(", ") },
      },
    ];
  },

  address_information: ({ mode, index = 0 }) => {
    const prefix = `address.${index}`; // dynamic prefix

    const makeName = (field: keyof CompanyAddress) =>
      `${prefix}.${field}` as keyof FullCompanyFormType;

    return [
      {
        name: makeName("address"),
        label: "Address",
        type: INPUT_TYPES.TEXTAREA,
        placeholder: "Enter address",
        disabled: mode === MODE.VIEW,
        className: "sm:col-span-3",
      },
      {
        name: makeName("landmark"),
        label: "Landmark",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter landmark",
        disabled: mode === MODE.VIEW,
      },
      {
        name: makeName("phoneNumber"),
        label: "Landline number",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter landline number",
        disabled: mode === MODE.VIEW,
        inputProps: {
          keyfilter: "int",
          maxLength: 10,
        },
      },
      {
        name: makeName("country"),
        label: "Country",
        type: INPUT_TYPES.SELECT,
        options: [
          { label: "India", value: "india" },
          { label: "USA", value: "usa" },
        ],
        placeholder: "Select country",
        disabled: mode === MODE.VIEW,
      },
      {
        name: makeName("state"),
        label: "State",
        type: INPUT_TYPES.SELECT,
        options: [
          { label: "Delhi", value: "delhi" },
          { label: "California", value: "california" },
        ],
        placeholder: "Select state",
        disabled: mode === MODE.VIEW,
      },
      {
        name: makeName("city"),
        label: "City",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter city",
        disabled: mode === MODE.VIEW,
      },
      {
        name: makeName("postalCode"),
        label: "Postal Code",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter postal code",
        disabled: mode === MODE.VIEW,
        inputProps: {
          keyfilter: "int",
          maxLength: 6,
        },
      },
    ];
  },
  terms: ({ mode }) => [
    {
      name: "agreeTermsConditions",
      label: "I agree to the Terms & Conditions",
      type: INPUT_TYPES.CHECKBOX,
      disabled: mode === MODE.VIEW,
    },
  ],
};
