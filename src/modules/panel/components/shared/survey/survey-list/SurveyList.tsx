import { DataView } from "@/core/components/data-view";
import {
  CompanyFilter,
  DEFAULT_PAGE_SIZE,
} from "@/modules/panel/components/data-view";
import type { Survey } from "@/modules/panel/types/survey.types";
import type { ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { useSearchParams } from "react-router";
import { StatusFilter } from "./StatusFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { useSurveyListFetcher } from "./useSurveyListFetcher";
import { useCompanyName } from "@/core/store/hooks";

export interface SurveyListProps {
  // Filter visibility props
  showCompanyFilter?: boolean;
  companyId?: string;

  // Additional props
  searchPlaceholder?: string;
  defaultViewMode?: "table" | "grid";
  defaultPageSize?: number;

  // Custom columns and card renderer (required)
  columns: ColumnDef<Survey>[];
  renderCard: (survey: Survey, index?: number) => React.ReactNode;
}

/**
 * Highly reusable SurveyList component that can be used across multiple contexts:
 * - Admin → All Surveys
 * - Seller → Company Surveys
 */
export const SurveyList: React.FC<SurveyListProps> = ({
  showCompanyFilter = false,
  companyId,
  defaultViewMode = "table",
  defaultPageSize = DEFAULT_PAGE_SIZE,
  searchPlaceholder = "Search surveys...",
  columns: providedColumns,
  renderCard: providedRenderCard,
}) => {
  const [searchParams] = useSearchParams();
  const companyName = useCompanyName(companyId);
  const order = searchParams.get("order");
  const sortBy = searchParams.get("sortBy");
  const fetcher = useSurveyListFetcher();

  const columns = useMemo(() => providedColumns, [providedColumns]);

  const queryKeyPrefix = useMemo(() => {
    if (companyId) {
      return `company-${companyId}-surveys`;
    }
    return "surveys";
  }, []);

  const filters = useMemo(() => {
    const filterList: React.ReactNode[] = [];

    if (showCompanyFilter) {
      filterList.push(<CompanyFilter key="company" dataKey="companyId" />);
    }

    filterList.push(<StatusFilter key="status" />);
    // filterList.push(<DateRangeFilter key="dateRange" />);

    return filterList.length > 0 ? filterList : null;
  }, [showCompanyFilter]);

  const renderSurveyCard = useMemo(
    () => providedRenderCard,
    [providedRenderCard],
  );

  return (
    <DataView<Survey>
      fetcher={fetcher}
      columns={columns}
      renderCard={renderSurveyCard}
      gridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
      filters={filters}
      defaultFilters={{
        order: order
          ? [
              {
                value: order,
                label: order,
                displayValue: "OrderBy",
                hidden: true,
              },
            ]
          : [],
        sortBy: sortBy
          ? [
              {
                value: sortBy,
                label: sortBy,
                displayValue: "SortBy",
                hidden: true,
              },
            ]
          : [],
        companyId: companyId
          ? [
              {
                label: companyName,
                value: companyId,
                disabled: !showCompanyFilter,
                displayValue: "Company",
                hidden: !companyName,
              },
            ]
          : [],
      }}
      defaultViewMode={defaultViewMode}
      defaultPageSize={defaultPageSize}
      enableUrlSync={false}
      queryKeyPrefix={queryKeyPrefix}
      searchPlaceholder={searchPlaceholder}
    />
  );
};
