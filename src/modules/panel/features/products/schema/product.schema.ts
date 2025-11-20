import { z } from "zod";

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const metaFieldValueSchema = z.object({
  key: z.string(),
  value: z.union([z.string(), optionSchema, z.null()]),
  type: z.enum(["string", "array", "objectId", "rich-text-box"]),
  ref: z.boolean(),
});

const SIMPLE_PRODUCT_ID = "685a4f3f2d20439677a5e89d";

export const productValidationSchema = z
  .object({
    // Basic Information
    productName: z.string().min(1, { message: "This is a required field." }),
    slug: z
      .string()
      .min(1, { message: "This is a required field." })
      .regex(/^[a-z0-9-]+$/, {
        message:
          "Slug must contain only lowercase letters, numbers, and hyphens.",
      }),
    description: z.string().optional(),
    productCategory: z.array(optionSchema).nullable().optional(),
    thumbnail: z
      .array(z.object({ _id: z.string(), url: z.string() }))
      .optional()
      .default([]),

    // Inventory
    sku: z.string().optional(),
    quantity: z.union([z.string(), z.number()]).optional(),

    // Barcode Image
    barcodeImage: z
      .array(z.object({ _id: z.string(), url: z.string() }))
      .optional()
      .default([]),

    // Pricing
    price: z.union([z.string(), z.number()]).optional(),
    salePrice: z.union([z.string(), z.number()]).optional(),

    // Variant
    productVariationType: optionSchema.nullable().optional(),
    attributes: z
      .array(
        z.object({
          attributeId: optionSchema.nullable(),
          attributeValueId: z
            .union([optionSchema, z.array(optionSchema), z.null()])
            .transform((val) => {
              if (val === null) return null;
              if (Array.isArray(val)) return val;
              return [val];
            }),
        }),
      )
      .optional(),

    // Physical Attributes
    manufacturingDate: z.union([z.string(), z.date()]).optional(),
    expiryDate: z.union([z.string(), z.date()]).optional(),
    length: z.union([z.string(), z.number()]).optional(),
    width: z.union([z.string(), z.number()]).optional(),
    height: z.union([z.string(), z.number()]).optional(),
    dimensions: z
      .object({
        length: z.union([z.string(), z.number()]),
        width: z.union([z.string(), z.number()]),
        height: z.union([z.string(), z.number()]),
      })
      .optional(),

    // Additional Information
    safetyPrecaution: z.string().optional(),
    howToUse: z.string().optional(),
    shelfLife: z.string().optional(),
    licenseNo: z.string().optional(),
    certificationApplicable: z.array(optionSchema).nullable().optional(),
    formulation: z.array(optionSchema).nullable().optional(),
    gender: optionSchema.nullable().optional(),
    claims: z.array(optionSchema).nullable().optional(),
    tags: z.array(optionSchema).nullable().optional(),

    // Status
    status: optionSchema.nullable().optional(),

    // Vendor Information
    brand: optionSchema.nullable().optional(),
    aboutTheBrand: z.string().optional(),
    marketedBy: optionSchema.nullable().optional(),
    marketedByAddress: z.string().optional(),
    manufacturedBy: optionSchema.nullable().optional(),
    manufacturedByAddress: z.string().optional(),
    importedBy: optionSchema.nullable().optional(),
    importedByAddress: z.string().optional(),
    capturedBy: optionSchema.nullable().optional(),
    capturedDate: z.union([z.string(), z.date()]).optional(),

    // Key Information
    ingredients: z.array(optionSchema).nullable().optional(),
    keyIngredients: z.array(optionSchema).nullable().optional(),
    benefit: z.array(optionSchema).nullable().optional(),

    // Product Classification
    productClassification: z.array(optionSchema).nullable().optional(),
    bodyPart: z.array(optionSchema).nullable().optional(),
    makeupFinish: z.array(optionSchema).nullable().optional(),
    fragranceFamily: z.array(optionSchema).nullable().optional(),
    specialFeature: z.array(optionSchema).nullable().optional(),
    hairType: z.array(optionSchema).nullable().optional(),
    skinType: z.array(optionSchema).nullable().optional(),
    concern: z.array(optionSchema).nullable().optional(),
    conscious: z.array(optionSchema).nullable().optional(),

    // Images
    images: z
      .array(z.object({ _id: z.string(), url: z.string() }))
      .optional()
      .default([]),

    // Variants
    variants: z
      .array(
        z.object({
          id: z.string().optional(),
          sku: z.string().optional(),
          dimensions: z
            .object({
              length: z.union([z.string(), z.number()]).optional(),
              width: z.union([z.string(), z.number()]).optional(),
              height: z.union([z.string(), z.number()]).optional(),
            })
            .optional(),
          price: z.union([z.string(), z.number()]).optional(),
          salePrice: z.union([z.string(), z.number()]).optional(),
          quantity: z.union([z.string(), z.number()]).optional(),
          manufacturingDate: z.union([z.string(), z.date()]).optional(),
          expiryDate: z.union([z.string(), z.date()]).optional(),
          options: z.array(
            z.object({
              attributeId: z.string(),
              attributeValueId: z.string(),
            }),
          ),
        }),
      )
      .optional(),

    // Meta data
    metaData: z.array(metaFieldValueSchema).optional(),
    removeAttributes: z.array(z.string()).optional().default([]),
  })
  .catchall(z.any());

export type ProductFormSchema = z.infer<typeof productValidationSchema>;

export const getProductSchema = () => {
  return productValidationSchema;
};

export { SIMPLE_PRODUCT_ID };
