import {
  INPUT_TYPES,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { Input } from "@/core/components/ui/input";
import { MAX_FILE_SIZE } from "@/core/config/constants";
import { MODE } from "@/core/types";
import { COMPANY } from "@/modules/panel/config/constant.config";
import type { CompanyAddress } from "@/modules/panel/types/company.type";
import { z } from "zod";
import {
  createOptionalString,
  createPostalCodeValidator,
  createRequiredString,
  createUrlValidator,
} from "@/core/utils/validation.utils";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

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

// Company edit schema - only company and address fields
export const companyEditZodSchema = z
  .object({
    // Basic company information
    _id: z.string().optional(),
    companyName: createRequiredString("Company name"),
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

    // Company assets
    logo: z.any().optional().or(z.literal("")),
    logo_files: z.any().optional(),

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
  });

export type CompanyEditFormType = z.infer<typeof companyEditZodSchema>;

type ModeProps = { mode: MODE };
type FieldProps = {
  uploadImage: ModeProps & {
    hasCompany: boolean;
  };
  company_information: ModeProps & {
    hasCompany: boolean;
  };
  address_information: ModeProps & {
    hasCompany?: boolean;
    index?: number;
    disabled?: boolean;
    disabledAddressType?: boolean;
  };
};

export type CompanyEditDetailsSchemaProps = {
  [K in keyof FieldProps]: (
    props: FieldProps[K],
  ) => FormFieldConfig<CompanyEditFormType>[];
};

export const companyEditDetailsSchema: CompanyEditDetailsSchemaProps = {
  uploadImage: ({ mode, hasCompany }) => [
    {
      name: "logo",
      label: "Company Logo",
      type: "file",
      disabled: hasCompany || mode === MODE.VIEW,
      inputProps: {
        accept: ACCEPTED_IMAGE_TYPES.join(", "),
      },
    },
  ],

  company_information: ({ mode, hasCompany }) => [
    {
      name: "companyName",
      label: "Company Name",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter company name",
      disabled: mode === MODE.VIEW,
      className: "col-span-2",
    },
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
        const today = new Date();
        const maxDate = today.toISOString().slice(0, 7); // Format as YYYY-MM for month input

        return (
          <Input
            className="block w-full"
            type="month"
            max={maxDate}
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
      className: "",
    },
    {
      name: "description",
      label: "Company Information (optional)",
      type: INPUT_TYPES.TEXTAREA,
      placeholder: "Brief description about the company",
      disabled: hasCompany || mode === MODE.VIEW,
      className: "sm:col-span-3",
    },
  ],

  address_information: ({
    mode,
    index = 0,
    disabled = false,
    disabledAddressType = false,
  }) => {
    const prefix = `address.${index}`;

    const makeName = (field: keyof CompanyAddress) =>
      `${prefix}.${field}` as keyof CompanyEditFormType;

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
        label: "Fixed landline number",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter fixed landline number",
        disabled: disabled || mode === MODE.VIEW,
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
        disabled: disabled || mode === MODE.VIEW,
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
        disabled: disabled || mode === MODE.VIEW,
      },
      {
        name: makeName("city"),
        label: "City",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter city",
        disabled: disabled || mode === MODE.VIEW,
      },
      {
        name: makeName("postalCode"),
        label: "Postal Code",
        type: INPUT_TYPES.TEXT,
        placeholder: "Enter postal code",
        disabled: disabled || mode === MODE.VIEW,
        inputProps: {
          keyfilter: "int",
          maxLength: 6,
        },
      },
    ];
  },
};
