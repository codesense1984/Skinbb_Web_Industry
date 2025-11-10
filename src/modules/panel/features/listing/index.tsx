import { createSimpleFetcher } from "@/core/components/data-table";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { STATUS_MAP } from "@/core/config/status";
import {
  FilterDataItem,
  FilterProvider,
  type FilterOption,
} from "@/core/components/dynamic-filter";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  apiGetProducts,
  type ApiParams,
} from "@/modules/panel/services/http/product.service";
import React from "react";
import { NavLink, useParams, useSearchParams } from "react-router";
import { apiGetBrands } from "../../services/http/brand.service";
import { apiGetCompaniesForFilter } from "../../services/http/company.service";
import type { Brand, Company } from "../../types";
import type { Product } from "../../types/product.type";
import { columns } from "./data";
import { FilterBadges } from "@/core/components/dynamic-filter/filter-badges";
import { DataView, type ServerDataFetcher } from "@/core/components/data-view";
import { ProductCard } from "./ProductCard";

// Create fetcher for DataView component
const fetchProduct: ServerDataFetcher<Product> = async ({
  pageIndex,
  pageSize,
  sorting,
  globalFilter,
  filters,
  signal,
}) => {
  // Build API parameters
  const params: ApiParams = {
    page: pageIndex + 1, // API uses 1-based pagination
    limit: pageSize,
  };

  // Add search
  if (globalFilter) {
    params.search = globalFilter;
  }

  // Add sorting
  if (sorting.length > 0) {
    params.sortBy = sorting[0].id;
    params.order = sorting[0].desc ? "desc" : "asc";
  }

  // Map filters from FilterProvider to API params
  if (filters.status?.[0]?.value) {
    params.status = filters.status[0].value;
  }
  if (filters.company?.[0]?.value) {
    params.companyId = filters.company[0].value;
  }
  if (filters.brand?.[0]?.value) {
    params.brandId = filters.brand[0].value;
  }
  if (filters.location?.[0]?.value) {
    params.locationId = filters.location[0].value;
  }

  // Note: apiGetProducts doesn't accept signal directly, but we can pass it if needed
  const response = await apiGetProducts(params, signal);

  // Type assertion for API response
  if (response && typeof response === "object" && "data" in response) {
    const responseData = response.data as {
      products?: Product[];
      totalRecords?: number;
    };
    return {
      rows: responseData?.products || [],
      total: responseData?.totalRecords || 0,
    };
  }

  return {
    rows: [],
    total: 0,
  };
};
const companyFilter = createSimpleFetcher(apiGetCompaniesForFilter, {
  dataPath: "data.items",
  totalPath: "data.total",
});

const createBrandFilter = (companyId?: string) => {
  return createSimpleFetcher(
    (params: Record<string, unknown>) => {
      const filterParams = {
        ...params,
        ...(companyId && { companyId }),
      };
      return apiGetBrands(filterParams);
    },
    {
      dataPath: "data.brands",
      totalPath: "data.totalRecords",
    },
  );
};

const ProductList = () => {
  const [filterValue, setFilterValue] = React.useState<
    Record<"status" | "company" | "brand" | "location", FilterOption[]>
  >({
    status: [],
    company: [],
    brand: [],
    location: [],
  });

  const { companyId, locationId, brandId } = useParams();
  const [searchParams] = useSearchParams();

  // Get selected filter values for dynamic brand filter
  const selectedCompanyId = filterValue.company?.[0]?.value;

  // Auto-fill from URL parameters on mount
  React.useEffect(() => {
    const urlCompanyId = companyId || searchParams.get("companyId");
    const urlLocationId = locationId || searchParams.get("locationId");
    const urlBrandId = brandId || searchParams.get("brandId");

    if (urlCompanyId || urlLocationId || urlBrandId) {
      setFilterValue((prev) => ({
        ...prev,
        company: urlCompanyId
          ? [{ label: "Company", value: urlCompanyId }]
          : prev.company,
        location: urlLocationId
          ? [{ label: "Location", value: urlLocationId }]
          : prev.location,
        brand: urlBrandId
          ? [{ label: "Brand", value: urlBrandId }]
          : prev.brand,
      }));
    }
  }, [companyId, locationId, brandId, searchParams]);

  // const [stats, setStats] = useState(initialStatsData);

  // // Fetch stats separately since we need them for the summary cards
  // const fetchStats = useCallback(async () => {
  //   try {
  //     const response = await apiGetProducts({ page: 1, limit: 1000 }); // Get all for stats

  //     if (response?.success) {
  //       const publishedProducts = response?.data?.products.filter(
  //         (p) => p.status === "publish",
  //       ).length;
  //       const draftProducts = response?.data?.products.filter(
  //         (p) => p.status === "draft",
  //       ).length;
  //       const totalVariants = response?.data?.products.reduce(
  //         (sum, product) => sum + (product.variants?.length || 0),
  //         0,
  //       );

  //       setStats([
  //         {
  //           title: "Total Products",
  //           value: response?.data?.totalRecords,
  //           barColor: "bg-primary",
  //           icon: true,
  //         },
  //         {
  //           title: "Published Products",
  //           value: publishedProducts,
  //           barColor: "bg-blue-300",
  //           icon: false,
  //         },
  //         {
  //           title: "Draft Products",
  //           value: draftProducts || 0,
  //           barColor: "bg-violet-300",
  //           icon: false,
  //         },
  //         {
  //           title: "Total Variants",
  //           value: totalVariants,
  //           barColor: "bg-red-300",
  //           icon: true,
  //         },
  //       ]);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch product stats:", error);
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchStats();
  // }, [fetchStats]);

  return (
    <PageContent
      header={{
        title: "Product Listing",
        description:
          "Manage your product catalog, pricing, descriptions and media assets.",
        actions: (
          <Button color={"primary"} asChild>
            <NavLink to={PANEL_ROUTES.LISTING.CREATE}>Add Product</NavLink>
          </Button>
        ),
      }}
    >
      <FilterProvider
        onChange={(v) => {
          setFilterValue((prev) => ({
            status: v.status ?? prev.status ?? [],
            company: v.company ?? prev.company ?? [],
            brand: v.brand ?? prev.brand ?? [],
            location: v.location ?? prev.location ?? [],
          }));
        }}
      >
        <FilterBadges filters={filterValue} setFilterValue={setFilterValue} />

        <DataView<Product>
          fetcher={fetchProduct}
          columns={columns}
          renderCard={(product) => <ProductCard product={product} />}
          filters={
            <>
              <FilterDataItem
                dataKey="status"
                type="dropdown"
                mode="single"
                options={Object.values(STATUS_MAP.product)}
                placeholder="Select status..."
              />
              <FilterDataItem<"pagination", undefined, Company>
                dataKey="company"
                type="pagination"
                mode="single"
                placeholder="Select company..."
                elementProps={{
                  apiFunction: companyFilter,
                  transform: (item) => {
                    return {
                      label: item.companyName,
                      value: item._id ?? "",
                    };
                  },
                  queryKey: ["company-list-filter"],
                  pageSize: 10,
                }}
              />
              <FilterDataItem<"pagination", undefined, Brand>
                dataKey="brand"
                type="pagination"
                mode="single"
                placeholder="Select brand..."
                elementProps={{
                  apiFunction: createBrandFilter(
                    selectedCompanyId && selectedCompanyId !== "all"
                      ? selectedCompanyId
                      : undefined,
                  ),
                  transform: (item) => {
                    return {
                      label: item.name,
                      value: item._id ?? "",
                    };
                  },
                  queryKey: ["company-brand-filter", selectedCompanyId],
                  pageSize: 10,
                }}
              />
            </>
          }
          defaultViewMode="table"
          defaultPageSize={10}
          enableUrlSync={false}
          queryKeyPrefix={PANEL_ROUTES.LISTING.LIST}
          searchPlaceholder="Search products..."
        />
      </FilterProvider>
    </PageContent>
  );
};

export default ProductList;
