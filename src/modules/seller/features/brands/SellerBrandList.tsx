import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import { TableAction } from "@/core/components/data-table/components/table-action";
import {
  AvatarRoot,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { formatDate } from "@/core/utils";
import { SELLER_ROUTES } from "@/modules/seller/routes/constant";
import type { Brand } from "@/modules/panel/types/brand.type";
import type { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router";
import { useState } from "react";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
import { LocationFilter } from "@/modules/panel/features/brands/components/LocationFilter";

const columns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: "Brand",
    cell: ({ row, getValue }) => (
      <ul className="flex min-w-40 items-center gap-2">
        <AvatarRoot className="size-10 rounded-md border">
          <AvatarImage
            src={row.original.logoImage?.url}
            alt={getValue() as string}
            className="size-10 rounded-md object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary size-10 rounded-md">
            {(getValue() as string)?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </AvatarRoot>
        <li className="flex flex-col">
          <span className="font-medium">{getValue() as string}</span>
          <span className="text-muted-foreground text-xs">
            {row.original.aboutTheBrand
              ? row.original.aboutTheBrand.substring(0, 50) + "..."
              : "N/A"}
          </span>
        </li>
      </ul>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ getValue }) => {
      const isActive = getValue() as boolean;
      return (
        <StatusBadge
          module="brand"
          status={isActive ? "active" : "inactive"}
          variant={isActive ? "contained" : "badge"}
          className="w-max"
        />
      );
    },
  },
  {
    accessorKey: "associatedProductsCount",
    header: "Products",
    cell: ({ getValue }) => {
      const count = getValue() as number;

      return <div className="w-max font-medium">{count}</div>;
    },
  },
  {
    accessorKey: "associatedUsers",
    header: "Users",
    cell: ({ getValue }) => {
      const count = getValue() as number;
      return <div className="w-max font-medium">{count}</div>;
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
    cell: ({ row }) => {
      return (
        <TableAction
          view={{
            to: SELLER_ROUTES.SELLER_BRANDS.VIEW(row.original._id),
            title: "View brand details",
          }}
          edit={{
            to: SELLER_ROUTES.SELLER_BRANDS.EDIT(row.original._id),
            title: "Edit brand",
          }}
        />
      );
    },
  },
];

// Create fetcher for server-side data with seller's company ID
const createSellerBrandFetcher = (companyId: string, locationId?: string) => {
  return createSimpleFetcher(
    (params: Record<string, unknown>) => {
      // Always filter by seller's company ID
      const filterParams = {
        ...params,
        companyId, // Always include seller's company ID
        ...(locationId && locationId !== "all" && { locationId }),
      };
      return apiGetBrands(filterParams);
    },
    {
      dataPath: "data.brands",
      totalPath: "data.totalRecords",
      filterMapping: {
        isActive: "isActive",
        status: "status",
        locationId: "locationId",
      },
    },
  );
};

const SellerBrandList = () => {
  const { sellerInfo, isLoading: sellerInfoLoading } = useSellerAuth();
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");

  // Handle location filter change
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId === "all" ? "" : locationId);
  };

  if (sellerInfoLoading) {
    return (
      <PageContent
        header={{
          title: "Brands",
          description: "Loading your company's brands...",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </PageContent>
    );
  }

  if (!sellerInfo?.companyId) {
    return (
      <PageContent
        header={{
          title: "Brands",
          description: "Unable to load company information.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">
            Company information not available. Please contact support.
          </p>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: "Brands",
        description: `Brands for ${sellerInfo.companyName}`,
        actions: (
          <Button color={"primary"} asChild>
            <NavLink to={SELLER_ROUTES.SELLER_BRANDS.CREATE}>Add Brand</NavLink>
          </Button>
        ),
      }}
    >
      {/* Stats tiles commented out as requested */}
      {/* <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={formatNumber(item.value)}
            barColor={item.barColor}
          />
        ))}
      </section> */}

      <DataTable
        columns={columns}
        isServerSide
        fetcher={createSellerBrandFetcher(
          sellerInfo.companyId,
          selectedLocationId === "all" ? undefined : selectedLocationId,
        )}
        queryKeyPrefix={`seller-brands-${sellerInfo.companyId}-${selectedLocationId}`}
        actionProps={(tableState) => ({
          children: (
            <div className="flex items-center gap-4">
              {sellerInfo.addresses.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Location:</span>
                  <LocationFilter
                    companyId={sellerInfo.companyId}
                    value={selectedLocationId}
                    onValueChange={handleLocationChange}
                    placeholder="All Locations"
                  />
                </div>
              )}
              <StatusFilter
                tableState={tableState}
                module="brand"
                multi={false} // Single selection mode
              />
            </div>
          ),
        })}
      />
    </PageContent>
  );
};

export default SellerBrandList;
