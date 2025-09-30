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
import { StatCard } from "@/core/components/ui/stat";
import { PageContent } from "@/core/components/ui/structure";
import { formatCurrency, formatDate, formatNumber } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { Product } from "@/modules/panel/types/product.type";
import type { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { apiGetProducts } from "@/modules/panel/services/http/product.service";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
import { LocationFilter } from "@/modules/panel/features/listing/components/LocationFilter";

// Initial stats data
const initialStatsData = [
  {
    title: "Total Products",
    value: 0, // Will be updated from API
    barColor: "bg-primary",
    icon: true,
  },
  {
    title: "Published Products",
    value: 0, // Will be updated from API
    barColor: "bg-blue-300",
    icon: false,
  },
  {
    title: "Draft Products",
    value: 0, // Will be updated from API
    barColor: "bg-violet-300",
    icon: false,
  },
  {
    title: "Total Variants",
    value: 0, // Will be updated from API
    barColor: "bg-red-300",
    icon: true,
  },
];

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "productName",
    header: "Product",
    size: 300,
    cell: ({ row, getValue }) => (
      <ul className="flex min-w-40 items-center gap-2">
        <AvatarRoot className="size-10 rounded-md border">
          <AvatarImage
            className="object-cover"
            src={
              typeof row.original.thumbnail === "string"
                ? row.original.thumbnail
                : typeof row.original.thumbnail === "object" &&
                    row.original.thumbnail &&
                    "url" in row.original.thumbnail
                  ? (row.original.thumbnail as { url: string }).url
                  : ""
            }
            alt={`${row.original.productName} thumbnail`}
          />
          <AvatarFallback className="rounded-md capitalize">
            {(getValue() as string)?.charAt(0)}
          </AvatarFallback>
        </AvatarRoot>
        <div className="font-medium">{getValue() as string}</div>
      </ul>
    ),
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ getValue }) => {
      const brand = getValue();
      // Handle both string and object cases
      const brandName =
        typeof brand === "string"
          ? brand
          : typeof brand === "object" && brand && "name" in brand
            ? (brand as { name: string }).name
            : "Unknown";
      return <div className="">{brandName}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return <StatusBadge module="product" status={status} variant="badge" />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priceRange",
    header: "Price Range",
    cell: ({ row, getValue }) => {
      const priceRangeValue = getValue();
      const priceRange =
        typeof priceRangeValue === "object" &&
        priceRangeValue &&
        "min" in priceRangeValue &&
        "max" in priceRangeValue
          ? (priceRangeValue as { min: number; max: number })
          : { min: 0, max: 0 };

      const salePriceRangeValue = row.original.salePriceRange;
      const salePriceRange =
        typeof salePriceRangeValue === "object" &&
        salePriceRangeValue &&
        "min" in salePriceRangeValue &&
        "max" in salePriceRangeValue
          ? (salePriceRangeValue as { min: number; max: number })
          : { min: 0, max: 0 };

      return (
        <div className="flex w-max flex-col">
          <span className="font-medium">
            {formatCurrency(priceRange.min, { useAbbreviation: true })} -{" "}
            {formatCurrency(priceRange.max, { useAbbreviation: true })}
          </span>
          {salePriceRange &&
            (salePriceRange.min > 0 || salePriceRange.max > 0) && (
              <span className="text-xs text-green-600">
                Sale:{" "}
                {formatCurrency(salePriceRange.min, { useAbbreviation: true })}{" "}
                -{" "}
                {formatCurrency(salePriceRange.max, { useAbbreviation: true })}
              </span>
            )}
        </div>
      );
    },
  },
  {
    accessorKey: "capturedDate",
    header: "Created At",
    cell: ({ getValue }) => {
      const capturedDate = getValue() as string;
      return <div>{formatDate(capturedDate)}</div>;
    },
  },
  {
    header: "Action",
    accessorKey: "actions",
    enableSorting: false,
    enableHiding: false,
    size: 100,
    cell: ({ row }) => {
      return (
        <TableAction
          view={{
            to:
              PANEL_ROUTES.LISTING.CREATE + `?mode=view&id=${row.original._id}`,
            title: "View product details",
          }}
          edit={{
            to:
              PANEL_ROUTES.LISTING.CREATE + `?mode=edit&id=${row.original._id}`,
            title: "Edit product",
          }}
        />
      );
    },
  },
];

// Create fetcher for server-side data with seller's company ID
const createSellerProductFetcher = (companyId: string, locationId?: string) => {
  return createSimpleFetcher(
    (params: Record<string, unknown>) => {
      // Always filter by seller's company ID
      const filterParams = {
        ...params,
        companyId, // Always include seller's company ID
        ...(locationId && locationId !== "all" && { locationId }),
      };
      return apiGetProducts(filterParams);
    },
    {
      dataPath: "data.products",
      totalPath: "data.totalRecords",
      filterMapping: {
        status: "status",
        category: "category",
        brand: "brand",
        tag: "tag",
        locationId: "locationId",
      },
    }
  );
};

const SellerProductList = () => {
  const { sellerInfo, isLoading: sellerInfoLoading } = useSellerAuth();
  const [stats, setStats] = useState(initialStatsData);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");

  // Fetch stats separately since we need them for the summary cards
  const fetchStats = useCallback(async () => {
    if (!sellerInfo?.companyId) return;
    
    try {
      const response = await apiGetProducts({ 
        page: 1, 
        limit: 1000,
        companyId: sellerInfo.companyId 
      });

      if (response.success) {
        const publishedProducts = response.data.products.filter(
          (p) => p.status === "publish",
        ).length;
        const draftProducts = response.data.products.filter(
          (p) => p.status === "draft",
        ).length;
        const totalVariants = response.data.products.reduce(
          (sum, product) => sum + (product.variants?.length || 0),
          0,
        );

        setStats([
          {
            title: "Total Products",
            value: response.data.totalRecords,
            barColor: "bg-primary",
            icon: true,
          },
          {
            title: "Published Products",
            value: publishedProducts,
            barColor: "bg-blue-300",
            icon: false,
          },
          {
            title: "Draft Products",
            value: draftProducts,
            barColor: "bg-violet-300",
            icon: false,
          },
          {
            title: "Total Variants",
            value: totalVariants,
            barColor: "bg-red-300",
            icon: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch product stats:", error);
    }
  }, [sellerInfo?.companyId]);

  useEffect(() => {
    if (sellerInfo?.companyId) {
      fetchStats();
    }
  }, [fetchStats, sellerInfo?.companyId]);

  // Handle location filter change
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId === "all" ? "" : locationId);
  };

  if (sellerInfoLoading) {
    return (
      <PageContent
        header={{
          title: "Products",
          description: "Loading your company's products...",
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
          title: "Products",
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
        title: "Products",
        description: `Products for ${sellerInfo.companyName}`,
        actions: (
          <Button color={"primary"} asChild>
            <NavLink to={PANEL_ROUTES.LISTING.CREATE}>Add Product</NavLink>
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
        fetcher={createSellerProductFetcher(
          sellerInfo.companyId,
          selectedLocationId === "all" ? undefined : selectedLocationId
        )}
        queryKeyPrefix={`seller-products-${sellerInfo.companyId}-${selectedLocationId}`}
        actionProps={(tableState) => ({
          children: (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Location:</span>
                <LocationFilter
                  companyId={sellerInfo.companyId}
                  value={selectedLocationId}
                  onValueChange={handleLocationChange}
                  placeholder="All Locations"
                />
              </div>
              <StatusFilter
                tableState={tableState}
                module="product"
                multi={false} // Single selection mode
              />
            </div>
          ),
        })}
      />
    </PageContent>
  );
};

export default SellerProductList;
