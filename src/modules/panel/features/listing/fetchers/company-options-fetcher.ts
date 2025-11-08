import type { OptionsFetcher } from "@/core/components/filters";
import { apiGetCompanyList } from "@/modules/panel/services/http/company.service";
import type { CompanyListItem } from "@/modules/panel/types/company.type";
import type { ApiResponse } from "@/core/types";

/**
 * Factory function that returns an OptionsFetcher for companies
 */
export const companyOptionsFetcher = (): OptionsFetcher => {
  return async ({ page, limit, search, signal }) => {
    const params = {
      page,
      limit,
      ...(search && { search }),
    };

    const res = await apiGetCompanyList<
      ApiResponse<{
        items: CompanyListItem[];
        page: number;
        limit: number;
        total: number;
        totalPages?: number | null;
      }>
    >(params, signal);

    const list = res?.data?.items ?? [];
    const totalPages = res?.data?.totalPages ?? null;

    const options = list.map((c) => ({
      value: String(c._id),
      label: String(c.companyName ?? c._id),
      meta: c,
    }));

    return { options, totalPages };
  };
};
