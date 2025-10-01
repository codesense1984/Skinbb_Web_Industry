import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { TableAction } from "@/core/components/data-table/components/table-action";
import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
} from "@/core/components/ui/avatar";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";
import {
  apiGetCompanyList,
  apiGetCompanyLocations,
} from "@/modules/panel/services/http/company.service";
import type { Brand } from "@/modules/panel/types/brand.type";
import type {
  CompanyAddressInfo,
  CompanyListItem,
} from "@/modules/panel/types/company.type";
import type { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router";
import { useUrlFilters } from "@/core/hooks/use-url-filters";
import { FilterDropdown } from "@/core/components/filters/FilterDropdown";
import { useCallback, useEffect, useRef, useMemo } from "react";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

// Legacy static data - commented out
// const statsData = [
//   {
//     title: "Listed brands",
//     value: 380,
//     barColor: "bg-primary",
//     icon: true,
//   },
//   {
//     title: "Inactive Brands",
//     value: 350,
//     barColor: "bg-blue-300",
//     icon: false,
//   },
//   {
//     title: "Total Surveys",
//     value: 550,
//     barColor: "bg-violet-300",
//     icon: false,
//   },
//   {
//     title: "Total Products",
//     value: 860,
//     barColor: "bg-red-300",
//     icon: true,
//   },
// ];

// export const brandData: Brand[] = [
//   {
//     id: 1,
//     name: "The Derma",
//     category: "Sensitive Skin",
//     image: "https://images.thedermaco.com/TheDermaCoLogo2-min.png",
//     status: "active",
//     products: 50,
//     surveys: 50,
//     promotions: 50,
//     earnings: 125500,
//   },
//   // ... other static data
// ];

const columns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: "Brand",
    cell: ({ row, getValue }) => (
      <ul className="flex min-w-40 items-center gap-2">
        <AvatarRoot className="size-10 rounded-md border">
          <AvatarImage
            className="object-contain"
            src={row.original.logoImage?.url}
            alt={`${row.original.name} logo`}
          />
          <AvatarFallback className="rounded-md capitalize">
            {(getValue() as string)?.charAt(0)}
          </AvatarFallback>
        </AvatarRoot>
        <div className="flex flex-col">
          <span className="font-medium">{getValue() as string}</span>
          <span className="text-muted-foreground text-sm">
            {row.original.slug}
          </span>
        </div>
      </ul>
    ),
  },
  // {
  //   accessorKey: "aboutTheBrand",
  //   header: "Description",
  //   cell: ({ getValue }) => {
  //     const description = getValue() as string;
  //     const cleanDescription = description.replace(/<[^>]*>/g, ""); // Remove HTML tags
  //     return (
  //       <div className="w-max max-w-xs truncate" title={cleanDescription}>
  //         {cleanDescription || "No description"}
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ getValue }) => {
      const isActive = getValue() as boolean;
      return (
        <StatusBadge
          module="brand"
          status={isActive ? "active" : "inactive"}
          variant="badge"
        />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  // {
  //   accessorKey: "associatedProductsCount",
  //   header: "Products",
  //   cell: ({ getValue }) => {
  //     const count = getValue() as number;
  //     return <div className="w-max font-medium">{count}</div>;
  //   },
  // },
  // {
  //   accessorKey: "associatedUsers",
  //   header: "Users",
  //   cell: ({ getValue }) => {
  //     const count = getValue() as number;
  //     return <div className="w-max font-medium">{count}</div>;
  //   },
  // },
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
    size: 50,
    cell: ({ row }) => {
      return (
        <TableAction
          view={{
            to: PANEL_ROUTES.BRAND.VIEW(row.original._id),
            title: "View brand details",
          }}
          edit={{
            to: PANEL_ROUTES.BRAND.EDIT(row.original._id),
            title: "Edit brand",
          }}
        />
      );
    },
  },
];

// Create fetcher for server-side data
const createBrandFetcher = () => {
  return createSimpleFetcher(
    (params: Record<string, unknown>) => {
      return apiGetBrands(params);
    },
    {
      dataPath: "data.brands",
      totalPath: "data.totalRecords",
      filterMapping: {
        isActive: "isActive",
        status: "status", // Map the status column filter to the status API parameter
        companyId: "companyId",
        locationId: "locationId",
      },
    },
  );
};

const BrandList = () => {
  // Simple URL-based filter management
  const { filters, updateFilter, updateFilters } = useUrlFilters([
    "companyId",
    "locationId",
  ]);
  const tableRef = useRef<any>(null);

  // Memoize API functions to prevent recreation
  const companyApi = useMemo(
    () =>
      createSimpleFetcher((params) => apiGetCompanyList(params), {
        dataPath: "data.items",
        totalPath: "data.total",
      }),
    [],
  );

  const locationApi = useMemo(
    () =>
      createSimpleFetcher(
        (params) => {
          // Return empty result if no company selected
          if (!filters.companyId) {
            return Promise.resolve({ rows: [], total: 0 });
          }
          return apiGetCompanyLocations(filters.companyId, params);
        },
        { dataPath: "data.items", totalPath: "data.totalPages" },
      ),
    [filters.companyId],
  );

  // Handle company change - clear location when company changes
  const handleCompanyChange = useCallback(
    (companyId: string) => {
      // Use batch update to ensure both filters are updated together
      updateFilters({
        companyId: companyId,
        locationId: "", // Always clear location when company changes
      });
    },
    [updateFilters, filters.locationId],
  );

  // Handle location change
  const handleLocationChange = useCallback(
    (locationId: string) => {
      // Only update location, don't touch company
      updateFilter("locationId", locationId);
    },
    [updateFilter, filters.companyId],
  );

  // Sync table filters with URL state - debounced
  useEffect(() => {
    if (tableRef.current) {
      const timeoutId = setTimeout(() => {
        const tableFilters = [];
        if (filters.companyId) {
          tableFilters.push({ id: "companyId", value: filters.companyId });
        }
        if (filters.locationId) {
          tableFilters.push({ id: "locationId", value: filters.locationId });
        }
        console.log("Setting table filters:", tableFilters);
        tableRef.current.table.setColumnFilters(tableFilters);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [filters.companyId, filters.locationId]);

  return (
    <PageContent
      header={{
        title: "Brands",
        description: "Discover top brands from around the world.",
        actions: (
          <Button color={"primary"} asChild>
            <NavLink to={PANEL_ROUTES.BRAND.CREATE}>Add Brand</NavLink>
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
        fetcher={createBrandFetcher()}
        queryKeyPrefix={`${PANEL_ROUTES.BRAND.LIST}`}
        initialColumnFilters={[
          ...(filters.companyId
            ? [{ id: "companyId", value: filters.companyId }]
            : []),
          ...(filters.locationId
            ? [{ id: "locationId", value: filters.locationId }]
            : []),
        ]}
        actionProps={(tableState) => {
          // Store table reference for filter updates
          tableRef.current = tableState;

          return {
            children: (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="hidden text-sm font-medium md:block">
                    Company:
                  </span>
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
                    enabled={true}
                    componentEnabled={true}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden text-sm font-medium md:block">
                    Location:
                  </span>
                  <FilterDropdown<CompanyAddressInfo>
                    key={`location-${filters.companyId}`}
                    apiFunction={locationApi}
                    transform={(val) => ({
                      value: val._id ?? val.addressId ?? "",
                      label: `${val.city}, ${val.state}`,
                    })}
                    value={filters.locationId || ""}
                    onChange={handleLocationChange}
                    placeholder={"Filter by location..."}
                    disabled={!filters.companyId}
                    enabled={!!filters.companyId}
                    componentEnabled={!!filters.companyId}
                    queryKey={[ENDPOINTS.COMPANY.LOCATION(filters.companyId)]}
                  />
                </div>
              </div>
            ),
          };
        }}
      />
    </PageContent>
  );
};

export default BrandList;
