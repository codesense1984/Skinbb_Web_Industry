import type { ServerDataFetcher } from "@/core/components/data-view";
import type { PaginationParams } from "@/core/types";
import { apiGetSurveys } from "@/modules/panel/services/survey.service";
import type { Survey } from "@/modules/panel/types/survey.types";
import { useMemo } from "react";

export const useSurveyListFetcher = (): ServerDataFetcher<Survey> => {
  return useMemo(
    () =>
      async ({
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

        if (filters.sortBy?.[0]?.value) {
          params.sortBy = filters.sortBy[0].value;
        }
        if (filters.order?.[0]?.value) {
          params.order = filters.order[0].value as "asc" | "desc";
        }

        if (globalFilter) {
          params.search = globalFilter;
        }

        if (sorting.length > 0) {
          params.sortBy = sorting[0].id;
          params.order = sorting[0].desc ? "desc" : "asc";
        }

        //default filters
        if (filters.status?.[0]?.value) {
          params.status = filters.status[0].value;
        }

        try {
          const response = await apiGetSurveys(params, signal);
          if (response && typeof response === "object" && "data" in response) {
            const responseData = response.data;
            return {
              rows: responseData?.surveys || [],
              total: responseData?.pagination?.total || 0,
            };
          }
        } catch (error) {
          console.error("Error fetching surveys:", error);
        }

        return { rows: [], total: 0 };
      },
    [],
  );
};
