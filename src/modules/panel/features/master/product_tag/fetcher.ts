import { apiGetProductTags } from "@/modules/panel/services/http/product.service";
import type { ServerTableFetcher } from "@/core/components/data-table";
import type { ProductTag } from "./data";

export const fetcher = (): ServerTableFetcher<ProductTag> => {
  return async ({ pageIndex, pageSize, sorting, columnFilters: _columnFilters, globalFilter, signal: _signal }) => {
    // Force limit to be positive, default to 10
    const limit = pageSize > 0 ? pageSize : 10;
    
    const params = {
      page: pageIndex + 1,
      limit: limit,
      ...(globalFilter && { name: globalFilter }),
      ...(sorting[0] && { 
        sortBy: sorting[0].id,
        order: sorting[0].desc ? "desc" : "asc"
      }),
    };
    
    console.log("Custom Product Tag Fetcher called with:", { pageIndex, pageSize, limit, params });
    
    try {
      const response = await apiGetProductTags(params);
      console.log("API Response:", response);
      
      const rows = (response as { data?: { tags?: ProductTag[]; totalRecords?: number } })?.data?.tags || [];
      const total = (response as { data?: { tags?: ProductTag[]; totalRecords?: number } })?.data?.totalRecords || 0;
      
      console.log("Fetcher returning:", { rows: rows.length, total });
      return { rows, total };
    } catch (error) {
      console.error("Fetcher error:", error);
      throw error;
    }
  };
};
