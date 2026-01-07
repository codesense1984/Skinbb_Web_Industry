import { z } from "zod";

export const productAttributeFormSchema = z.object({
  name: z
    .string()
    .min(1, "Attribute name is required")
    .min(2, "Attribute name must be at least 2 characters")
    .max(100, "Attribute name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  dataType: z.enum(["array", "string", "number", "boolean"]).optional(),
  fieldType: z
    .enum(["multi-select", "single-select", "text", "number", "boolean"])
    .optional(),
  isFilterable: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  isVariantField: z.boolean().optional(),
  placeholder: z.string().optional(),
  sortOrder: z.number().min(0).optional(),
});

export type ProductAttributeFormData = z.infer<
  typeof productAttributeFormSchema
>;

// Helper function to generate slug from name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};
