import type { DatePickerProps } from "@/core/components/ui/date-picker";
import {
  INPUT_TYPES,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { MAX_FILE_SIZE } from "@/core/config/constants";
import { MODE } from "@/core/types";
import { COMPANY } from "@/modules/panel/config/constant.config";
import type {
  Company,
  CompanyAddress,
  CompanyDocument,
} from "@/modules/panel/types/company.type";
import { Link } from "react-router";
import { z } from "zod";
import { StepKey } from "../config/steps.config";

export type CompanyFormValues = Omit<
  Company,
  "id" | "status" | "createdAt" | "updatedAt" | "documents"
> & {
  logo_files: File[];
  documents: (CompanyDocument & { url_files?: File })[];
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const ACCEPTED_FILE_TYPES = ["application/pdf"];

// Document type configuration
const DOCUMENT_CONFIG = {
  coi: {
    numberLabel: "CIN number",
    uploadLabel: "CIN document upload",
    requiresNumber: true,
    requiresUpload: true,
  },
  pan: {
    numberLabel: "PAN number",
    uploadLabel: "PAN document upload",
    requiresNumber: true,
    requiresUpload: true,
  },
  gstLicense: {
    numberLabel: "GST number",
    uploadLabel: "GST document upload",
    requiresNumber: true,
    requiresUpload: true,
  },
  msme: {
    numberLabel: "MSME number",
    uploadLabel: "MSME document upload",
    requiresNumber: false,
    requiresUpload: false,
  },
  fssai: {
    numberLabel: "FSSAI number",
    uploadLabel: "FSSAI document upload",
    requiresNumber: false,
    requiresUpload: false,
  },
  drug_license: {
    numberLabel: "Drug License number",
    uploadLabel: "Drug License document upload",
    requiresNumber: false,
    requiresUpload: false,
  },
  brandAuthorisation: {
    numberLabel: "Brand authorisation number",
    uploadLabel: "Brand authorisation document upload",
    requiresNumber: false,
    requiresUpload: true,
  },
} as const;

// Helper function to validate file uploads
const validateFileUpload = (
  file: File,
  ctx: z.RefinementCtx,
  path: string[],
) => {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    ctx.addIssue({
      path,
      code: z.ZodIssueCode.custom,
      message: "Only .pdf files are accepted.",
    });
  }
  if (file.size > MAX_FILE_SIZE) {
    ctx.addIssue({
      path,
      code: z.ZodIssueCode.custom,
      message: `Max file size is ${MAX_FILE_SIZE}MB.`,
    });
  }
};

// Helper function to validate document requirements
const validateDocumentRequirements = (
  doc: z.infer<ReturnType<typeof createCompanySchema>>["documents"][number] & {
    number?: string;
    url?: string;
    url_files?: File[];
  },
  ctx: z.RefinementCtx,
  businessType?: string,
  isCreatingNewCompany?: boolean,
  basePath: string[] = [],
) => {
  const config = DOCUMENT_CONFIG[doc.type as keyof typeof DOCUMENT_CONFIG];
  if (!config) return;

  // Skip CIN validation for proprietor business type
  if (doc.type === "coi" && businessType === "proprietor") {
    return;
  }

  // Skip COI validation when not creating new company
  if (doc.type === "coi" && !isCreatingNewCompany) {
    return;
  }

  // Skip PAN validation when not creating new company
  if (doc.type === "pan" && !isCreatingNewCompany) {
    return;
  }

  // Validate number requirement
  if (config.requiresNumber && !doc.number?.trim()) {
    ctx.addIssue({
      path: [...basePath, "number"],
      code: z.ZodIssueCode.custom,
      message: `${config.numberLabel} is required`,
    });
  }

  // Validate file upload requirements
  if (config.requiresUpload) {
    if (!doc.url?.trim()) {
      ctx.addIssue({
        path: [...basePath, "url"],
        code: z.ZodIssueCode.custom,
        message: `${config.uploadLabel} is required`,
      });
    }

    // Validate file type and size if files are uploaded
    if (doc?.url_files && doc?.url_files.length) {
      const file = doc.url_files[0];
      validateFileUpload(file, ctx, [...basePath, "url"]);
    }
  }
};

const createDocumentSchema = () =>
  z.object({
    type: z.enum([
      "coi",
      "pan",
      "gstLicense",
      "msme",
      "fssai",
      "drug_license",
      "brandAuthorisation",
    ]),
    number: z.string().optional(),
    url: z.string().optional(),
    url_files: z.any().optional(),
    verified: z.boolean(),
  });

import { cn } from "@/core/utils";
import {
  VALIDATION_CONSTANTS,
  createEmailValidator,
  createOptionalString,
  createPasswordValidator,
  createPhoneValidator,
  createPostalCodeValidator,
  createRequiredNumber,
  createRequiredString,
  createUrlValidator,
} from "@/core/utils/validation.utils";

// Address schema
const addressSchema = z.object({
  addressId: z.string().optional(),
  addressType: z.enum(["registered", "office"]),
  address: createRequiredString("Address"),
  landmark: createRequiredString("Landmark"),
  landlineNumber: createRequiredString("Landline number"),
  country: createRequiredString("Country"),
  state: createRequiredString("State"),
  city: createRequiredString("City"),
  postalCode: createPostalCodeValidator("Postal code"),
});

// Selling platform schema
const sellingPlatformSchema = z
  .object({
    platform: z.string().optional(),
    url: z.string().optional(),
  })
  .optional()
  .superRefine((platform, ctx) => {
    // If object is provided, validate it
    if (platform !== undefined && platform !== null) {
      const platformValue = platform.platform?.trim() || "";
      const urlValue = platform.url?.trim() || "";

      // If object is provided but platform is empty, throw error
      if (!platformValue) {
        // If URL is provided but platform is empty, throw error
        if (urlValue) {
          ctx.addIssue({
            path: ["platform"],
            code: z.ZodIssueCode.custom,
            message: "Platform is required when URL is provided",
          });
        } else {
          // If object is provided but both platform and URL are empty, throw error
          ctx.addIssue({
            path: ["platform"],
            code: z.ZodIssueCode.custom,
            message: "Platform is required",
          });
        }
        return;
      }

      // URL is required only when platform is "other"
      if (platformValue.toLowerCase() === "other") {
        if (!urlValue) {
          ctx.addIssue({
            path: ["url"],
            code: z.ZodIssueCode.custom,
            message: "URL is required when platform is 'Other'",
          });
          return;
        }
      }

      // Validate URL format only if URL is provided
      if (urlValue) {
        if (!VALIDATION_CONSTANTS.URL.REGEX.test(platform.url!)) {
          ctx.addIssue({
            path: ["url"],
            code: z.ZodIssueCode.custom,
            message:
              "Please enter a valid URL (e.g., https://amazon.in, https://flipkart.com)",
          });
        }
      }
    }
  });

/**
 * Creates a conditional schema based on the mode
 * For MODE.EDIT: removes validation refinements (allows empty/invalid data)
 * For other modes (ADD, VIEW): applies full validation with all required checks
 *
 * @param mode - The mode string (MODE.ADD, MODE.EDIT, MODE.VIEW)
 * @param companyOptions - Optional array of existing company names for uniqueness validation
 * @param validateVerificationOnChange - If true, validates phone/email verification on every validation. If false (default), only validates on submit.
 * @returns Zod schema with conditional validation rules
 *
 * @example
 * // For adding new company - strict validation
 * const addSchema = createCompanySchema(MODE.ADD);
 *
 * // For editing existing company - relaxed validation
 * const editSchema = createCompanySchema(MODE.EDIT);
 *
 * // Validation differences:
 * // ADD mode: name, email, phoneNumber, etc. are required
 * // EDIT mode: all fields are optional strings/booleans
 */
export function createCompanySchema(
  mode?: string,
  companyOptions?: Array<{ companyName: string }>,
  validateVerificationOnChange: boolean = false,
) {
  const isEditMode = mode === MODE.EDIT;

  // Base schema structure
  const baseSchema = z
    .object({
      // Basic company information
      mode: z.string(),
      _id: z.string().optional(),
      name: createRequiredString("Name"),
      email: createEmailValidator("Email"),
      phoneNumber: createPhoneValidator("Phone number"),
      designation: createRequiredString("Designation"),
      phoneVerified: z.boolean().refine((val) => val, {
        message: "Phone number is not verified",
      }),
      emailVerified: z.boolean().refine((val) => val, {
        message: "Email is not verified",
      }),
      password: isEditMode ? z.string().optional() : createPasswordValidator(),

      // Company assets
      logo: z.any().optional().or(z.literal("")),
      logo_files: z.any().optional(),

      // Company details
      companyName: createRequiredString("Company name"),
      isCreatingNewCompany: z.boolean(),
      category: createRequiredString("Category"),
      businessType: createRequiredString("Business type"),
      establishedIn: z.union([
        createRequiredString("Established year"),
        z.date().refine(
          (date) => {
            const today = new Date();
            today.setHours(23, 59, 59, 999); // Set to end of today to allow today's date
            return date <= today;
          },
          {
            message:
              "Established date cannot be in the future. Please select today or a past date.",
          },
        ),
      ]),
      website: createUrlValidator("website"),
      isSubsidiary: z.string(),
      headquarterLocation: createOptionalString(),
      description: createOptionalString(),

      // Brand details
      brandName: createRequiredString("Brand name"),
      totalSkus: createOptionalString(),
      brandType: z
        .array(z.string())
        .min(1, "At least one category is required")
        .optional(),
      averageSellingPrice: createRequiredString("Average selling price"),
      sellingOn: z.array(sellingPlatformSchema).optional(),

      // Social media URLs
      instagramUrl: createUrlValidator("Instagram"),
      facebookUrl: createUrlValidator("Facebook"),
      youtubeUrl: createUrlValidator("YouTube"),
      websiteUrl: createUrlValidator("Website"),

      marketingBudget: createRequiredNumber("Marketing budget"),
      brand_logo: z.any().optional().or(z.literal("")),
      brand_logo_files: z.any().optional(),

      // Addresses
      address: z
        .array(addressSchema)
        .min(1, "You must provide your registered address")
        .superRefine((arr, ctx) => {
          if (!isEditMode) {
            const hasRegistered = arr.some(
              (a) => a.addressType === "registered",
            );
            if (!hasRegistered) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "At least one address must be 'registered'",
              });
            }
          }
        }),

      // Documents and terms
      documents: z.array(createDocumentSchema()),
      agreeTermsConditions: z.boolean().refine((val) => val === true, {
        message: "You must agree to the Terms & Conditions",
      }),

      brands: z.array(z.string()).optional(),

      disabledCompanyName: z.boolean(),
      disabledCompanyDetails: z.boolean(),
      disabledPersonalDetails: z.boolean(),
      disabledAddressDetails: z.boolean(),
      isPrimary: z.boolean(),
    })
    .superRefine((data, ctx) => {
      // Logo file validation
      const logoFiles = data?.logo_files;
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

      // Subsidiary validation
      const isSubsidiary = JSON.parse(data?.isSubsidiary) ?? false;
      const headquarterLocation = data?.headquarterLocation;

      if (isSubsidiary && !String(headquarterLocation).trim()) {
        ctx.addIssue({
          path: ["headquarterLocation"],
          code: z.ZodIssueCode.custom,
          message: "Headquarter location is required for subsidiaries.",
        });
      }

      // Phone and email verification validation
      // Only validate verification when explicitly requested (on submit)
      // This prevents showing verification errors on blur/change events
      if (validateVerificationOnChange) {
        const phoneVerified = data?.phoneVerified;
        if (!phoneVerified && data?.phoneNumber) {
          ctx.addIssue({
            path: ["phoneNumber"],
            code: z.ZodIssueCode.custom,
            message: "Phone number is not verified",
          });
        }
        const emailVerified = data?.emailVerified;
        if (!emailVerified && data?.email) {
          ctx.addIssue({
            path: ["email"],
            code: z.ZodIssueCode.custom,
            message: "Email is not verified",
          });
        }
      }

      const brands = data?.brands;
      const brandName = data?.brandName?.toLowerCase();
      if (
        brands &&
        brands.length &&
        brands?.includes(brandName?.toLowerCase())
      ) {
        ctx.addIssue({
          path: ["brandName"],
          code: z.ZodIssueCode.custom,
          message: "Brand name already exists",
        });
      }

      // Company name uniqueness validation (only in ADD mode and when creating new company)
      if (!isEditMode && companyOptions && data?.isCreatingNewCompany) {
        const companyName = data?.companyName?.toLowerCase();
        if (companyName) {
          const companyExists = companyOptions.some(
            (company) => company.companyName.toLowerCase() === companyName,
          );
          if (companyExists) {
            ctx.addIssue({
              path: ["companyName"],
              code: z.ZodIssueCode.custom,
              message: "Company already exists",
            });
          }
        }
      }

      // Document validation with business type context
      if (data?.documents) {
        data.documents.forEach((doc, index) => {
          validateDocumentRequirements(
            doc,
            ctx,
            data?.businessType,
            data?.isCreatingNewCompany,
            [`documents.${index}`],
          );
        });
      }
    });
  return baseSchema;
}

export type FullCompanyFormType = z.infer<
  ReturnType<typeof createCompanySchema>
>;

// Default values function has been merged into transformApiResponseToFormData
// in /src/modules/panel/features/company/utils/onboarding.utils.ts

type ModeProps = { mode: MODE };
type FieldProps = {
  uploadImage: ModeProps & {
    disabled: boolean;
  };
  uploadbrandImage: ModeProps;
  [StepKey.PERSONAL_INFORMATION]: ModeProps & {
    disabled?: boolean;
  };
  [StepKey.COMPANY_DETAILS]: ModeProps & {
    disabled?: boolean;
  };
  [StepKey.ADDRESS_DETAILS]: ModeProps & {
    index: number;
    disabled: boolean;
    disabledAddressType: boolean;
    isCountrySelected?: boolean;
    dynamicOptions?: {
      countries?: Array<{ label: string; value: string }>;
      states?: Array<{ label: string; value: string }>;
    };
  };
  [StepKey.BRAND_DETAILS]: ModeProps & {
    brandTypeOptions?: Array<{ label: string; value: string }>;
  };
  [StepKey.DOCUMENTS_DETAILS]: ModeProps & {
    key?: string;
    index: number;
    numberLabel?: string;
    numberPlaceholder?: string;
    uploadLabel?: string;
    uploadPlaceholder?: string;
    showNumber?: boolean;
    required?: boolean;
  };
  selling_platforms: ModeProps & {
    index: number;
    availableOptions?: Array<{ label: string; value: string }>;
  };
  terms: ModeProps;
  company_name: ModeProps;
};

export type FullCompanyDetailsSchemaProps = {
  [K in keyof FieldProps]: (
    props: FieldProps[K],
  ) => FormFieldConfig<FullCompanyFormType>[];
};

export const fullCompanyDetailsSchema: FullCompanyDetailsSchemaProps = {
  personal_information: ({ mode, disabled = false }) => [
    {
      name: "name",
      label: "Full Name",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter full name",
      disabled: disabled || mode === MODE.VIEW,
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter email address",
      disabled: disabled || mode === MODE.VIEW,
      required: true,
    },
    {
      name: "designation",
      label: "Designation",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter designation",
      disabled: mode === MODE.VIEW,
      required: true,
    },
  ],
  uploadImage: ({ mode, disabled }) => [
    {
      name: "logo",
      label: "Company Logo",
      type: "file",
      className: "block space-y-2",
      disabled: disabled || mode === MODE.VIEW,
      // placeholder: "Upload company logo",
      inputProps: {
        accept: ACCEPTED_IMAGE_TYPES.join(", "),
      },
    },
  ],
  company_name: () => [
    {
      name: "companyName",
      label: <span>Company Name </span>,
      note: "Enter the company name exactly as it appears on the PAN card",
      type: INPUT_TYPES.CUSTOM,
      required: true,
      render() {
        return <div>Company</div>;
      },
    },
  ],
  company_information: ({ mode, disabled }) => [
    // {
    //   name: "companyName",
    //   label: "Company Name",
    //   type: INPUT_TYPES.CUSTOM,
    //   // options: companyOptions,
    //   placeholder: "Select company name",
    //   disabled: mode === MODE.VIEW,

    //   render() {
    //     return <div>Hello</div>;
    //   },
    // },
    {
      name: "category",
      label: "Category",
      type: INPUT_TYPES.SELECT,
      options: COMPANY.CATEGORY_OPTIONS,
      placeholder: "Select category",
      disabled: disabled || mode === MODE.VIEW,
      required: true,
    },
    {
      name: "businessType",
      label: "Business Type",
      type: INPUT_TYPES.SELECT,
      options: COMPANY.TYPE_OPTIONS,
      placeholder: "Select business type",
      disabled: disabled || mode === MODE.VIEW,
      required: true,
    },
    {
      name: "establishedIn",
      label: "Established In",
      note: "Enter the year of establishment as per PAN card",
      type: INPUT_TYPES.DATEPICKER,
      placeholder: "Enter year of establishment",
      disabled: disabled || mode === MODE.VIEW,
      required: true,
      mode: "single",
      inputProps: {
        mode: "single" as const,
        calendarProps: {
          disabled: (date: Date) => {
            const today = new Date();
            today.setHours(23, 59, 59, 999); // Set to end of today to allow today's date
            return date > today;
          },
        },
      } as unknown as DatePickerProps<"single">,
      // render({ field }) {
      //   return (
      //     <Input
      //       className="block w-full"
      //       type="month"
      //       disabled={disabled || mode === MODE.VIEW}
      //       {...field}
      //     />
      //   );
      // },
    },

    {
      name: "website",
      label: "Website",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter website URL",
      disabled: disabled || mode === MODE.VIEW,
      // inputProps: {
      //   startIcon: <p>https://</p>,
      //   className: "pl-17",
      // },
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
      disabled: disabled || mode === MODE.VIEW,
      required: true,
    },
    {
      name: "headquarterLocation",
      label: "Headquarters Location",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter HQ location",
      disabled: disabled || mode === MODE.VIEW,
      required: true,
    },
    {
      name: "description",
      label: "Company Information",
      type: INPUT_TYPES.TEXTAREA,
      placeholder: "Brief description about the company",
      disabled: disabled || mode === MODE.VIEW,
      className: "sm:col-span-2",
    },
  ],

  documents_information: ({
    key,
    mode,
    index,
    numberLabel = "Number",
    numberPlaceholder = "Enter Number",
    uploadLabel = "Upload Document",
    uploadPlaceholder = "Upload Document",
    showNumber = true,
    required = false,
  }) => {
    const prefix = `documents.${index}`; // dynamic prefix

    const makeName = (field: keyof CompanyDocument) =>
      `${prefix}.${field}` as keyof FullCompanyFormType;

    const fields = [];

    if (showNumber) {
      fields.push({
        name: makeName("number"),
        label: numberLabel,
        type: INPUT_TYPES.TEXT,
        placeholder: numberPlaceholder,
        disabled: mode === MODE.VIEW,
        key: key,
        required: required,
      });
    }

    fields.push({
      className: cn("block space-y-2", showNumber ? "" : "sm:col-span-2"),
      name: makeName("url"),
      label: uploadLabel,
      type: INPUT_TYPES.FILE,
      placeholder: uploadPlaceholder,
      disabled: mode === MODE.VIEW,
      inputProps: { accept: ACCEPTED_FILE_TYPES.join(", ") },
      key: key,
      required: required,
    });

    return fields;
  },

  address_information: ({
    mode,
    index = 0,
    disabled = false,
    disabledAddressType = false,
    isCountrySelected = false,
    dynamicOptions,
  }) => {
    const prefix = `address.${index}`; // dynamic prefix

    const makeName = (field: keyof CompanyAddress) =>
      `${prefix}.${field}` as keyof FullCompanyFormType;

    return [
      {
        name: makeName("addressType"),
        label: "Address Type",
        type: INPUT_TYPES.SELECT,
        options: [
          { label: "Registered Office", value: "registered" },
          { label: "Branch Office", value: "office" },
        ],
        placeholder: "Enter address",
        disabled: disabled || disabledAddressType || mode === MODE.VIEW,
        className: "sm:col-span-3",
        required: true,
      },
      {
        name: makeName("address"),
        label: "Address",
        type: INPUT_TYPES.TEXTAREA,
        placeholder: "Enter address",
        disabled: disabled || mode === MODE.VIEW,
        className: "sm:col-span-3",
        required: true,
      },
      {
        name: makeName("landmark"),
        label: "Landmark",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter landmark",
        disabled: disabled || mode === MODE.VIEW,
        required: true,
      },
      {
        name: makeName("landlineNumber"),
        label: "Fixed landline number",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter fixed landline number",
        disabled: disabled || mode === MODE.VIEW,
        required: true,
        inputProps: {
          keyfilter: "int",
          maxLength: 10,
          startIcon: <p>+91</p>,
        },
      },
      {
        name: makeName("country"),
        label: "Country",
        type: INPUT_TYPES.COMBOBOX,
        options: dynamicOptions?.countries || [
          { label: "India", value: "IN" },
          { label: "USA", value: "US" },
        ],
        placeholder: "Select country",
        disabled: disabled || mode === MODE.VIEW,
        required: true,
      },
      {
        name: makeName("state"),
        label: "State",
        type: INPUT_TYPES.COMBOBOX,
        options: dynamicOptions?.states || [
          { label: "Delhi", value: "DL" },
          { label: "California", value: "CA" },
        ],
        placeholder: "Select state",
        disabled: disabled || !isCountrySelected || mode === MODE.VIEW,
        required: true,
      },
      {
        name: makeName("city"),
        label: "City",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter city",
        disabled: disabled || !isCountrySelected || mode === MODE.VIEW,
        required: true,
      },
      {
        name: makeName("postalCode"),
        label: "Postal Code",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter postal code",
        disabled: disabled || !isCountrySelected || mode === MODE.VIEW,
        required: true,
        inputProps: {
          keyfilter: "int",
          maxLength: 6,
        },
      },
    ];
  },

  uploadbrandImage: ({ mode }) => [
    {
      name: "brand_logo",
      label: "Brand Logo",
      type: "file",
      disabled: MODE.VIEW === mode,
      placeholder: "Upload brand logo",
      inputProps: {
        accept: ACCEPTED_IMAGE_TYPES.join(", "),
      },
    },
  ],

  brand_information: ({ mode, brandTypeOptions = [] }) => [
    {
      name: "brandName",
      label: "Brand Name",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter brand name",
      disabled: mode === MODE.VIEW,
      className: "lg:col-span-3",
      required: true,
    },
    {
      name: "brandType",
      label: "Brand category",
      type: INPUT_TYPES.COMBOBOX,
      options: brandTypeOptions,
      placeholder: "Select brand category",
      disabled: mode === MODE.VIEW,
      className: "hide-scrollbars lg:col-span-3",
      multi: true,
      required: true,
    },
    {
      name: "websiteUrl",
      label: "Website URL",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://example.com",
      disabled: mode === MODE.VIEW,
      className: "lg:col-span-3",
    },
    // {
    //   name: "totalSkus",
    //   label: "Total No of SKUs",
    //   type: INPUT_TYPES.NUMBER,
    //   placeholder: "Enter number of SKUs",
    //   disabled: mode === MODE.VIEW,
    //   className: "lg:col-span-3",
    // },
    // {
    //   name: "totalSkus",
    //   label: "Total No of SKUs",
    //   type: INPUT_TYPES.NUMBER,
    //   placeholder: "Enter number of SKUs",
    //   disabled: mode === MODE.VIEW,
    //   className: "lg:col-span-3",
    // },
    // {
    //   name: "averageSellingPrice",
    //   label: "Average Selling Price (ASP)",
    //   type: INPUT_TYPES.NUMBER,
    //   placeholder: "Enter average selling price",
    //   disabled: mode === MODE.VIEW,
    //   className: "lg:col-span-3",
    // },
    {
      name: "marketingBudget",
      label: "Marketing Budget",
      type: INPUT_TYPES.NUMBER,
      placeholder: "Enter marketing budget",
      disabled: mode === MODE.VIEW,
      className: "lg:col-span-3",
      required: true,
    },
    // {
    //   name: "sellingPlatforms",
    //   label: "Selling On",
    //   type: INPUT_TYPES.CUSTOM,
    //   placeholder: "Add platforms",
    //   disabled: mode === MODE.VIEW,
    //   render: "platformSelector",
    // },
    {
      name: "instagramUrl",
      label: "Instagram URL",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://instagram.com/yourbrand",
      disabled: mode === MODE.VIEW,
      className: "lg:col-span-3",
    },
    {
      name: "facebookUrl",
      label: "Facebook URL",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://facebook.com/yourbrand",
      disabled: mode === MODE.VIEW,
      className: "lg:col-span-3",
    },
    {
      name: "youtubeUrl",
      label: "YouTube URL",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://youtube.com/yourchannel",
      disabled: mode === MODE.VIEW,
      className: "lg:col-span-3",
    },
  ],

  selling_platforms: ({ mode, index = 0, availableOptions = [] }) => {
    const prefix = `sellingOn.${index}`; // dynamic prefix

    const makeName = (field: string) =>
      `${prefix}.${field}` as keyof FullCompanyFormType;

    return [
      {
        name: makeName("platform"),
        label: "Platform",
        type: INPUT_TYPES.SELECT,
        options:
          availableOptions.length > 0
            ? availableOptions
            : [
                { label: "Amazon", value: "amazon" },
                { label: "Flipkart", value: "flipkart" },
                { label: "Myntra", value: "myntra" },
                { label: "Nykaa", value: "nykaa" },
                { label: "Purplle", value: "purplle" },
                { label: "Other", value: "other" },
              ],
        placeholder: "Select platform",
        disabled: mode === MODE.VIEW,
        className: "lg:col-span-2",
        required: true,
      },
      {
        name: makeName("url"),
        label: "Platform URL",
        type: INPUT_TYPES.TEXT,
        placeholder: "e.g., https://amazon.in, https://flipkart.com",
        disabled: mode === MODE.VIEW,
        className: "lg:col-span-4",
      },
    ];
  },
  terms: ({ mode }) => [
    {
      name: "agreeTermsConditions",
      label: (
        <span>
          I agree to the&nbsp;{" "}
          <Link to="https://ecom.skintruth.in/tnc-brands">
            Terms & Conditions
          </Link>
        </span>
      ),
      type: INPUT_TYPES.CHECKBOX,
      disabled: mode === MODE.VIEW,
      className: "md:col-span-2",
    },
  ],
};
