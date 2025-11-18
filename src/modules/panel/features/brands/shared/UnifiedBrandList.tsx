import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  DataView,
  type ServerDataFetcher,
} from "@/core/components/data-view";
import { BrandCard } from "../brand-list/BrandCard";
import {
  DEFAULT_PAGE_SIZE,
  StatusFilter,
  CompanyFilter,
  LocationFilter,
} from "@/modules/panel/components/data-view";
import {
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
} from "@/core/components/ui/avatar";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";
import { apiGetCompanyLocationBrands } from "@/modules/panel/services/http/company.service";
import type { Brand, CompanyLocationBrand } from "@/modules/panel/types/brand.type";
import type { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { STATUS_MAP } from "@/core/config/status";
import type { PaginationParams } from "@/core/types";
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

// Create fetchers based on mode for DataView
const createBrandFetcher = (
  config: BrandListConfig,
  companyId?: string,
  locationId?: string,
  userId?: string,
): ServerDataFetcher<Brand | CompanyLocationBrand> => {
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

    if (globalFilter) {
      params.search = globalFilter;
    }

    if (sorting.length > 0) {
      params.sortBy = sorting[0].id;
      params.order = sorting[0].desc ? "desc" : "asc";
    }

    switch (config.mode) {
      case 'global':
        // Map filters to API params
        if (filters.status?.[0]?.value) {
          params.status = filters.status[0].value;
        }
        if (filters.company?.[0]?.value) {
          params.companyId = filters.company[0].value;
        }
        if (filters.location?.[0]?.value) {
          params.locationId = filters.location[0].value;
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

      case 'location':
        if (!companyId || !locationId) {
          return { rows: [], total: 0 };
        }
        const locationResponse = await apiGetCompanyLocationBrands(
          companyId,
          locationId,
          { ...params, userId: userId || "" },
          signal,
        );
        if (locationResponse && typeof locationResponse === "object" && "data" in locationResponse) {
          return {
            rows: (locationResponse.data as CompanyLocationBrand[]) || [],
            total: (locationResponse.data as CompanyLocationBrand[])?.length || 0,
          };
        }
        return { rows: [], total: 0 };

      case 'company':
        // TODO: Implement company-specific brand fetching
        return { rows: [], total: 0 };

      default:
        return { rows: [], total: 0 };
    }
  };
};

const UnifiedBrandList: React.FC<UnifiedBrandListProps> = ({
  config,
  companyId,
  locationId,
  brandId,
  userId,
}) => {
  const navigate = useNavigate();

  // Get columns - unified for all modes
  const columns = useMemo(() => {
    return createUnifiedBrandColumns(companyId, locationId);
  }, [companyId, locationId]);

  // Get fetcher based on mode
  const fetcher = useMemo(() => {
    return createBrandFetcher(config, companyId, locationId, userId);
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

  // Render filters based on mode
  const renderFilters = () => {
    if (!config.showFilters) {
      return null;
    }

    return (
      <>
        {config.mode === 'global' && (
          <>
            <CompanyFilter />
            <LocationFilter />
          </>
        )}
        <StatusFilter module="brand" />
      </>
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

  // Render card for grid view - handle both Brand and CompanyLocationBrand types
  const renderBrandCard = (brand: Brand | CompanyLocationBrand) => {
    // Convert CompanyLocationBrand to Brand-like format for BrandCard
    const brandForCard: Brand = {
      ...brand,
      _id: brand._id,
      name: brand.name,
      slug: brand.slug,
      aboutTheBrand: (brand as CompanyLocationBrand).aboutTheBrand || "",
      logoImage: typeof brand.logoImage === 'string' 
        ? { _id: '', url: brand.logoImage }
        : brand.logoImage,
      isActive: (brand as CompanyLocationBrand).isActive ?? true,
      associatedProductsCount: (brand as CompanyLocationBrand).totalSKU || 0,
      associatedUsers: 0,
      createdAt: brand.createdAt,
    };
    return <BrandCard brand={brandForCard} />;
  };

  return (
    <PageContent
      header={{
        title: config.title,
        description: config.description,
        actions: renderAddButton(),
      }}
    >
      <DataView<Brand | CompanyLocationBrand>
        fetcher={fetcher}
        columns={columns}
        renderCard={renderBrandCard}
        gridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
        filters={renderFilters()}
        defaultViewMode="table"
        defaultPageSize={DEFAULT_PAGE_SIZE}
        enableUrlSync={false}
        queryKeyPrefix={getQueryKeyPrefix()}
        searchPlaceholder="Search brands..."
      />
    </PageContent>
  );
};

export default UnifiedBrandList;
