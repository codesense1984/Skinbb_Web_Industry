import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetProductTags } from "@/modules/panel/services/http/product.service";

export const fetcher = () =>
  createSimpleFetcher(apiGetProductTags, {
    dataPath: "data.productTags",
    totalPath: "data.totalRecords",
  });
