import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";
import { apiGetCompaniesForFilter, apiGetCompanyLocations } from "@/modules/panel/services/http/company.service";

export const DEFAULT_PAGE_SIZE = 10;

// Company filter fetcher
export const companyFilter = createSimpleFetcher(apiGetCompaniesForFilter, {
  dataPath: "data.items",
  totalPath: "data.total",
});

// Brand filter fetcher factory (depends on companyId)
export const createBrandFilter = (companyId?: string) => {
  return createSimpleFetcher(
    (params: Record<string, unknown>) => {
      return apiGetBrands({
        ...params,
        ...(companyId && { companyId }),
      });
    },
    {
      dataPath: "data.brands",
      totalPath: "data.totalRecords",
    },
  );
};

// Location filter fetcher factory (depends on companyId)
export const createLocationFilter = (companyId?: string) => {
  return createSimpleFetcher(
    (params: Record<string, unknown>) => {
      if (!companyId) {
        return Promise.resolve({ data: { items: [], total: 0 } });
      }
      return apiGetCompanyLocations(companyId, {
        page: (params.pageIndex as number) + 1,
        limit: params.pageSize as number,
      });
    },
    {
      dataPath: "data.items",
      totalPath: "data.total",
    },
  );
};
