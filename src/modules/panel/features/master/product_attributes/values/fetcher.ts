import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetProductAttributeValues } from "@/modules/panel/services/http/product-attribute-value.service";

export const fetcher = (attributeId: string) => {
  console.log("Fetcher created with attributeId:", attributeId);
  return createSimpleFetcher(
    (params: any) => {
      console.log(
        "Fetcher called with params:",
        params,
        "attributeId:",
        attributeId,
      );
      return apiGetProductAttributeValues({ ...params, attributeId });
    },
    {
      dataPath: "data.productAttributeValues",
      totalPath: "data.totalRecords",
      filterMapping: {
        search: "search",
        sortBy: "sortBy",
        order: "order",
      },
    },
  );
};
