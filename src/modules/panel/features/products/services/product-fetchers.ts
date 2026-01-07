import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetProductAttributes } from "@/modules/panel/services/http/product-attribute.service";
import { apiGetProductAttributeValues } from "@/modules/panel/services/http/product-attribute-value.service";

// Note: Types are defined inline in the transform functions for better flexibility

// Fetcher for product attributes
export const productAttributeFetcher = createSimpleFetcher(
  (params: Record<string, unknown>) => {
    return apiGetProductAttributes({
      isVariantField: true,
      page: (params.pageIndex as number) + 1,
      limit: params.pageSize as number,
      search: params.globalFilter as string,
    });
  },
  {
    dataPath: "data.productAttributes",
    totalPath: "data.total",
  },
);

// Fetcher for product attribute values
export const productAttributeValueFetcher = (attributeId: string) =>
  createSimpleFetcher(
    (params: Record<string, unknown>) => {
      return apiGetProductAttributeValues({
        attributeId,
        page: (params.pageIndex as number) + 1,
        limit: params.pageSize as number,
        search: params.globalFilter as string,
      });
    },
    {
      dataPath: "data.productAttributeValues",
      totalPath: "data.total",
    },
  );
