import type {
  MetaFieldValue,
  ProductAttribute,
  ProductFormSchema,
  ProductReqData,
} from "../types/product.types";

export const formatDate = (date: string | Date): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toISOString().split("T")[0];
};

export const parseNumber = (input?: string | number): number | undefined => {
  if (input === undefined || input === null) return undefined;
  if (typeof input === "number") return input;
  if (typeof input === "string") {
    const parsed = Number(input.replace(/,/g, ""));
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

export const mapFieldTypeToMetaType = (
  fieldType: string,
): "string" | "array" | "objectId" | "rich-text-box" => {
  switch (fieldType) {
    case "multi-select":
      return "array";
    case "single-select":
      return "objectId";
    case "rich-textbox":
      return "rich-text-box";
    case "text":
    default:
      return "string";
  }
};

export const transformFormDataToApiRequest = (
  values: ProductFormSchema,
  metaFields: ProductAttribute[] = [],
): ProductReqData => {
  const cleanedValues: Partial<ProductReqData> = {};

  // Basic fields
  cleanedValues.productName = values.productName;
  cleanedValues.slug = values.slug;
  if (values.description) cleanedValues.description = values.description;
  if (values.status?.value) cleanedValues.status = values.status.value;
  if (values.sku) cleanedValues.sku = values.sku;
  if (values.productVariationType?.value)
    cleanedValues.productVariationType = values.productVariationType.value;
  if (values.brand?.value) cleanedValues.brand = values.brand.value;
  if (values.aboutTheBrand) cleanedValues.aboutTheBrand = values.aboutTheBrand;

  // Category and tags
  if (values.productCategory?.length)
    cleanedValues.productCategory = values.productCategory.map((c) => c.value);

  if (values.tags?.length) cleanedValues.tags = values.tags.map((t) => t.value);
  if (values.ingredients?.length)
    cleanedValues.ingredients = values.ingredients.map((i) => i.value);
  if (values.keyIngredients?.length)
    cleanedValues.keyIngredients = values.keyIngredients.map((k) => k.value);
  if (values.benefit?.length)
    cleanedValues.benefit = values.benefit.map((b) => b.value);

  // Vendor information
  if (values.marketedBy?.value)
    cleanedValues.marketedBy = values.marketedBy.value;
  if (values.marketedByAddress)
    cleanedValues.marketedByAddress = values.marketedByAddress;

  if (values.manufacturedBy?.value)
    cleanedValues.manufacturedBy = values.manufacturedBy.value;
  if (values.manufacturedByAddress)
    cleanedValues.manufacturedByAddress = values.manufacturedByAddress;

  if (values.importedBy?.value)
    cleanedValues.importedBy = values.importedBy.value;
  if (values.importedByAddress)
    cleanedValues.importedByAddress = values.importedByAddress;

  if (values.capturedBy?.value)
    cleanedValues.capturedBy = values.capturedBy.value;
  if (values.capturedDate)
    cleanedValues.capturedDate = formatDate(values.capturedDate);

  // Images
  if (values.thumbnail?.[0]?._id)
    cleanedValues.thumbnail = values.thumbnail[0]._id;
  if (values.images?.length)
    cleanedValues.images = values.images.map((img) => img._id);
  if (values.barcodeImage?.[0]?._id)
    cleanedValues.barcodeImage = values.barcodeImage[0]._id;

  // Dimensions
  if (
    values.dimensions?.length ||
    values.dimensions?.width ||
    values.dimensions?.height
  ) {
    cleanedValues.dimensions = {};
    if (values.dimensions.length)
      cleanedValues.dimensions.length = parseNumber(values.dimensions.length);
    if (values.dimensions.width)
      cleanedValues.dimensions.width = parseNumber(values.dimensions.width);
    if (values.dimensions.height)
      cleanedValues.dimensions.height = parseNumber(values.dimensions.height);
  }

  // Pricing
  const price = parseNumber(values.price);
  if (price !== undefined && !isNaN(price)) cleanedValues.price = price;

  const salePrice = parseNumber(values.salePrice);
  if (salePrice !== undefined && !isNaN(salePrice))
    cleanedValues.salePrice = salePrice;

  const quantity = parseNumber(values.quantity);
  if (quantity !== undefined && !isNaN(quantity))
    cleanedValues.quantity = quantity;

  // Dates
  if (values.manufacturingDate)
    cleanedValues.manufacturingDate = formatDate(values.manufacturingDate);
  if (values.expiryDate)
    cleanedValues.expiryDate = formatDate(values.expiryDate);

  // Attributes
  if (values.attributes?.length) {
    cleanedValues.attributes = values.attributes
      .filter((attr) => attr?.attributeId?.value)
      .map((attr) => ({
        attributeId: attr.attributeId!.value,
        attributeValueId: Array.isArray(attr.attributeValueId)
          ? attr.attributeValueId.map((val) => val.value)
          : attr.attributeValueId
            ? [attr.attributeValueId.value]
            : [],
      }));
  }

  if (values.removeAttributes?.length) {
    cleanedValues.removeAttributes = values.removeAttributes;
  }

  // Meta data
  const metaDataArray: MetaFieldValue[] = metaFields
    .map(({ slug, fieldType }) => {
      const val = values[slug];
      if (val === undefined || val === null) return null;

      const type = mapFieldTypeToMetaType(fieldType);

      let processedValue: any = val;

      if (type === "objectId") {
        processedValue = val?.value ?? val;
      } else if (type === "array") {
        processedValue = Array.isArray(val)
          ? val.map((item) => item?.value ?? item)
          : [];
      } else {
        processedValue = val;
      }

      return {
        key: slug,
        value: processedValue,
        type,
        ref: type === "array" || type === "objectId",
      };
    })
    .filter((v): v is MetaFieldValue => v !== null);

  cleanedValues.metaData = metaDataArray;

  // Variants
  if (values.variants?.length) {
    const removedVariantIds: string[] = [];

    if (
      cleanedValues.attributes?.length &&
      "685a4f3f2d20439677a5e89d" !== values.productVariationType?.value
    ) {
      const validOptionSet = new Set(
        cleanedValues.attributes.flatMap((attr) =>
          attr.attributeValueId.map((valId) => `${attr.attributeId}:${valId}`),
        ),
      );

      // const requiredOptionCount = cleanedValues.attributes.length;

      const attrSortMap: Record<string, number> = {};
      cleanedValues.attributes?.forEach((attr) => {
        attr.attributeValueId.forEach((valId, idx) => {
          attrSortMap[valId] = idx;
        });
      });

      cleanedValues.variants = values.variants
        .filter((variant) => {
          const isValid =
            variant.options.length ===
              (cleanedValues.attributes?.length ?? 0) &&
            variant.options.every((opt) =>
              validOptionSet.has(`${opt.attributeId}:${opt.attributeValueId}`),
            );

          if (!isValid && variant.id) {
            removedVariantIds.push(variant.id);
          }

          return isValid;
        })
        .sort((a, b) => {
          const aValId = a.options[0]?.attributeValueId;
          const bValId = b.options[0]?.attributeValueId;
          return (attrSortMap[aValId] ?? 0) - (attrSortMap[bValId] ?? 0);
        })
        .map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          dimensions: {
            length: parseNumber(variant.dimensions?.length),
            width: parseNumber(variant.dimensions?.width),
            height: parseNumber(variant.dimensions?.height),
          },
          price: parseNumber(variant.price),
          salePrice: parseNumber(variant.salePrice),
          quantity: parseNumber(variant.quantity),
          manufacturingDate: variant.manufacturingDate
            ? formatDate(variant.manufacturingDate)
            : undefined,
          expiryDate: variant.expiryDate
            ? formatDate(variant.expiryDate)
            : undefined,
          options: (cleanedValues.attributes ?? []).map((attr) => {
            const match = variant.options.find(
              (opt) => opt.attributeId === attr.attributeId,
            );
            return (
              match || {
                attributeId: attr.attributeId,
                attributeValueId: "",
              }
            );
          }),
        }));

      cleanedValues.removeVariants = removedVariantIds;
    } else {
      removedVariantIds.push(
        ...values.variants
          .map((v) => v.id)
          .filter((id): id is string => typeof id === "string"),
      );

      cleanedValues.variants = [];
    }
  }

  return cleanedValues as ProductReqData;
};

export const transformApiResponseToFormData = (
  apiData?: any,
): ProductFormSchema => {
  if (!apiData) {
    return {
      productName: "",
      slug: "",
      description: "",
      status: null,
      sku: "",
      productVariationType: null,
      brand: null,
      aboutTheBrand: "",
      productCategory: null,
      tags: null,
      marketedBy: null,
      marketedByAddress: "",
      manufacturedBy: null,
      manufacturedByAddress: "",
      importedBy: null,
      importedByAddress: "",
      capturedBy: null,
      capturedDate: new Date(),
      ingredients: null,
      keyIngredients: null,
      benefit: null,
      thumbnail: [],
      images: [],
      barcodeImage: [],
      dimensions: {
        length: "",
        width: "",
        height: "",
      },
      price: "",
      salePrice: "",
      quantity: "",
      manufacturingDate: "",
      expiryDate: "",
      metaData: [],
      attributes: [],
      variants: [],
      removeAttributes: [],
    };
  }

  // Transform API data to form data format
  return {
    productName: apiData.productName || "",
    slug: apiData.slug || "",
    description: apiData.description || "",
    status: apiData.status
      ? { label: apiData.status, value: apiData.status }
      : null,
    sku: apiData.sku || "",
    productVariationType: apiData.productVariationType
      ? {
          label: "Simple product",
          value: apiData.productVariationType,
        }
      : null,
    brand: apiData.brand
      ? { label: apiData.brand, value: apiData.brand }
      : null,
    aboutTheBrand: apiData.aboutTheBrand || "",
    productCategory:
      apiData.productCategory?.map((cat: string) => ({
        label: cat,
        value: cat,
      })) || null,
    tags:
      apiData.tags?.map((tag: string) => ({
        label: tag,
        value: tag,
      })) || null,
    marketedBy: apiData.marketedBy
      ? {
          label: apiData.marketedBy,
          value: apiData.marketedBy,
        }
      : null,
    marketedByAddress: apiData.marketedByAddress || "",
    manufacturedBy: apiData.manufacturedBy
      ? {
          label: apiData.manufacturedBy,
          value: apiData.manufacturedBy,
        }
      : null,
    manufacturedByAddress: apiData.manufacturedByAddress || "",
    importedBy: apiData.importedBy
      ? {
          label: apiData.importedBy,
          value: apiData.importedBy,
        }
      : null,
    importedByAddress: apiData.importedByAddress || "",
    capturedBy: apiData.capturedBy
      ? {
          label: apiData.capturedBy,
          value: apiData.capturedBy,
        }
      : null,
    capturedDate: apiData.capturedDate
      ? new Date(apiData.capturedDate)
      : new Date(),
    ingredients:
      apiData.ingredients?.map((ing: string) => ({
        label: ing,
        value: ing,
      })) || null,
    keyIngredients:
      apiData.keyIngredients?.map((ing: string) => ({
        label: ing,
        value: ing,
      })) || null,
    benefit:
      apiData.benefit?.map((ben: string) => ({
        label: ben,
        value: ben,
      })) || null,
    thumbnail: apiData.thumbnail
      ? [{ _id: apiData.thumbnail, url: apiData.thumbnail }]
      : [],
    images:
      apiData.images?.map((img: string) => ({
        _id: img,
        url: img,
      })) || [],
    barcodeImage: apiData.barcodeImage
      ? [
          {
            _id: apiData.barcodeImage,
            url: apiData.barcodeImage,
          },
        ]
      : [],
    dimensions: {
      length: apiData.dimensions?.length || "",
      width: apiData.dimensions?.width || "",
      height: apiData.dimensions?.height || "",
    },
    price: apiData.price || "",
    salePrice: apiData.salePrice || "",
    quantity: apiData.quantity || "",
    manufacturingDate: apiData.manufacturingDate || "",
    expiryDate: apiData.expiryDate || "",
    metaData: apiData.metaData || [],
    attributes: apiData.attributes || [],
    variants: apiData.variants || [],
    removeAttributes: [],
  };
};
