import { DataView } from "@/core/components/data-view";
import {
  useCompanyName,
  useLocationName,
  useUserName,
} from "@/core/store/hooks/useEntityCache";
import {
  CompanyFilter,
  DEFAULT_PAGE_SIZE,
  LocationFilter,
} from "@/modules/panel/components/data-view";
import type {
  Brand,
  CompanyLocationBrand,
} from "@/modules/panel/types/brand.type";
import type { ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { useSearchParams } from "react-router";
import { StatusFilter } from "./StatusFilter";
import { useBrandListFetcher } from "./useBrandListFetcher";

export interface BrandListProps {
  // Context props
  companyId?: string;
  locationId?: string;
  userId?: string;

  // Filter visibility props
  showCompanyFilter?: boolean;
  showLocationFilter?: boolean;
  showStatusFilter?: boolean;

  // Additional props
  searchPlaceholder?: string;
  defaultViewMode?: "table" | "grid";
  defaultPageSize?: number;

  // Custom columns and card renderer (required)
  columns: ColumnDef<Brand>[];
  renderCard: (
    brand: Brand | CompanyLocationBrand,
    index?: number,
  ) => React.ReactNode;
}

/**
 * Highly reusable BrandList component that can be used across multiple contexts:
 * - Admin → All Brands
 * - Admin → Company → Location → Brands
 * - Company Login → Company Brands
 */
export const BrandList: React.FC<BrandListProps> = ({
  companyId,
  locationId,
  userId,
  showCompanyFilter = false,
  showLocationFilter = false,
  showStatusFilter = false,
  defaultViewMode = "table",
  defaultPageSize = DEFAULT_PAGE_SIZE,
  searchPlaceholder = "Search brands...",
  columns: providedColumns,
  renderCard: providedRenderCard,
}) => {
  const [searchParams] = useSearchParams();
  const order = searchParams.get("order");
  const sortBy = searchParams.get("sortBy");
  const fetcher = useBrandListFetcher();

  const companyName = useCompanyName(companyId);
  const locationName = useLocationName(locationId);
  const userName = useUserName(userId);

  const columns = useMemo(() => providedColumns, [providedColumns]);

  const queryKeyPrefix = useMemo(() => {
    if (companyId && locationId) {
      return `company-${companyId}-location-${locationId}-brands`;
    }
    if (companyId) {
      return `company-${companyId}-brands`;
    }
    return "brands";
  }, [companyId, locationId]);

  const filters = useMemo(() => {
    const filterList: React.ReactNode[] = [];

    if (showCompanyFilter) {
      filterList.push(<CompanyFilter key="company" dataKey="companyId" />);
    }

    if (showLocationFilter) {
      filterList.push(
        <LocationFilter
          key="location"
          dataKey="locationId"
          selectedCompanyId={companyId}
        />,
      );
    }

    if (showStatusFilter) {
      filterList.push(<StatusFilter key="status" />);
    }

    return filterList.length > 0 ? filterList : null;
  }, [showCompanyFilter, showLocationFilter, showStatusFilter, companyId]);

  const renderBrandCard = useMemo(
    () => providedRenderCard,
    [providedRenderCard],
  );

  return (
    <DataView<Brand>
      fetcher={fetcher}
      columns={columns}
      renderCard={renderBrandCard}
      gridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
      filters={filters}
      defaultFilters={{
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
        locationId: locationId
          ? [
              {
                label: locationName,
                value: locationId,
                disabled: !showLocationFilter,
                displayValue: "Location",
                hidden: !locationName,
              },
            ]
          : [],
        userId: userId
          ? [
              {
                label: userName,
                value: userId,
                disabled: true,
                displayValue: "User",
                hidden: !userName,
              },
            ]
          : [],
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
      }}
      defaultViewMode={defaultViewMode}
      defaultPageSize={defaultPageSize}
      enableUrlSync={false}
      queryKeyPrefix={queryKeyPrefix}
      searchPlaceholder={searchPlaceholder}
    />
  );
};
