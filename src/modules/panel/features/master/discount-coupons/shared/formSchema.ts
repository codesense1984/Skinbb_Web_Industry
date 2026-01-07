import { z } from "zod";
import { INPUT_TYPES } from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import type { FormFieldConfig } from "@/core/components/ui/form-input";

// Input schema for form (accepts Date objects from date picker)
export const couponFormInputSchema = z.object({
  code: z
    .string()
    .min(1, "Coupon code is required")
    .min(3, "Coupon code must be at least 3 characters")
    .max(50, "Coupon code must be less than 50 characters")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Coupon code can only contain uppercase letters, numbers, hyphens, and underscores",
    ),
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  type: z.enum(["amount_off_products", "amount_off_order", "buy_x_get_y"], {
    required_error: "Please select a discount type",
  }),
  discountType: z.enum(["percentage", "fixed_amount", "free_product"], {
    required_error: "Please select a discount type",
  }),
  discountValue: z
    .string()
    .min(1, "Discount value is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0,
      "Discount value must be a positive number",
    ),
  selectedProducts: z.array(z.string()).optional(),
  freeProducts: z.array(z.string()).optional(),
  usageLimit: z
    .string()
    .min(1, "Usage limit is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 1,
      "Usage limit must be at least 1",
    ),
  validFrom: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
  // Usage toggles
  enableUsageLimit: z.boolean().optional(),
  enableMinimumSpend: z.boolean().optional(),
  enableMinimumQuantity: z.boolean().optional(),
  enableMaxDiscountValue: z.boolean().optional(),
  // Usage values
  minimumSpend: z.string().optional(),
  minimumQuantity: z.string().optional(),
  maxDiscountValue: z.string().optional(),
});

// Output schema for API (no transformation needed since we're using strings)
export const couponFormSchema = couponFormInputSchema
  .refine(
    (data) => {
      // Validate that discount value is appropriate for discount type
      if (
        data.discountType === "percentage" &&
        Number(data.discountValue) > 100
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      // Validate that expiry date is after valid from date (only if both dates are provided)
      if (data.validFrom && data.expiresAt) {
        const validFrom = new Date(data.validFrom);
        const expiresAt = new Date(data.expiresAt);
        return (
          !isNaN(validFrom.getTime()) &&
          !isNaN(expiresAt.getTime()) &&
          expiresAt > validFrom
        );
      }
      return true;
    },
    {
      message: "Expiry date must be after valid from date",
      path: ["expiresAt"],
    },
  );

export type CouponFormData = z.infer<typeof couponFormInputSchema>;
export type CouponFormOutput = z.infer<typeof couponFormSchema>;

// Coupon type options
const COUPON_TYPE_OPTIONS = [
  { label: "Amount off products", value: "amount_off_products" },
  { label: "Amount off order", value: "amount_off_order" },
  { label: "Buy X get Y", value: "buy_x_get_y" },
];

// Discount type options
const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed_amount" },
  { label: "Free Product", value: "free_product" },
];

// Field configuration types
type ModeProps = { mode: MODE };

// Field configurations
export const couponSchema = {
  basic_information: ({
    mode,
  }: ModeProps): FormFieldConfig<CouponFormData>[] => [
    {
      name: "code",
      label: "Coupon Code",
      type: INPUT_TYPES.TEXT,
      placeholder: "e.g., SAVE20, BOGO50",
      description:
        "Unique code for the coupon (uppercase letters, numbers, hyphens, underscores only)",
      required: true,
      disabled: mode === MODE.VIEW,
    },
    {
      name: "title",
      label: "Title",
      type: INPUT_TYPES.TEXT,
      placeholder: "e.g., 20% Off Summer Sale",
      description: "Display name for the coupon",
      required: true,
      disabled: mode === MODE.VIEW,
    },
    {
      name: "description",
      label: "Description",
      type: INPUT_TYPES.RICH_TEXT,
      placeholder: "Describe what this coupon offers...",
      description: "Detailed description of the coupon offer",
      required: true,
      className: "md:col-span-2",
      disabled: mode === MODE.VIEW,
    },
  ],

  coupon_details: ({ mode }: ModeProps): FormFieldConfig<CouponFormData>[] => [
    {
      name: "type",
      label: "Coupon Type",
      type: INPUT_TYPES.SELECT,
      options: COUPON_TYPE_OPTIONS,
      placeholder: "Select coupon type",
      description: "Type of coupon offer",
      required: true,
      disabled: mode === MODE.VIEW,
    },
    {
      name: "discountType",
      label: "Discount Type",
      type: INPUT_TYPES.SELECT,
      options: DISCOUNT_TYPE_OPTIONS,
      placeholder: "Select discount type",
      description: "How the discount is applied",
      required: true,
      disabled: mode === MODE.VIEW,
    },
    {
      name: "discountValue",
      label: "Discount Value",
      type: INPUT_TYPES.TEXT,
      placeholder: "e.g., 20 for 20% or 100 for ₹100 off",
      description: "Discount amount (percentage or fixed amount)",
      required: true,
      disabled: mode === MODE.VIEW,
    },
    {
      name: "usageLimit",
      label: "Usage Limit",
      type: INPUT_TYPES.TEXT,
      placeholder: "e.g., 100",
      description: "Maximum number of times this coupon can be used",
      required: true,
      disabled: mode === MODE.VIEW,
    },
  ],

  validity_period: ({ mode }: ModeProps): FormFieldConfig<CouponFormData>[] => [
    {
      name: "validFrom",
      label: "Valid From",
      type: INPUT_TYPES.DATEPICKER,
      description: "Date when the coupon becomes active",
      required: true,
      disabled: mode === MODE.VIEW,
      mode: "single" as const,
    },
    {
      name: "expiresAt",
      label: "Expires At",
      type: INPUT_TYPES.DATEPICKER,
      description: "Date when the coupon expires",
      required: true,
      disabled: mode === MODE.VIEW,
      mode: "single" as const,
    },
  ],
  status: ({ mode }: ModeProps): FormFieldConfig<CouponFormData>[] => [
    {
      name: "isActive",
      label: "Status of the coupon",
      type: INPUT_TYPES.CHECKBOX,
      description: "",
      disabled: mode === MODE.VIEW,
    },
  ],

  product_selection: ({
    mode,
    productOptions = [],
  }: ModeProps & {
    productOptions?: Array<{ value: string; label: string }>;
  }): FormFieldConfig<CouponFormData>[] => [
    {
      name: "selectedProducts",
      label: "Select Products",
      type: INPUT_TYPES.COMBOBOX,
      options: productOptions,
      placeholder: "Search and select products",
      description: "Choose specific products for this discount",
      disabled: mode === MODE.VIEW,
      className: "md:col-span-2",
      multi: true,
    },
  ],

  usage_settings: ({ mode }: ModeProps): FormFieldConfig<CouponFormData>[] => [
    {
      name: "enableUsageLimit",
      label: "Usage Limit",
      type: INPUT_TYPES.CHECKBOX,
      description: "Enable to limit number of times the coupon can be used",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "enableMinimumSpend",
      label: "Minimum Spend",
      type: INPUT_TYPES.CHECKBOX,
      description: "Enable to set minimum purchase value required",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "enableMinimumQuantity",
      label: "Minimum Quantity",
      type: INPUT_TYPES.CHECKBOX,
      description: "Enable to set minimum items needed in cart",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "enableMaxDiscountValue",
      label: "Max Discount Value",
      type: INPUT_TYPES.CHECKBOX,
      description: "Enable to cap the maximum discount value",
      disabled: mode === MODE.VIEW,
    },
  ],

  usage_values: ({ mode }: ModeProps): FormFieldConfig<CouponFormData>[] => [
    {
      name: "minimumSpend",
      label: "Minimum Spend Amount",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter minimum spend amount",
      description: "Minimum order value required to use this coupon",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "minimumQuantity",
      label: "Minimum Quantity",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter minimum quantity",
      description: "Minimum number of items required in cart",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "maxDiscountValue",
      label: "Maximum Discount Value",
      type: INPUT_TYPES.TEXT,
      placeholder: "Enter maximum discount amount",
      description: "Maximum discount amount that can be applied",
      disabled: mode === MODE.VIEW,
    },
  ],
};
