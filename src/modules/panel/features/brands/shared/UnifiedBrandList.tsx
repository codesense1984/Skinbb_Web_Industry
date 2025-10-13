import React, { useCallback, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { TableAction } from "@/core/components/data-table/components/table-action";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import {
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
} from "@/core/components/ui/avatar";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { FilterDropdown } from "@/core/components/filters/FilterDropdown";
import { formatDate, formatCurrency, capitalize } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";
import { apiGetCompanyLocationBrands } from "@/modules/panel/services/http/company.service";
import { apiGetCompanyList, apiGetCompanyLocations } from "@/modules/panel/services/http/company.service";
import type { Brand, CompanyLocationBrand } from "@/modules/panel/types/brand.type";
import type { CompanyListItem, CompanyAddressInfo } from "@/modules/panel/types/company.type";
import type { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router";
import { useUrlFilters } from "@/core/hooks/use-url-filters";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { STATUS_MAP } from "@/core/config/status";
import {
  DropdownMenu,
  type DropdownMenuItemType,
} from "@/core/components/ui/dropdown-menu";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";

// Configuration types
export interface BrandListConfig {
  mode: 'global' | 'company' | 'location' | 'products';
  title: string;
  description: string;
  showFilters?: boolean;
  showAddButton?: boolean;
  addButtonText?: string;
  addButtonRoute?: string;
  // Context-specific settings
  autoSelectCompany?: string;
  autoSelectLocation?: string;
  disableFilterEditing?: boolean;
}

interface UnifiedBrandListProps {
  config: BrandListConfig;
  companyId?: string;
  locationId?: string;
  brandId?: string;
  userId?: string;
}

// Unified brand columns - same for all contexts
const createUnifiedBrandColumns = (
  companyId?: string,
  locationId?: string,
): ColumnDef<any>[] => [
  {
    accessorKey: "name",
    header: "Brand",
    cell: ({ row, getValue }) => (
      <ul className="flex min-w-40 items-center gap-2">
        <AvatarRoot className="size-10 rounded-md border">
          <AvatarImage
            className="object-contain"
            src={row.original.logoImage?.url || row.original?.logoImage}
            alt={`${row.original.name} logo`}
          />
          <AvatarFallback className="rounded-md capitalize">
            {(getValue() as string)?.charAt(0)}
          </AvatarFallback>
        </AvatarRoot>
        <div className="flex flex-col">
          <span className="font-medium">{getValue() as string}</span>
          <span className="text-muted-foreground text-sm">
            {row.original.slug || row.original?.slug}
          </span>
        </div>
      </ul>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      // Handle both isActive boolean and status string
      const status = row.original.status || (row.original.isActive ? "active" : "inactive");
      const statusChangeReason = row.original.statusChangeReason;
      
      return (
        <div className="space-y-1">
          <StatusBadge
            module="brand"
            status={status}
            variant="badge"
          >
            {status}
          </StatusBadge>
          {status === "rejected" && statusChangeReason && (
            <div
              className="max-w-[180px] truncate text-xs text-red-600"
              title={statusChangeReason}
            >
              Reason: {statusChangeReason}
            </div>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const status = row.original.status || (row.original.isActive ? "active" : "inactive");
      return value.includes(status);
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => {
      const createdAt = getValue() as string;
      return <div className="w-max">{formatDate(createdAt)}</div>;
    },
  },
  {
    header: "Action",
    accessorKey: "actions",
    enableSorting: false,
    enableHiding: false,
    size: 80,
    cell: ({ row }) => {
      const brandId = row.original._id;
      const status = row.original.status || (row.original.isActive ? "active" : "inactive");
      
      const items: DropdownMenuItemType[] = [
        {
          type: "link",
          to: companyId && locationId 
            ? PANEL_ROUTES.COMPANY_LOCATION.BRAND_VIEW(companyId, locationId, brandId)
            : PANEL_ROUTES.BRAND.VIEW(brandId),
          title: "View brand details",
          children: (
            <>
              <EyeIcon className="size-4" /> View
            </>
          ),
        },
      ];

      // Show View Products action for approved brands (only in location context)
      if (companyId && locationId && 
          ![
            STATUS_MAP.brand.pending.value,
            STATUS_MAP.brand.rejected.value,
          ].includes(status)) {
        items.push({
          type: "link",
          to: PANEL_ROUTES.COMPANY_LOCATION.BRAND_PRODUCTS(companyId, locationId, brandId),
          title: "View products for this brand",
          children: (
            <>
              <ShoppingBagIcon className="size-4" /> View Products
            </>
          ),
        });
      }

      // Edit action - preserve context
      items.push({
        type: "link",
        to: companyId && locationId 
          ? PANEL_ROUTES.COMPANY_LOCATION.BRAND_EDIT(companyId, locationId, brandId)
          : PANEL_ROUTES.BRAND.EDIT(brandId),
        title: "Edit brand",
        children: (
          <>
            <PencilIcon className="size-4" /> Edit
          </>
        ),
      });

      return (
        <DropdownMenu items={items}>
          <Button variant="outlined" size="icon">
            <EllipsisVerticalIcon className="size-4" />
          </Button>
        </DropdownMenu>
      );
    },
  },
];

// Create fetchers based on mode
const createFetcher = (config: BrandListConfig, companyId?: string, locationId?: string, userId?: string) => {
  switch (config.mode) {
    case 'global':
      return createSimpleFetcher(
        (params: Record<string, unknown>) => apiGetBrands(params),
        {
          dataPath: "data.brands",
          totalPath: "data.totalRecords",
          filterMapping: {
            isActive: "isActive",
            status: "status",
            companyId: "companyId",
            locationId: "locationId",
          },
        }
      );
    
    case 'location':
      return createSimpleFetcher(
        (params: Record<string, unknown>) => 
          apiGetCompanyLocationBrands(companyId!, locationId!, { ...params, userId: userId! }),
        {
          dataPath: "data",
        }
      );
    
    case 'company':
      // Placeholder for company-specific brands
      return createSimpleFetcher(
        () => Promise.resolve({ data: [], total: 0 }),
        { dataPath: "data", totalPath: "total" }
      );
    
    default:
      return createSimpleFetcher(
        () => Promise.resolve({ data: [], total: 0 }),
        { dataPath: "data", totalPath: "total" }
      );
  }
};

const UnifiedBrandList: React.FC<UnifiedBrandListProps> = ({
  config,
  companyId,
  locationId,
  brandId,
  userId,
}) => {
  const navigate = useNavigate();
  const { filters, updateFilter, updateFilters } = useUrlFilters([
    "companyId",
    "locationId",
  ]);
  const tableRef = useRef<any>(null);

  // Memoize API functions for filters
  const companyApi = useMemo(
    () =>
      createSimpleFetcher((params) => apiGetCompanyList(params), {
        dataPath: "data.items",
        totalPath: "data.total",
      }),
    []
  );

  const locationApi = useMemo(
    () =>
      createSimpleFetcher(
        (params) => {
          if (!filters.companyId) {
            return Promise.resolve({ rows: [], total: 0 });
          }
          return apiGetCompanyLocations(filters.companyId, params);
        },
        { dataPath: "data.items", totalPath: "data.totalPages" }
      ),
    [filters.companyId]
  );

  // Handle company change
  const handleCompanyChange = useCallback(
    (companyId: string) => {
      updateFilters({
        companyId: companyId,
        locationId: "",
      });
    },
    [updateFilters]
  );

  // Handle location change
  const handleLocationChange = useCallback(
    (locationId: string) => {
      updateFilter("locationId", locationId);
    },
    [updateFilter]
  );

  // Sync table filters with URL state
  useEffect(() => {
    if (tableRef.current && config.mode === 'global') {
      const timeoutId = setTimeout(() => {
        const tableFilters = [];
        if (filters.companyId) {
          tableFilters.push({ id: "companyId", value: filters.companyId });
        }
        if (filters.locationId) {
          tableFilters.push({ id: "locationId", value: filters.locationId });
        }
        tableRef.current.table.setColumnFilters(tableFilters);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.companyId, filters.locationId, config.mode]);

  // Get columns - unified for all modes
  const getColumns = (): ColumnDef<any>[] => {
    return createUnifiedBrandColumns(companyId, locationId);
  };

  // Get fetcher based on mode
  const fetcher = useMemo(() => {
    return createFetcher(config, companyId, locationId, userId);
  }, [config, companyId, locationId, userId]);

  // Get query key prefix
  const getQueryKeyPrefix = () => {
    switch (config.mode) {
      case 'global':
        return PANEL_ROUTES.BRAND.LIST;
      case 'location':
        return ENDPOINTS.COMPANY_LOCATION_BRANDS.LIST(companyId!, locationId!);
      case 'company':
        return `company-brands-${companyId}`;
      default:
        return 'brands';
    }
  };

  // Handle add button click
  const handleAddClick = () => {
    if (config.addButtonRoute) {
      navigate(config.addButtonRoute);
    }
  };

  // Auto-select filters based on context
  useEffect(() => {
    if (config.autoSelectCompany && !filters.companyId) {
      updateFilter("companyId", config.autoSelectCompany);
    }
    if (config.autoSelectLocation && !filters.locationId) {
      updateFilter("locationId", config.autoSelectLocation);
    }
  }, [config.autoSelectCompany, config.autoSelectLocation, filters.companyId, filters.locationId, updateFilter]);

  // Render filters based on mode
  const renderFilters = () => {
    if (!config.showFilters) {
      return null;
    }

    return (
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-medium md:block">Company:</span>
          <FilterDropdown<CompanyListItem>
            apiFunction={companyApi}
            transform={(val) => ({
              value: val._id,
              label: val.companyName,
            })}
            value={filters.companyId || ""}
            onChange={handleCompanyChange}
            placeholder="Filter by company..."
            queryKey={[ENDPOINTS.COMPANY.MAIN]}
            enabled={!config.disableFilterEditing}
            componentEnabled={!config.disableFilterEditing}
            disabled={config.disableFilterEditing}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-medium md:block">Location:</span>
          <FilterDropdown<CompanyAddressInfo>
            key={`location-${filters.companyId}`}
            apiFunction={locationApi}
            transform={(val) => ({
              value: val._id ?? val.addressId ?? "",
              label: `${val.city}, ${val.state}`,
            })}
            value={filters.locationId || ""}
            onChange={handleLocationChange}
            placeholder="Filter by location..."
            disabled={!filters.companyId || config.disableFilterEditing}
            enabled={!!filters.companyId && !config.disableFilterEditing}
            componentEnabled={!!filters.companyId && !config.disableFilterEditing}
            queryKey={[ENDPOINTS.COMPANY.LOCATION(filters.companyId)]}
          />
        </div>
      </div>
    );
  };

  // Render add button
  const renderAddButton = () => {
    if (!config.showAddButton) {
      return null;
    }

    if (config.addButtonRoute) {
      return (
        <Button color="primary" asChild>
          <NavLink to={config.addButtonRoute}>
            {config.addButtonText || "Add Brand"}
          </NavLink>
        </Button>
      );
    }

    return (
      <Button color="primary" onClick={handleAddClick}>
        {config.addButtonText || "Add Brand"}
      </Button>
    );
  };

  return (
    <PageContent
      header={{
        title: config.title,
        description: config.description,
        actions: renderAddButton(),
      }}
    >
      <DataTable
        columns={getColumns()}
        isServerSide={config.mode === 'global'}
        fetcher={fetcher}
        queryKeyPrefix={getQueryKeyPrefix()}
        initialColumnFilters={
          config.mode === 'global'
            ? [
                ...(filters.companyId
                  ? [{ id: "companyId", value: filters.companyId }]
                  : []),
                ...(filters.locationId
                  ? [{ id: "locationId", value: filters.locationId }]
                  : []),
              ]
            : []
        }
        actionProps={(tableState) => {
          tableRef.current = tableState;
          return {
            children: renderFilters(),
          };
        }}
      />
    </PageContent>
  );
};

export default UnifiedBrandList;
