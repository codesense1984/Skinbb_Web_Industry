import { z } from "zod";

export const tagFormSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
});

export type TagFormData = z.infer<typeof tagFormSchema>;
