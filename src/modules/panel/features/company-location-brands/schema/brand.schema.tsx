import { z } from "zod";
import { INPUT_TYPES } from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import type { FormFieldConfig } from "@/core/components/ui/form-input";

// Brand form schema
export const brandFormSchema = z.object({
  name: z
    .string()
    .min(1, "Brand name is required")
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must be less than 100 characters"),
  aboutTheBrand: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  totalSKU: z.string().min(0).optional(),
  averageSellingPrice: z.string().min(0).optional(),
  marketingBudget: z.string().min(0).optional(),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  brandType: z.array(z.string()).optional(),
  sellingOn: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),
  authorizationLetter: z.string().optional(),
});

export type BrandFormData = z.infer<typeof brandFormSchema>;

// Platform options for selling platforms
const PLATFORM_OPTIONS = [
  { label: "Amazon", value: "amazon" },
  { label: "Flipkart", value: "flipkart" },
  { label: "Myntra", value: "myntra" },
  { label: "Nykaa", value: "nykaa" },
  { label: "Purplle", value: "purplle" },
  { label: "Other", value: "other" },
];

// Field configuration types
type ModeProps = { mode: MODE };
type FieldProps = {
  basic_information: ModeProps;
  business_metrics: ModeProps;
  social_media: ModeProps;
  selling_platforms: ModeProps & {
    index: number;
    availableOptions?: Array<{ label: string; value: string }>;
  };
};

export type BrandSchemaProps = {
  [K in keyof FieldProps]: (
    props: FieldProps[K],
  ) => FormFieldConfig<BrandFormData>[];
};

export const brandSchema: BrandSchemaProps = {
  basic_information: ({ mode }) => [
    {
      name: "name",
      label: "Brand Name",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter brand name",
      required: true,
      disabled: mode === MODE.VIEW,
    },
    {
      name: "websiteUrl",
      label: "Website URL",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://example.com",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "aboutTheBrand",
      label: "About the Brand",
      type: INPUT_TYPES.TEXTAREA,
      placeholder: "Describe the brand...",
      disabled: mode === MODE.VIEW,
      inputProps: {
        rows: 4,
      },
    },
    {
      name: "authorizationLetter",
      label: "Authorization Letter",
      type: INPUT_TYPES.FILE,
      placeholder: "Upload authorization letter",
      disabled: mode === MODE.VIEW,
      required: mode === MODE.ADD || mode === MODE.EDIT,
      inputProps: {
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
      },
    },
  ],

  business_metrics: ({ mode }) => [
    {
      name: "totalSKU",
      label: "Total SKU",
      type: INPUT_TYPES.NUMBER,
      placeholder: "0",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "averageSellingPrice",
      label: "Average Selling Price",
      type: INPUT_TYPES.NUMBER,
      placeholder: "0.00",
      disabled: mode === MODE.VIEW,
      inputProps: {
        step: 0.01,
      },
    },
    {
      name: "marketingBudget",
      label: "Marketing Budget",
      type: INPUT_TYPES.NUMBER,
      placeholder: "0.00",
      disabled: mode === MODE.VIEW,
      inputProps: {
        step: 0.01,
      },
    },
  ],

  social_media: ({ mode }) => [
    {
      name: "instagramUrl",
      label: "Instagram URL",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://instagram.com/username",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "facebookUrl",
      label: "Facebook URL",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://facebook.com/username",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "youtubeUrl",
      label: "YouTube URL",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://youtube.com/username",
      disabled: mode === MODE.VIEW,
    },
  ],

  selling_platforms: ({ mode, index, availableOptions = PLATFORM_OPTIONS }) => [
    {
      name: `sellingOn.${index}.platform` as keyof BrandFormData,
      label: "Platform",
      type: INPUT_TYPES.SELECT,
      options: availableOptions,
      placeholder: "Select platform",
      disabled: mode === MODE.VIEW,
    },
    {
      name: `sellingOn.${index}.url` as keyof BrandFormData,
      label: "URL",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://example.com",
      disabled: mode === MODE.VIEW,
    },
  ],

};
