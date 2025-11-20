import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetProductCategories } from "@/modules/panel/services/http/product.service";

export const fetcher = (parentCategoryId?: string) => {
  // Create a wrapper function that always includes parentCategory when provided
  const apiCallWithParent = async (params: any, signal?: AbortSignal) => {
    const finalParams = {
      ...params,
      ...(parentCategoryId && { parentCategory: parentCategoryId }),
    };
    return apiGetProductCategories(finalParams, signal);
  };

  return createSimpleFetcher(apiCallWithParent, {
    dataPath: "data.productCategories",
    totalPath: "data.totalRecords",
    filterMapping: {
      search: "search",
      parentCategory: "parentCategory",
    },
  });
};
