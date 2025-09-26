import { z } from "zod";
import { INPUT_TYPES } from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import { createUrlValidator } from "@/core/utils";
import { SURVEY } from "@/core/config/constants";
import type { FormFieldConfig } from "@/core/components/ui/form-input";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export const brandFormSchema = z.object({
  _id: z.string().optional(),
  name: z
    .string()
    .min(1, "Brand name is required")
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must be less than 100 characters"),
  aboutTheBrand: z.string().optional(),
  websiteUrl: createUrlValidator("Website"),
  totalSKU: z.string().min(1),
  logo_files: z.any().optional(),
  logo: z.string().optional(),
  marketingBudget: z.string().min(1),
  instagramUrl: createUrlValidator("Instagram"),
  facebookUrl: createUrlValidator("Facebook"),
  youtubeUrl: createUrlValidator("YouTube"),
  brandType: z.array(z.string()).min(1),
  sellingOn: z
    .array(
      z.object({
        platform: z.string(),
        url: createUrlValidator("URL"),
      }),
    )
    .optional(),
  authorizationLetter: z.string().min(1),
  authorizationLetter_files: z.any().optional(),
});

export type BrandFormData = z.infer<typeof brandFormSchema>;

// Field configuration types
type ModeProps = { mode: MODE };
type SellingPlatformProps = ModeProps & {
  index: number;
  availableOptions?: Array<{ label: string; value: string }>;
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export const brandSchema: {
  uploadbrandImage: (props: ModeProps) => FormFieldConfig<BrandFormData>[];
  basic_information: (props: ModeProps) => FormFieldConfig<BrandFormData>[];
  selling_platforms: (
    props: SellingPlatformProps,
  ) => FormFieldConfig<BrandFormData>[];
} = {
  uploadbrandImage: ({ mode }: ModeProps) => [
    {
      name: "logo",
      label: "Logo",
      type: "file",
      disabled: MODE.VIEW === mode,
      placeholder: "Upload brand logo",
      inputProps: {
        accept: ACCEPTED_IMAGE_TYPES.join(", "),
      },
    },
  ],
  basic_information: ({ mode }: ModeProps) => [
    {
      name: "name",
      label: "Brand Name",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter brand name",
      required: true,
      disabled: mode === MODE.VIEW,
      className: "md:col-span-2",
    },
    {
      name: "brandType",
      label: "Brand Type",
      type: INPUT_TYPES.COMBOBOX,
      maxVisibleItems: 2,
      multi: true,
      placeholder: "Select product category",
      options: Object.values(SURVEY.BRAND_PRODUCT_CATEGORY_OPTIONS),
      disabled: mode === MODE.VIEW,
      className: "md:col-span-2",
      required: true,
    },

    // {
    //   name: "totalSKU",
    //   label: "Total SKU",
    //   type: INPUT_TYPES.NUMBER,
    //   placeholder: "Enter total SKU",
    //   disabled: mode === MODE.VIEW,
    //   className: "md:col-span-2 lg:col-span-1",
    //   required: true,
    // },
    {
      name: "marketingBudget",
      label: "Marketing Budget",
      type: INPUT_TYPES.NUMBER,
      placeholder: "Enter average selling price",
      disabled: mode === MODE.VIEW,
      className: "md:col-span-2 lg:col-span-1",
      required: true,
    },
    {
      name: "websiteUrl",
      label: "Website URL",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://example.com",
      disabled: mode === MODE.VIEW,
      className: "md:col-span-2 lg:col-span-1",
      required: true,
    },
    {
      name: "instagramUrl",
      label: "Instagram URL",
      type: INPUT_TYPES.URL,
      placeholder: "https://instagram.com/username",
      className: "md:col-span-2 lg:col-span-1",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "facebookUrl",
      label: "Facebook URL",
      type: INPUT_TYPES.URL,
      placeholder: "https://facebook.com/username",
      disabled: mode === MODE.VIEW,
      className: "md:col-span-2 lg:col-span-1",
    },
    {
      name: "youtubeUrl",
      label: "YouTube URL",
      type: INPUT_TYPES.URL,
      placeholder: "https://youtube.com/username",
      className: "md:col-span-2 lg:col-span-1",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "authorizationLetter",
      label: "Authorization Letter",
      type: INPUT_TYPES.FILE,
      placeholder: "Upload letter",
      disabled: mode === MODE.VIEW,
      required: mode === MODE.ADD,
      inputProps: {
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
      },
      className: "md:col-span-2",
    },
    {
      name: "aboutTheBrand",
      label: "About the Brand",
      type: INPUT_TYPES.TEXTAREA,
      placeholder: "Describe the brand...",
      disabled: mode === MODE.VIEW,
      className: "md:col-span-4",
    },
  ],

  selling_platforms: ({
    mode,
    index,
    availableOptions = [],
  }: SellingPlatformProps) => [
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
