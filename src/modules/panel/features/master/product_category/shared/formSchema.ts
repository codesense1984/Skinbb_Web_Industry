import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  parentCategory: z.string().optional(),
  isActive: z.boolean(),
  image: z.any().optional(), // For base64 preview
  image_files: z.any().optional(), // For actual file upload
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
