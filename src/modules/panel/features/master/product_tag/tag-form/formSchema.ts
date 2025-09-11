import { z } from "zod";

export const tagFormSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  isActive: z.boolean(),
});

export type TagFormData = z.infer<typeof tagFormSchema>;
