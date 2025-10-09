import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetProductAttributes } from "@/modules/panel/services/http/product-attribute.service";

export const fetcher = () =>
  createSimpleFetcher(apiGetProductAttributes, {
    dataPath: "data.productAttributes",
    totalPath: "data.totalRecords",
    filterMapping: {
      search: "search",
      sortBy: "sortBy",
      order: "order",
    },
  });
