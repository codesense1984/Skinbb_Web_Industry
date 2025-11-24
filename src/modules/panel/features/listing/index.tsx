import {
  DataView,
  useDataView,
  type ServerDataFetcher,
} from "@/core/components/data-view";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  apiGetProducts,
  apiPublishBulkProducts,
  type ApiParams,
} from "@/modules/panel/services/http/product.service";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import type { Product } from "../../types/product.type";
import { columns, initialStatsData } from "./data";
import { ProductCard } from "./ProductCard";
import {
  DEFAULT_PAGE_SIZE,
  StatusFilter,
  CompanyFilter,
  BrandFilter,
  LocationFilter,
} from "@/modules/panel/components/data-view";
import { StatCard } from "@/core/components/ui/stat";
import { formatNumber } from "@/core/utils";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";

// Constants
const GRID_CLASSES = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3";

// Product fetcher factory that accepts locked filters
const createProductFetcher = (lockedFilters?: {
  companyId?: string;
  locationId?: string;
  brandId?: string;
}): ServerDataFetcher<Product> => {
  return async ({
    pageIndex,
    pageSize,
    sorting,
    globalFilter,
    filters,
    signal,
  }) => {
    const params: ApiParams = {
      page: pageIndex + 1, // API uses 1-based pagination
      limit: pageSize,
    };

    if (globalFilter) {
      params.search = globalFilter;
    }

    if (sorting.length > 0) {
      params.sortBy = sorting[0].id;
      params.order = sorting[0].desc ? "desc" : "asc";
    }

    // Apply locked filters first (from URL params)
    if (lockedFilters?.companyId) {
      params.companyId = lockedFilters.companyId;
    }
    if (lockedFilters?.locationId) {
      params.locationId = lockedFilters.locationId;
    }
    if (lockedFilters?.brandId) {
      params.brandId = lockedFilters.brandId;
    }

    // Map user-selected filters to API params (only if not locked)
    if (filters.status?.[0]?.value) {
      params.status = filters.status[0].value;
    }
    if (filters.company?.[0]?.value && !lockedFilters?.companyId) {
      params.companyId = filters.company[0].value;
    }
    if (filters.brand?.[0]?.value && !lockedFilters?.brandId) {
      params.brandId = filters.brand[0].value;
    }
    if (filters.location?.[0]?.value && !lockedFilters?.locationId) {
      params.locationId = filters.location[0].value;
    }

    const response = await apiGetProducts(params, signal);

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

    return { rows: [], total: 0 };
  };
};

// Custom hook for URL parameter handling
const useUrlFilters = () => {
  const { companyId, locationId, brandId } = useParams();
  const [searchParams] = useSearchParams();

  // Track which filters are locked from URL
  const urlCompanyId = companyId || searchParams.get("companyId");
  const urlLocationId = locationId || searchParams.get("locationId");
  const urlBrandId = brandId || searchParams.get("brandId");

  // Don't set locked filters in the filter context - they won't show as badges
  // They'll be applied directly in the fetcher instead
  // Only set non-locked filters that the user might have selected

  return {
    filters: {}, // Empty - locked filters won't show as badges
    lockedFilters: {
      company: !!urlCompanyId,
      location: !!urlLocationId,
      brand: !!urlBrandId,
    },
    lockedFilterValues: {
      companyId: urlCompanyId || undefined,
      locationId: urlLocationId || undefined,
      brandId: urlBrandId || undefined,
    },
  };
};

// Publish button component
const PublishButton = () => {
  const { table, refetch } = useDataView<Product>();

  if (!table) {
    return null;
  }

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  if (selectedCount === 0) {
    return null;
  }

  // Filter only approved products
  const selectedProducts = selectedRows.map((row) => row.original);
  const approvedProducts = selectedProducts.filter(
    (product) => product.status === "approved",
  );
  const approvedCount = approvedProducts.length;

  // Show button only if there are approved products
  if (approvedCount === 0) {
    return null;
  }

  const handlePublish = useCallback(async () => {
    if (!table) return;

    const selectedRows = table.getSelectedRowModel().rows;
    const selectedProducts = selectedRows.map((row) => row.original);

    // Filter only approved products
    const approvedProducts = selectedProducts.filter(
      (product) => product.status === "approved",
    );

    if (approvedProducts.length === 0) {
      toast.error("Only approved products can be published");
      return;
    }

    const productIds = approvedProducts.map((p) => p._id);
    console.log("Selected approved products to publish:", approvedProducts);

    try {
      await apiPublishBulkProducts(productIds);

      toast.success(
        `Successfully published ${approvedProducts.length} product(s)`,
      );

      // Clear row selection
      table.resetRowSelection();

      // Refetch the table data
      await refetch();
    } catch (error: any) {
      console.error("Error publishing products:", error);
      toast.error(
        error?.response?.data?.message || "Failed to publish products",
      );
    }
  }, [table, refetch]);

  return (
    <Button color="primary" onClick={handlePublish}>
      Publish {approvedCount}
    </Button>
  );
};

// Filter components
interface ProductFiltersProps {
  selectedCompanyId?: string;
  lockedFilters?: {
    company?: boolean;
    location?: boolean;
    brand?: boolean;
  };
}

const ProductFilters = ({
  selectedCompanyId,
  lockedFilters = {},
}: ProductFiltersProps) => {
  return (
    <>
      <StatusFilter module="product" />
      {!lockedFilters.company && <CompanyFilter />}
      {!lockedFilters.brand && (
        <BrandFilter selectedCompanyId={selectedCompanyId} />
      )}
      {!lockedFilters.location && (
        <LocationFilter selectedCompanyId={selectedCompanyId} />
      )}
    </>
  );
};

// Stats component for seller context
const ProductStats = ({ companyId }: { companyId: string }) => {
  const [stats, setStats] = useState(initialStatsData);

  const fetchStats = useCallback(async () => {
    if (!companyId) return;

    try {
      const response = await apiGetProducts({
        page: 1,
        limit: 1000,
        companyId,
      });

      if (response && typeof response === "object" && "data" in response) {
        const responseData = response.data as {
          products: Array<{ status: string; variants?: Array<unknown> }>;
          totalRecords: number;
        };
        const publishedProducts =
          responseData.products?.filter(
            (p: { status: string }) => p.status === "publish",
          ).length || 0;
        const draftProducts =
          responseData.products?.filter(
            (p: { status: string }) => p.status === "draft",
          ).length || 0;
        const totalVariants =
          responseData.products?.reduce(
            (sum: number, product: { variants?: Array<unknown> }) =>
              sum + (product.variants?.length || 0),
            0,
          ) || 0;

        setStats([
          {
            title: "Total Products",
            value: responseData.totalRecords || 0,
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
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchStats();
    }
  }, [fetchStats, companyId]);

  return (
    <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
      {stats.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={formatNumber(item.value)}
          barColor={item.barColor}
        />
      ))}
    </section>
  );
};

// Main component
const ProductList = () => {
  const {
    filters: filterValue,
    lockedFilters,
    lockedFilterValues,
  } = useUrlFilters();
  const selectedCompanyId =
    filterValue.company?.[0]?.value || lockedFilterValues.companyId;
  const productFetcher = useMemo(
    () => createProductFetcher(lockedFilterValues),
    [lockedFilterValues],
  );

  // Check if we're in seller context
  const { sellerInfo } = useSellerAuth();
  const isSellerContext = !!sellerInfo?.companyId;

  return (
    <PageContent
      header={{
        title: "Product Listing",
        description:
          "Manage your product catalog, pricing, descriptions and media assets.",
        actions: (
          <Button color="primary" asChild>
            <NavLink to={PANEL_ROUTES.LISTING.CREATE}>Add Product</NavLink>
          </Button>
        ),
      }}
    >
      {/* Show stats cards only in seller context */}
      {isSellerContext && sellerInfo.companyId && (
        <ProductStats companyId={sellerInfo.companyId} />
      )}

      <DataView<Product>
        fetcher={productFetcher}
        columns={columns}
        renderCard={(product) => <ProductCard product={product} />}
        gridClassName={GRID_CLASSES}
        filters={
          <ProductFilters
            selectedCompanyId={selectedCompanyId}
            lockedFilters={lockedFilters}
          />
        }
        defaultViewMode="table"
        defaultPageSize={DEFAULT_PAGE_SIZE}
        enableUrlSync={false}
        queryKeyPrefix={PANEL_ROUTES.LISTING.LIST}
        searchPlaceholder="Search products..."
        defaultFilters={filterValue}
        additionalControls={<PublishButton />}
      />
    </PageContent>
  );
};

export default ProductList;
