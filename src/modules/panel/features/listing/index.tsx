import {
  DataView,
  DataViewProvider,
  StatusFilter,
  createSimpleFetcher,
} from "@/core/components/data-view";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetProducts } from "@/modules/panel/services/http/product.service";
import type { Product } from "@/modules/panel/types/product.type";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useParams, useSearchParams } from "react-router";
import { z } from "zod";
import { BrandFilter } from "./components/BrandFilter";
import { CompanyFilter } from "./components/CompanyFilter";
import { LocationFilter } from "./components/LocationFilter";
import { columns } from "./data";
import { ProductCard } from "./ProductCard";

// Filter schema
const productFilterSchema = z
  .object({
    search: z.string().optional(),
    status: z.enum(["active", "inactive", "draft", "publish"]).optional(),
    category: z.string().optional(),
  })
  .transform((data) => {
    // Auto-sanitize: trim strings, transform empty strings to undefined
    const sanitized: any = {};
    if (data.search && data.search.trim()) {
      sanitized.search = data.search.trim();
    }
    if (data.status) {
      sanitized.status = data.status;
    }
    if (data.category && data.category !== "all") {
      sanitized.category = data.category;
    }
    return sanitized;
  });

type ProductFilters = z.infer<typeof productFilterSchema>;

// Create fetcher for server-side data
const createProductFetcher = (
  companyId?: string,
  locationId?: string,
  brandId?: string,
) => {
  return createSimpleFetcher<Product, ProductFilters>(
    (params: Record<string, unknown>) => {
      // Add our custom filter parameters to the API call
      const filterParams = {
        ...params,
        ...(companyId && companyId !== "all" && { companyId }),
        ...(locationId && locationId !== "all" && { locationId }),
        ...(brandId && brandId !== "all" && { brand: brandId }),
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
        companyId: "companyId",
        locationId: "locationId",
        brandId: "brand",
      },
    },
  );
};

// Filter fields config
const filterFields = [
  {
    key: "search" as const,
    type: "text" as const,
    label: "Search",
    placeholder: "Search products...",
  },
  {
    key: "status" as const,
    type: "select" as const,
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Draft", value: "draft" },
      { label: "Publish", value: "publish" },
    ],
  },
  {
    key: "category" as const,
    type: "select" as const,
    label: "Category",
    options: [
      { label: "General", value: "general" },
      { label: "All", value: "all" },
    ],
  },
];

// External Toolbar Component
interface ProductToolbarProps {
  selectedCompanyId: string;
  selectedLocationId: string;
  selectedBrandId: string;
  onCompanyChange: (companyId: string) => void;
  onLocationChange: (locationId: string) => void;
  onBrandChange: (brandId: string) => void;
}

function ProductToolbar({
  selectedCompanyId,
  selectedLocationId,
  selectedBrandId,
  onCompanyChange,
  onLocationChange,
  onBrandChange,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Company:</span>
        <CompanyFilter
          value={selectedCompanyId}
          onValueChange={onCompanyChange}
          placeholder="All Companies"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Location:</span>
        <LocationFilter
          companyId={selectedCompanyId}
          value={selectedLocationId}
          onValueChange={onLocationChange}
          placeholder="All Locations"
          disabled={!selectedCompanyId || selectedCompanyId === "all"}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Brand:</span>
        <BrandFilter
          value={selectedBrandId}
          onValueChange={onBrandChange}
          placeholder="All Brands"
          companyId={
            selectedCompanyId === "all" ? undefined : selectedCompanyId
          }
        />
      </div>
      <StatusFilter<ProductFilters> module="product" multi={false} />
    </div>
  );
}

const ProductList = () => {
  const { companyId, locationId, brandId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("all");

  // Auto-fill from URL parameters
  useEffect(() => {
    const urlCompanyId = companyId || searchParams.get("companyId");
    const urlLocationId = locationId || searchParams.get("locationId");
    const urlBrandId = brandId || searchParams.get("brandId");

    if (urlCompanyId) {
      setSelectedCompanyId(urlCompanyId);
    }

    if (urlLocationId) {
      setSelectedLocationId(urlLocationId);
    }

    if (urlBrandId) {
      setSelectedBrandId(urlBrandId);
    }
  }, [companyId, locationId, brandId, searchParams]);

  // Handlers for filter changes
  const handleCompanyChange = (companyId: string) => {
    const newCompanyId = companyId === "all" ? "" : companyId;
    setSelectedCompanyId(newCompanyId);
    setSelectedLocationId(""); // Reset location when company changes

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (newCompanyId) {
      newParams.set("companyId", newCompanyId);
    } else {
      newParams.delete("companyId");
    }
    newParams.delete("locationId"); // Remove location when company changes
    setSearchParams(newParams, { replace: true });
  };

  const handleLocationChange = (locationId: string) => {
    const newLocationId = locationId === "all" ? "" : locationId;
    setSelectedLocationId(newLocationId);

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (newLocationId) {
      newParams.set("locationId", newLocationId);
    } else {
      newParams.delete("locationId");
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleBrandChange = (brandId: string) => {
    const newBrandId = brandId === "all" ? "" : brandId;
    setSelectedBrandId(brandId);

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (newBrandId) {
      newParams.set("brandId", newBrandId);
    } else {
      newParams.delete("brandId");
    }
    setSearchParams(newParams, { replace: true });
  };

  // Memoize the fetcher to recreate it when filter values change
  const productFetcher = useMemo(
    () =>
      createProductFetcher(
        selectedCompanyId === "all" ? undefined : selectedCompanyId,
        selectedLocationId === "all" ? undefined : selectedLocationId,
        selectedBrandId === "all" ? undefined : selectedBrandId,
      ),
    [selectedCompanyId, selectedLocationId, selectedBrandId],
  );

  // Memoize external filters to prevent unnecessary re-renders
  const externalFilters = useMemo(
    () => ({
      companyId: selectedCompanyId === "all" ? undefined : selectedCompanyId,
      locationId: selectedLocationId === "all" ? undefined : selectedLocationId,
      brandId: selectedBrandId === "all" ? undefined : selectedBrandId,
    }),
    [selectedCompanyId, selectedLocationId, selectedBrandId],
  );

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
      <DataViewProvider
        initialState={{
          view: "table",
          page: 1,
          limit: 10,
          search: "",
          filters: {},
          sortBy: undefined,
          order: undefined,
          columnVisibility: {},
        }}
        resourceKey="listing"
        syncUrl={true}
      >
        <DataView<Product, ProductFilters>
          columns={columns}
          renderCard={(product) => <ProductCard product={product} />}
          fetcher={productFetcher}
          filterSchema={productFilterSchema}
          filterFields={filterFields}
          getRowId={(item) => item._id}
          resourceKey="listing"
          initialState={{
            page: 1,
            limit: 10,
          }}
          externalFilters={externalFilters}
          actions={() => (
            <ProductToolbar
              selectedCompanyId={selectedCompanyId}
              selectedLocationId={selectedLocationId}
              selectedBrandId={selectedBrandId}
              onCompanyChange={handleCompanyChange}
              onLocationChange={handleLocationChange}
              onBrandChange={handleBrandChange}
            />
          )}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </DataViewProvider>
    </PageContent>
  );
};

export default ProductList;
