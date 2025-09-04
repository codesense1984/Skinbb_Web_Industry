import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import { TableAction } from "@/core/components/data-table/components/table-action";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { StatCard } from "@/core/components/ui/stat";
import { PageContent } from "@/core/components/ui/structure";
import { formatNumber, formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { Brand } from "@/modules/panel/types/brand.type";
import type { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";

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

// New dynamic stats data
const initialStatsData = [
  {
    title: "Total Brands",
    value: 0, // Will be updated from API
    barColor: "bg-primary",
    icon: true,
  },
  {
    title: "Active Brands",
    value: 0, // Will be updated from API
    barColor: "bg-blue-300",
    icon: false,
  },
  {
    title: "Total Products",
    value: 0, // Will be updated from API
    barColor: "bg-violet-300",
    icon: false,
  },
  {
    title: "Associated Users",
    value: 0, // Will be updated from API
    barColor: "bg-red-300",
    icon: true,
  },
];

const columns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: "Brand",
    cell: ({ row, getValue }) => (
      <ul className="flex min-w-40 items-center gap-2">
        <Avatar className="size-10 rounded-md border">
          <AvatarImage
            className="object-contain"
            src={row.original.logoImage?.url}
            alt={`${row.original.name} logo`}
          />
          <AvatarFallback className="rounded-md capitalize">
            {(getValue() as string)?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{getValue() as string}</span>
          <span className="text-sm text-muted-foreground">{row.original.slug}</span>
        </div>
      </ul>
    ),
  },
  {
    accessorKey: "aboutTheBrand",
    header: "Description",
    cell: ({ getValue }) => {
      const description = getValue() as string;
      const cleanDescription = description.replace(/<[^>]*>/g, ''); // Remove HTML tags
      return (
        <div className="w-max max-w-xs truncate" title={cleanDescription}>
          {cleanDescription || 'No description'}
        </div>
      );
    },
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
          variant="badge"
        />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
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
            to: PANEL_ROUTES.BRAND.EDIT(row.original._id),
            tooltip: "View brand details",
          }}
          edit={{
            to: PANEL_ROUTES.BRAND.EDIT(row.original._id),
            tooltip: "Edit brand",
          }}
        />
      );
    },
  },
];

// Create fetcher for server-side data
const fetcher = () =>
  createSimpleFetcher(apiGetBrands, {
    dataPath: "data.brands",
    totalPath: "data.totalRecords",
    filterMapping: {
      isActive: "isActive",
      status: "status", // Map the status column filter to the status API parameter
    },
  });

const BrandList = () => {
  const [stats, setStats] = useState(initialStatsData);

  // Fetch stats separately since we need them for the summary cards
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiGetBrands({ page: 1, limit: 1000 }); // Get all for stats
      
      if (response.success) {
        const totalProducts = response.data.brands.reduce((sum, brand) => sum + brand.associatedProductsCount, 0);
        const totalUsers = response.data.brands.reduce((sum, brand) => sum + brand.associatedUsers, 0);
        const activeBrands = response.data.brands.filter(brand => brand.isActive).length;
        
        setStats([
          {
            title: "Total Brands",
            value: response.data.totalRecords,
            barColor: "bg-primary",
            icon: true,
          },
          {
            title: "Active Brands",
            value: activeBrands,
            barColor: "bg-blue-300",
            icon: false,
          },
          {
            title: "Total Products",
            value: totalProducts,
            barColor: "bg-violet-300",
            icon: false,
          },
          {
            title: "Associated Users",
            value: totalUsers,
            barColor: "bg-red-300",
            icon: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch brand stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={formatNumber(item.value)}
            barColor={item.barColor}
          />
        ))}
      </section>

      <DataTable
        columns={columns}
        isServerSide
        fetcher={fetcher()}
        queryKeyPrefix={PANEL_ROUTES.BRAND.LIST}
        actionProps={(tableState) => ({
          children: (
            <StatusFilter
              tableState={tableState}
              module="brand"
              multi={false} // Single selection mode
            />
          ),
        })}
      />
    </PageContent>
  );
};

export default BrandList;
