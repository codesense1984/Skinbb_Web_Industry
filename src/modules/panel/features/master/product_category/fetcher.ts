import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetProductCategories } from "@/modules/panel/services/http/product.service";

export const fetcher = () =>
  createSimpleFetcher(apiGetProductCategories, {
    dataPath: "data.productCategories",
    totalPath: "data.totalRecords",
    // filterMapping: {
    //   search: "search",
    //   parentCategory: "parentCategory",
    // },
  });
