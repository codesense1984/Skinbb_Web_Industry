import { useMemo } from "react";
import type { ServerDataFetcher } from "@/core/components/data-view";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";
import { apiGetCompanyLocationBrands } from "@/modules/panel/services/http/company.service";
import type {
  Brand,
  CompanyLocationBrand,
} from "@/modules/panel/types/brand.type";
import type { PaginationParams } from "@/core/types";

interface UseBrandListFetcherProps {
  companyId?: string;
  locationId?: string;
  userId?: string;
}

/**
 * Hook that creates a brand list fetcher based on the provided context.
 *
 * Business Logic:
 * - If both companyId and locationId are provided: fetches brands for that specific location
 * - If only companyId is provided: fetches brands filtered by company
 * - If neither is provided: fetches all brands (admin view)
 */
export const useBrandListFetcher = ({
  companyId,
  locationId,
  userId,
}: UseBrandListFetcherProps): ServerDataFetcher<
  Brand 
> => {
  return useMemo(() => {
    return async ({
      pageIndex,
      pageSize,
      sorting,
      globalFilter,
      filters,
      signal,
    }) => {
      console.log("🚀 ~ useBrandListFetcher , ", {
        pageIndex,
        pageSize,
        sorting,
        globalFilter,
        filters,
        signal,
      });
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

      // Otherwise, use the global brands endpoint with filters
      // Add filter params
      if (filters.status?.[0]?.value) {
        params.status = filters.status[0].value;
      }
      if (filters.company?.[0]?.value) {
        params.companyId = filters.company[0].value;
      }
      if (filters.location?.[0]?.value) {
        params.locationId = filters.location[0].value;
      }

      // If companyId is provided (but not locationId), add it to params
      if (companyId) {
        params.companyId = companyId;
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
  }, [companyId, locationId, userId]);
};
