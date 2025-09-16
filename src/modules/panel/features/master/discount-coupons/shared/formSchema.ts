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
  type: z.enum(["bogo", "product", "cart"], {
    required_error: "Please select a coupon type",
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
  usageLimit: z
    .string()
    .min(1, "Usage limit is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 1,
      "Usage limit must be at least 1",
    ),
  validFrom: z.union([z.string(), z.date()]),
  expiresAt: z.union([z.string(), z.date()]),
  isActive: z.boolean(),
});

// Output schema for API (transforms dates to strings)
export const couponFormSchema = couponFormInputSchema
  .transform((data) => ({
    ...data,
    validFrom:
      data.validFrom instanceof Date
        ? data.validFrom.toISOString().split("T")[0]
        : data.validFrom,
    expiresAt:
      data.expiresAt instanceof Date
        ? data.expiresAt.toISOString().split("T")[0]
        : data.expiresAt,
  }))
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
      // Validate that expiry date is after valid from date
      const validFrom = new Date(data.validFrom);
      const expiresAt = new Date(data.expiresAt);
      return expiresAt > validFrom;
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
  { label: "Product", value: "product" },
  { label: "Cart", value: "cart" },
  { label: "BOGO (Buy One Get One)", value: "bogo" },
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
};
