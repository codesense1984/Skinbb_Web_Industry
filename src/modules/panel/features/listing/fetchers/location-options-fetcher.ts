import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import type { OptionsFetcher, FilterValue } from "@/core/components/filters";

/**
 * Factory function that returns an OptionsFetcher for locations
 * Locations are filtered by company selection
 */
export const locationOptionsFetcher = (): OptionsFetcher => {
  return async ({ page, limit, search, signal, working, applied }) => {
    // Extract company from working/applied (prefer working while editing)
    const company = (working.company ?? applied.company) as
      | FilterValue
      | null
      | undefined;

    if (!company?.value) {
      // Return empty if no company selected
      return { options: [], totalPages: null };
    }

    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };

    if (search) {
      params.search = search;
    }

    const res = await api.get<{
      statusCode: number;
      data: {
        items: Array<{
          _id: string;
          addressLine1: string;
          city: string;
          state: string;
          [key: string]: unknown;
        }>;
        total: number;
        totalPages?: number | null;
      };
      message: string;
      success: boolean;
    }>(ENDPOINTS.COMPANY.LOCATION(company.value), { params, signal });

    const list = res?.data?.items ?? [];
    const totalPages = res?.data?.totalPages ?? null;

    const options = list.map((l) => ({
      value: String(l._id),
      label: `${l.addressLine1} - ${l.city}`,
      meta: l,
    }));

    return { options, totalPages };
  };
};

