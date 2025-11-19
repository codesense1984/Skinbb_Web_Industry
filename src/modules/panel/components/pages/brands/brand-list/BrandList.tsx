import { DataView } from "@/core/components/data-view";
import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
} from "@/core/components/ui/avatar";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  type DropdownMenuItemType,
} from "@/core/components/ui/dropdown-menu";
import { STATUS_MAP } from "@/core/config/status";
import { formatDate } from "@/core/utils";
import {
  CompanyFilter,
  DEFAULT_PAGE_SIZE,
  LocationFilter,
} from "@/modules/panel/components/data-view";
import { BrandCard } from "@/modules/panel/features/brands/brand-list/BrandCard";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type {
  Brand,
  CompanyLocationBrand,
} from "@/modules/panel/types/brand.type";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";
import type { ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
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
}) => {
  const fetcher = useBrandListFetcher({ companyId, locationId, userId });

  // Create columns based on context
  const columns = useMemo(() => {
    return createBrandColumns(companyId, locationId);
  }, [companyId, locationId]);

  // Get query key prefix for React Query
  const queryKeyPrefix = useMemo(() => {
    if (companyId && locationId) {
      return `company-${companyId}-location-${locationId}-brands`;
    }
    if (companyId) {
      return `company-${companyId}-brands`;
    }
    return "brands";
  }, [companyId, locationId]);

  // Handle add button click

  // Render filters based on props
  const renderFilters = () => {
    const filters: React.ReactNode[] = [];

    if (showCompanyFilter) {
      filters.push(<CompanyFilter key="company" />);
    }

    if (showLocationFilter) {
      filters.push(
        <LocationFilter key="location" selectedCompanyId={companyId} />,
      );
    }

    if (showStatusFilter) {
      filters.push(<StatusFilter key="status" />);
    }

    return filters.length > 0 ? filters : null;
  };

  // Render card for grid view
  const renderBrandCard = (brand: Brand | CompanyLocationBrand) => {
    // Convert CompanyLocationBrand to Brand-like format for BrandCard
    const brandForCard: Brand = {
      ...brand,
      _id: brand._id,
      name: brand.name,
      slug: brand.slug,
      aboutTheBrand: (brand as CompanyLocationBrand).aboutTheBrand || "",
      logoImage:
        typeof brand.logoImage === "string"
          ? { _id: "", url: brand.logoImage }
          : brand.logoImage,
      isActive: (brand as CompanyLocationBrand).isActive ?? true,
      associatedProductsCount: (brand as CompanyLocationBrand).totalSKU || 0,
      associatedUsers: 0,
      createdAt: brand.createdAt,
    };
    return <BrandCard brand={brandForCard} />;
  };

  return (
    <DataView<Brand>
      fetcher={fetcher}
      columns={columns}
      renderCard={renderBrandCard}
      gridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
      filters={renderFilters()}
      defaultViewMode={defaultViewMode}
      defaultPageSize={defaultPageSize}
      enableUrlSync={false}
      queryKeyPrefix={queryKeyPrefix}
      searchPlaceholder={searchPlaceholder}
    />
  );
};

// Create unified brand columns
const createBrandColumns = (
  companyId?: string,
  locationId?: string,
): ColumnDef<Brand>[] => [
  {
    accessorKey: "name",
    header: "Brand",
    cell: ({ row, getValue }) => (
      <ul className="flex min-w-40 items-center gap-2">
        <AvatarRoot className="size-10 rounded-md border">
          <AvatarImage
            className="object-contain"
            src={row.original.logoImage?.url ?? ""}
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
      const status =
        row.original.status || (row.original.isActive ? "active" : "inactive");
      const statusChangeReason = row.original.statusChangeReason;

      return (
        <div className="space-y-1">
          <StatusBadge module="brand" status={status} variant="badge">
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
      const status =
        row.original.status || (row.original.isActive ? "active" : "inactive");
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
      const status =
        row.original.status || (row.original.isActive ? "active" : "inactive");

      const items: DropdownMenuItemType[] = [
        {
          type: "link",
          to:
            companyId && locationId
              ? PANEL_ROUTES.COMPANY_LOCATION.BRAND_VIEW(
                  companyId,
                  locationId,
                  brandId,
                )
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
      if (
        companyId &&
        locationId &&
        ![
          STATUS_MAP.brand.pending.value,
          STATUS_MAP.brand.rejected.value,
        ].includes(status)
      ) {
        items.push({
          type: "link",
          to: PANEL_ROUTES.COMPANY_LOCATION.BRAND_PRODUCTS(
            companyId,
            locationId,
            brandId,
          ),
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
        to:
          companyId && locationId
            ? PANEL_ROUTES.COMPANY_LOCATION.BRAND_EDIT(
                companyId,
                locationId,
                brandId,
              )
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
