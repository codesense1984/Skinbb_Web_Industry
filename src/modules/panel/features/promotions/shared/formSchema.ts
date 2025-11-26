import { z } from "zod";
import { INPUT_TYPES } from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import type { FormFieldConfig } from "@/core/components/ui/form-input";
import type {
  PromotionPlacement,
  PromotionType,
  LinkType,
} from "@/modules/panel/types/promotion.type";

// Input schema for form (accepts Date objects from date picker)
export const promotionFormInputSchema = z.object({
  image: z.union([z.instanceof(File), z.string()]).optional(),
  image_files: z.array(z.instanceof(File)).optional(), // File input component stores files here
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  subtitle: z.string().max(500, "Subtitle must be less than 500 characters").optional(),
  redirectUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  linkType: z.enum(["shelf", "blank"]).optional().default("shelf"),
  promotionType: z.enum(["banner", "curated-stores"]).optional().default("banner"),
  brandIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  placement: z.enum([
    "home-hero",
    "home-strip",
    "brand-page",
    "category-page",
    "product-page",
  ]),
  priority: z.preprocess(
    (val) => {
      if (val === undefined || val === null) return 100;
      if (typeof val === "string") {
        const num = Number(val);
        return isNaN(num) ? 100 : num;
      }
      return typeof val === "number" ? val : 100;
    },
    z.number().int("Priority must be an integer").min(0, "Priority must be 0 or greater").default(100)
  ),
  startAt: z.date({
    required_error: "Start date is required",
  }),
  endAt: z.date({
    required_error: "End date is required",
  }),
  isActive: z.boolean().optional().default(true),
  allowOverlap: z.boolean().optional().default(false),
});

// Output schema for API (transforms dates to dd/mm/yyyy format)
export const promotionFormSchema = promotionFormInputSchema
  .refine(
    (data) => {
      // Validate that end date is after start date
      if (data.startAt && data.endAt) {
        return data.endAt > data.startAt;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endAt"],
    },
  )
  .transform((data) => {
    // Transform dates to API format
    const formatDate = (date: Date, includeTime = false): string => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      if (includeTime) {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }

      return `${day}/${month}/${year}`;
    };

    return {
      ...data,
      startAt: formatDate(data.startAt, true),
      endAt: formatDate(data.endAt, true),
    };
  });

export type PromotionFormData = z.infer<typeof promotionFormInputSchema>;
export type PromotionFormOutput = z.infer<typeof promotionFormSchema>;

// Options
const PLACEMENT_OPTIONS = [
  { label: "Home Hero", value: "home-hero" },
  { label: "Home Strip", value: "home-strip" },
  { label: "Brand Page", value: "brand-page" },
  { label: "Category Page", value: "category-page" },
  { label: "Product Page", value: "product-page" },
];

const PROMOTION_TYPE_OPTIONS = [
  { label: "Banner", value: "banner" },
  { label: "Curated Stores", value: "curated-stores" },
];

const LINK_TYPE_OPTIONS = [
  { label: "Same Window (Shelf)", value: "shelf" },
  { label: "New Window (Blank)", value: "blank" },
];

// Field configuration types
type ModeProps = { mode: MODE };

// Field configurations
export const promotionSchema = {
  basic_information: ({
    mode,
  }: ModeProps): FormFieldConfig<PromotionFormData>[] => [
    {
      name: "title",
      label: "Title",
      type: INPUT_TYPES.TEXT,
      placeholder: "e.g., Summer Sale 2024",
      description: "Promotion title (required)",
      required: true,
      disabled: mode === MODE.VIEW,
    },
    {
      name: "subtitle",
      label: "Subtitle",
      type: INPUT_TYPES.TEXT,
      placeholder: "e.g., Get up to 50% off on selected items",
      description: "Optional subtitle for the promotion",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "image",
      label: "Promotion Image",
      type: INPUT_TYPES.FILE,
      placeholder: "Upload promotion image",
      description:
        "Upload an image (JPEG, PNG, or GIF) or provide existing Media ID",
      accept: "image/jpeg,image/png,image/gif",
      disabled: mode === MODE.VIEW,
    },
  ],

  promotion_details: ({
    mode,
  }: ModeProps): FormFieldConfig<PromotionFormData>[] => [
    {
      name: "promotionType",
      label: "Promotion Type",
      type: INPUT_TYPES.SELECT,
      options: PROMOTION_TYPE_OPTIONS,
      placeholder: "Select promotion type",
      description: "Type of promotion",
      required: false,
      disabled: mode === MODE.VIEW,
    },
    {
      name: "placement",
      label: "Placement",
      type: INPUT_TYPES.SELECT,
      options: PLACEMENT_OPTIONS,
      placeholder: "Select placement",
      description: "Where the promotion should be displayed",
      required: true,
      disabled: mode === MODE.VIEW,
    },
    {
      name: "priority",
      label: "Priority",
      type: INPUT_TYPES.NUMBER,
      placeholder: "e.g., 100",
      description:
        "Priority for display (lower number = higher priority). Default: 100",
      required: false,
      disabled: mode === MODE.VIEW,
    },
  ],

  link_settings: ({
    mode,
  }: ModeProps): FormFieldConfig<PromotionFormData>[] => [
    {
      name: "redirectUrl",
      label: "Redirect URL",
      type: INPUT_TYPES.TEXT,
      placeholder: "https://example.com/page",
      description:
        "URL to redirect when promotion is clicked (must be absolute URL)",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "linkType",
      label: "Link Type",
      type: INPUT_TYPES.SELECT,
      options: LINK_TYPE_OPTIONS,
      placeholder: "Select link type",
      description: "How the link should open",
      required: false,
      disabled: mode === MODE.VIEW,
    },
  ],

  targeting: ({
    mode,
    brandOptions = [],
    productOptions = [],
    categoryOptions = [],
    tagOptions = [],
  }: ModeProps & {
    brandOptions?: Array<{ value: string; label: string }>;
    productOptions?: Array<{ value: string; label: string }>;
    categoryOptions?: Array<{ value: string; label: string }>;
    tagOptions?: Array<{ value: string; label: string }>;
  }): FormFieldConfig<PromotionFormData>[] => [
    {
      name: "brandIds",
      label: "Target Brands",
      type: INPUT_TYPES.COMBOBOX,
      options: brandOptions,
      placeholder: "Search and select brands",
      description: "Select brands to target (optional)",
      disabled: mode === MODE.VIEW,
      className: "md:col-span-2",
      multi: true,
    },
    {
      name: "productIds",
      label: "Target Products",
      type: INPUT_TYPES.COMBOBOX,
      options: productOptions,
      placeholder: "Search and select products",
      description: "Select products to target (optional)",
      disabled: mode === MODE.VIEW,
      className: "md:col-span-2",
      multi: true,
    },
    {
      name: "categoryIds",
      label: "Target Categories",
      type: INPUT_TYPES.COMBOBOX,
      options: categoryOptions,
      placeholder: "Search and select categories",
      description: "Select categories to target (optional)",
      disabled: mode === MODE.VIEW,
      className: "md:col-span-2",
      multi: true,
    },
    {
      name: "tagIds",
      label: "Target Tags",
      type: INPUT_TYPES.COMBOBOX,
      options: tagOptions,
      placeholder: "Search and select tags",
      description: "Select tags to target (optional)",
      disabled: mode === MODE.VIEW,
      className: "md:col-span-2",
      multi: true,
    },
  ],

  schedule: ({
    mode,
  }: ModeProps): FormFieldConfig<PromotionFormData>[] => [
    {
      name: "startAt",
      label: "Start Date",
      type: INPUT_TYPES.DATEPICKER,
      description: "When the promotion starts (date only, time will be set to 00:00)",
      required: true,
      disabled: mode === MODE.VIEW,
      mode: "single" as const,
    },
    {
      name: "endAt",
      label: "End Date",
      type: INPUT_TYPES.DATEPICKER,
      description: "When the promotion ends (date only, time will be set to 23:59)",
      required: true,
      disabled: mode === MODE.VIEW,
      mode: "single" as const,
    },
  ],

  status: ({
    mode,
  }: ModeProps): FormFieldConfig<PromotionFormData>[] => [
    {
      name: "isActive",
      label: "Active",
      type: INPUT_TYPES.CHECKBOX,
      description: "Whether the promotion is currently active",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "allowOverlap",
      label: "Allow Overlap",
      type: INPUT_TYPES.CHECKBOX,
      description:
        "Whether this promotion can overlap with other promotions",
      disabled: mode === MODE.VIEW,
    },
  ],
};

