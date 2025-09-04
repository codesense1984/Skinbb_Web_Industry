import {
  INPUT_TYPES,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { Input } from "@/core/components/ui/input";
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
const DocumentSchema = z
  .object({
    type: z.enum(["coi", "pan", "gstLicense", "msme", "brandAuthorisation"]),
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
    if (doc.type === "gstLicense") {
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
    if (doc.type === "brandAuthorisation") {
      if (!doc.url?.trim()) {
        ctx.addIssue({
          path: ["url"],
          code: z.ZodIssueCode.custom,
          message: "Brand authorisation document upload is required",
        });
      }
    }
  });

import {
  VALIDATION_CONSTANTS,
  createEmailValidator,
  createOptionalString,
  createPasswordValidator,
  createPhoneValidator,
  createPostalCodeValidator,
  createRequiredString,
  createUrlValidator,
} from "@/core/utils/validation.utils";

// Address schema
const addressSchema = z.object({
  addressId: z.string().optional(),
  addressType: z.enum(["registered", "office"]),
  address: createRequiredString("Address"),
  landmark: createRequiredString("Landmark"),
  phoneNumber: createRequiredString("Phone number"),
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
    if (platform?.platform && platform.platform.trim() !== "") {
      if (!platform.url || platform.url.trim() === "") {
        ctx.addIssue({
          path: ["url"],
          code: z.ZodIssueCode.custom,
          message: "URL is required when platform is selected",
        });
        return;
      }

      if (!VALIDATION_CONSTANTS.URL.REGEX.test(platform.url)) {
        ctx.addIssue({
          path: ["url"],
          code: z.ZodIssueCode.custom,
          message:
            "Please enter a valid URL (e.g., https://amazon.in, https://flipkart.com)",
        });
      }
    }
  });

// Main company schema
export const fullCompanyZodSchema = z
  .object({
    // Basic company information
    _id: z.string().optional(),
    name: createRequiredString("Name"),
    email: createEmailValidator("Email"),
    phoneNumber: createPhoneValidator("Phone number"),
    designation: createRequiredString("Designation"),
    phoneVerified: z.boolean().refine((val) => val, {
      message: "Phone number is not verified",
    }),
    password: createPasswordValidator(),

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
      z.date(),
    ]),
    website: createUrlValidator("website"),
    isSubsidiary: z.string(),
    headquarterLocation: createOptionalString(),
    description: createOptionalString(),

    // Brand details
    brandName: createRequiredString("Brand name"),
    totalSkus: createRequiredString("Total number of SKUs"),
    productCategory: z.array(z.string().optional()).optional(),
    averageSellingPrice: createRequiredString("Average selling price"),
    sellingOn: z.array(sellingPlatformSchema).optional(),

    // Social media URLs
    instagramUrl: createUrlValidator("Instagram"),
    facebookUrl: createUrlValidator("Facebook"),
    youtubeUrl: createUrlValidator("YouTube"),

    marketingBudget: createRequiredString("Marketing budget"),
    brand_logo: z.any().optional().or(z.literal("")),
    brand_logo_files: z.any().optional(),

    // Addresses
    address: z
      .array(addressSchema)
      .min(1, "You must provide your registered address")
      .superRefine((arr, ctx) => {
        const hasRegistered = arr.some((a) => a.addressType === "registered");
        if (!hasRegistered) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "At least one address must be 'registered'",
          });
        }
      }),

    // Documents and terms
    documents: z.array(DocumentSchema),
    agreeTermsConditions: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms & Conditions",
    }),

    brands: z.array(z.string()).optional(),
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

    // Phone verification validation
    const phoneVerified = data?.phoneVerified;
    if (!phoneVerified && data?.phoneNumber) {
      ctx.addIssue({
        path: ["phoneNumber"],
        code: z.ZodIssueCode.custom,
        message: "Phone number is not verified",
      });
    }

    const brands = data?.brands;
    const brandName = data?.brandName?.toLowerCase();
    if (brands && brands.length && brands?.includes(brandName?.toLowerCase())) {
      ctx.addIssue({
        path: ["brandName"],
        code: z.ZodIssueCode.custom,
        message: "Brand name already exists",
      });
    }
  });

export type FullCompanyFormType = z.infer<typeof fullCompanyZodSchema>;

// Default values function has been merged into transformApiResponseToFormData
// in /src/modules/panel/features/company/utils/onboarding.utils.ts

type ModeProps = { mode: MODE };
type FieldProps = {
  uploadImage: ModeProps & {
    hasCompany: boolean;
  };
  uploadbrandImage: ModeProps;
  [StepKey.PERSONAL_INFORMATION]: ModeProps;
  [StepKey.COMPANY_DETAILS]: ModeProps & {
    hasCompany?: boolean;
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
    productCategoryOptions?: Array<{ label: string; value: string }>;
  };
  [StepKey.DOCUMENTS_DETAILS]: ModeProps & {
    index: number;
    numberLabel?: string;
    numberPlaceholder?: string;
    uploadLabel?: string;
    uploadPlaceholder?: string;
    showNumber?: boolean;
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
  uploadImage: ({ mode, hasCompany }) => [
    {
      name: "logo",
      label: "Company Logo",
      type: "file",
      disabled: hasCompany || mode === MODE.VIEW,
      // placeholder: "Upload company logo",
      inputProps: {
        accept: ACCEPTED_IMAGE_TYPES.join(", "),
      },
    },
  ],
  company_name: () => [
    {
      name: "companyName",
      label: "Company Name",
      type: INPUT_TYPES.CUSTOM,
      render() {
        return <div>Company</div>;
      },
    },
  ],
  company_information: ({ mode, hasCompany }) => [
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
      disabled: hasCompany || mode === MODE.VIEW,
    },
    {
      name: "businessType",
      label: "Business Type",
      type: INPUT_TYPES.SELECT,
      options: COMPANY.TYPE_OPTIONS,
      placeholder: "Select business type",
      disabled: hasCompany || mode === MODE.VIEW,
    },
    {
      name: "establishedIn",
      label: "Established In",
      type: INPUT_TYPES.CUSTOM,
      placeholder: "Enter year of establishment",
      disabled: hasCompany || mode === MODE.VIEW,
      render({ field }) {
        return (
          <Input
            className="block w-full"
            type="month"
            disabled={hasCompany || mode === MODE.VIEW}
            {...field}
          />
        );
      },
    },

    {
      name: "website",
      label: "Website (optional)",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter website URL",
      disabled: hasCompany || mode === MODE.VIEW,
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
      disabled: hasCompany || mode === MODE.VIEW,
    },
    {
      name: "headquarterLocation",
      label: "Headquarters Location",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter HQ location",
      disabled: hasCompany || mode === MODE.VIEW,
    },
    {
      name: "description",
      label: "Company Description (optional)",
      type: INPUT_TYPES.TEXTAREA,
      placeholder: "Brief description about the company",
      disabled: hasCompany || mode === MODE.VIEW,
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
    showNumber = true,
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
      });
    }

    fields.push({
      className: showNumber ? "" : "sm:col-span-2",
      name: makeName("url"),
      label: uploadLabel,
      type: INPUT_TYPES.FILE,
      placeholder: uploadPlaceholder,
      disabled: mode === MODE.VIEW,
      inputProps: { accept: ACCEPTED_FILE_TYPES.join(", ") },
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
          { label: "Registered", value: "registered" },
          { label: "Office", value: "office" },
        ],
        placeholder: "Enter address",
        disabled: disabled || disabledAddressType || mode === MODE.VIEW,
        className: "sm:col-span-3",
      },
      {
        name: makeName("address"),
        label: "Address",
        type: INPUT_TYPES.TEXTAREA,
        placeholder: "Enter address",
        disabled: disabled || mode === MODE.VIEW,
        className: "sm:col-span-3",
      },
      {
        name: makeName("landmark"),
        label: "Landmark",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter landmark",
        disabled: disabled || mode === MODE.VIEW,
      },
      {
        name: makeName("phoneNumber"),
        label: "Landline number",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter landline number",
        disabled: disabled || mode === MODE.VIEW,
        inputProps: {
          keyfilter: "int",
          maxLength: 10,
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
      },
      {
        name: makeName("city"),
        label: "City",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter city",
        disabled: disabled || !isCountrySelected || mode === MODE.VIEW,
      },
      {
        name: makeName("postalCode"),
        label: "Postal Code",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter postal code",
        disabled: disabled || !isCountrySelected || mode === MODE.VIEW,
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

  brand_information: ({ mode, productCategoryOptions = [] }) => [
    {
      name: "brandName",
      label: "Brand Name",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter brand name",
      disabled: mode === MODE.VIEW,
      className: "lg:col-span-3",
    },
    {
      name: "productCategory",
      label: "Product Category",
      type: INPUT_TYPES.COMBOBOX,
      options: productCategoryOptions,
      placeholder: "Select product category",
      disabled: mode === MODE.VIEW,
      className: "hide-scrollbars lg:col-span-3",
      multi: true,
    },
    {
      name: "totalSkus",
      label: "Total No of SKUs",
      type: INPUT_TYPES.NUMBER,
      placeholder: "Enter number of SKUs",
      disabled: mode === MODE.VIEW,
      className: "lg:col-span-3",
    },
    {
      name: "averageSellingPrice",
      label: "Average Selling Price (ASP)",
      type: INPUT_TYPES.NUMBER,
      placeholder: "Enter average selling price",
      disabled: mode === MODE.VIEW,
      className: "lg:col-span-3",
    },
    {
      name: "marketingBudget",
      label: "Marketing Budget",
      type: INPUT_TYPES.NUMBER,
      placeholder: "Enter marketing budget",
      disabled: mode === MODE.VIEW,
      className: "lg:col-span-3",
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
      label: "Instagram URL (Optional)",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://instagram.com/yourbrand",
      disabled: mode === MODE.VIEW,
      className: "lg:col-span-3",
    },
    {
      name: "facebookUrl",
      label: "Facebook URL (Optional)",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://facebook.com/yourbrand",
      disabled: mode === MODE.VIEW,
      className: "lg:col-span-3",
    },
    {
      name: "youtubeUrl",
      label: "YouTube URL (Optional)",
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
        <>
          I agree to the&nbsp;{" "}
          <Link to="https://ecom.skintruth.in/tnc-brands">
            Terms & Conditions
          </Link>
        </>
      ),
      type: INPUT_TYPES.CHECKBOX,
      disabled: mode === MODE.VIEW,
    },
  ],
};
