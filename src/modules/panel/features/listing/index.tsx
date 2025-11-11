import {
  DataView,
  useDataView,
  type ServerDataFetcher,
} from "@/core/components/data-view";
import type { FilterOption } from "@/core/components/dynamic-filter";
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
import { columns } from "./data";
import { ProductCard } from "./ProductCard";
import {
  DEFAULT_PAGE_SIZE,
  StatusFilter,
  CompanyFilter,
  BrandFilter,
} from "@/modules/panel/components/data-view";

// Constants
const GRID_CLASSES = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3";

type ProductFilters = {
  status: FilterOption[];
  company: FilterOption[];
  brand: FilterOption[];
  location: FilterOption[];
};

// Product fetcher for DataView component
const createProductFetcher = (): ServerDataFetcher<Product> => {
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

    // Map filters to API params
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
  const [filters, setFilters] = useState<ProductFilters>({
    status: [],
    company: [],
    brand: [],
    location: [],
  });

  useEffect(() => {
    const urlCompanyId = companyId || searchParams.get("companyId");
    const urlLocationId = locationId || searchParams.get("locationId");
    const urlBrandId = brandId || searchParams.get("brandId");

    if (urlCompanyId || urlLocationId || urlBrandId) {
      setFilters((prev) => ({
        ...prev,
        company: urlCompanyId
          ? [{ label: "Company", value: urlCompanyId, disabled: false }]
          : prev.company,
        location: urlLocationId
          ? [{ label: "Location", value: urlLocationId, disabled: false }]
          : prev.location,
        brand: urlBrandId
          ? [{ label: "Brand", value: urlBrandId }]
          : prev.brand,
      }));
    }
  }, [companyId, locationId, brandId, searchParams]);

  return filters;
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
    (product) => product.status === "approved"
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
      (product) => product.status === "approved"
    );

    if (approvedProducts.length === 0) {
      toast.error("Only approved products can be published");
      return;
    }

    const productIds = approvedProducts.map((p) => p._id);
    console.log("Selected approved products to publish:", approvedProducts);

    try {
      await apiPublishBulkProducts(productIds);
      
      toast.success(`Successfully published ${approvedProducts.length} product(s)`);

      // Clear row selection
      table.resetRowSelection();

      // Refetch the table data
      await refetch();
    } catch (error: any) {
      console.error("Error publishing products:", error);
      toast.error(
        error?.response?.data?.message || "Failed to publish products"
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
}

const ProductFilters = ({ selectedCompanyId }: ProductFiltersProps) => {
  return (
    <>
      <StatusFilter module="product" />
      <CompanyFilter />
      <BrandFilter selectedCompanyId={selectedCompanyId} />
      {/* Location filter can be added here if needed */}
    </>
  );
};

// Main component
const ProductList = () => {
  const filterValue = useUrlFilters();
  const selectedCompanyId = filterValue.company?.[0]?.value;
  const productFetcher = useMemo(() => createProductFetcher(), []);

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
      <DataView<Product>
        fetcher={productFetcher}
        columns={columns}
        renderCard={(product) => <ProductCard product={product} />}
        gridClassName={GRID_CLASSES}
        filters={<ProductFilters selectedCompanyId={selectedCompanyId} />}
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
