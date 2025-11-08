import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import type { OptionsFetcher, FilterValue } from "@/core/components/filters";

/**
 * Factory function that returns an OptionsFetcher for brands
 *
 * Example server API signature:
 * GET ENDPOINTS.BRAND.MAIN_ALL?page=<1-based>&limit=<n>&search=<q>&companyId=&locationId=
 *
 * Response:
 * {
 *   statusCode: 200,
 *   data: { brands: Array<any>, totalPages: number|null },
 *   message: "...",
 *   success: true
 * }
 */
export const brandOptionsFetcher = (): OptionsFetcher => {
  return async ({ page, limit, search, signal, working, applied }) => {
    // Extract dependencies from working/applied (prefer working while editing)
    const company = (working.company ?? applied.company) as
      | FilterValue
      | null
      | undefined;
    const location = (working.location ?? applied.location) as
      | FilterValue
      | null
      | undefined;

    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };

    if (search) {
      params.search = search;
    }

    // Only add filters when selected; otherwise return ALL brands
    if (company?.value) {
      params.companyId = String(company.value);
    }
    if (location?.value) {
      params.locationId = String(location.value);
    }

    // Use your existing request util
    const res = await api.get<{
      statusCode: number;
      data: {
        brands: Array<{
          _id: string;
          name: string;
          [key: string]: unknown;
        }>;
        totalPages: number | null;
      };
      message: string;
      success: boolean;
    }>(ENDPOINTS.BRAND.MAIN_ALL, { params, signal });

    const list = res?.data?.brands ?? [];
    const totalPages = res?.data?.totalPages ?? null;

    // Normalize into dropdown options
    const options = list.map((b) => ({
      value: String(b._id),
      label: String(b.name ?? b._id),
      meta: b,
    }));

    return { options, totalPages };
  };
};
