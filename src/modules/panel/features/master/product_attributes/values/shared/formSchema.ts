import { z } from "zod";

export const productAttributeValueFormSchema = z.object({
  label: z
    .string()
    .min(1, "Attribute label is required")
    .min(2, "Attribute label must be at least 2 characters")
    .max(100, "Attribute label must be less than 100 characters"),
  value: z
    .string()
    .min(1, "Attribute value is required")
    .min(2, "Attribute value must be at least 2 characters")
    .max(100, "Attribute value must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Attribute value must contain only lowercase letters, numbers, and hyphens",
    ),
});

export type ProductAttributeValueFormData = z.infer<
  typeof productAttributeValueFormSchema
>;

// Helper function to generate value from label
export const generateValue = (label: string): string => {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};
