import type { ServerDataFetcher } from "@/core/components/data-view";
import type { PaginationParams } from "@/core/types";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";
import type { Brand } from "@/modules/panel/types/brand.type";
import { useMemo } from "react";

export const useBrandListFetcher = (): ServerDataFetcher<Brand> => {
  return useMemo(() => {
    return async ({
      pageIndex,
      pageSize,
      sorting,
      globalFilter,
      filters,
      signal,
    }) => {
      const params: PaginationParams = {
        page: pageIndex + 1,
        limit: pageSize,
      };

      // Add search
      if (globalFilter) {
        params.search = globalFilter;
      }

      // Add sorting
      if (sorting.length > 0) {
        params.sortBy = sorting[0].id;
        params.order = sorting[0].desc ? "desc" : "asc";
      }

      if (filters.status?.[0]?.value) {
        params.status = filters.status[0].value;
      }
      if (filters.companyId?.[0]?.value) {
        params.companyId = filters.companyId[0].value;
      }
      if (filters.locationId?.[0]?.value) {
        params.locationId = filters.locationId[0].value;
      }
      if (filters.userId?.[0]?.value) {
        params.userId = filters.userId[0].value;
      }

      const response = await apiGetBrands(params, signal);
      if (response && typeof response === "object" && "data" in response) {
        const responseData = response.data as {
          brands?: Brand[];
          totalRecords?: number;
        };
        return {
          rows: responseData?.brands || [],
          total: responseData?.totalRecords || 0,
        };
      }
      return { rows: [], total: 0 };
    };
  }, []);
};
