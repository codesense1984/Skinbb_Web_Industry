import { useState, useEffect } from "react";
import { NavLink, useParams, useSearchParams } from "react-router";
import { z } from "zod";
import {
  DataTable,
  createSimpleFetcher,
  useDataViewContext,
} from "@/core/components/data-view";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetProducts } from "@/modules/panel/services/http/product.service";
import { columns } from "@/modules/panel/features/listing/data";
import { CompanyFilter } from "@/modules/panel/features/listing/components/CompanyFilter";
import { LocationFilter } from "@/modules/panel/features/listing/components/LocationFilter";
import { BrandFilter } from "@/modules/panel/features/listing/components/BrandFilter";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import type { Product } from "@/modules/panel/types/product.type";

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
function ProductToolbar() {
  const { setFilter } = useDataViewContext<ProductFilters>();
  const { companyId, locationId, brandId } = useParams();
  const [searchParams] = useSearchParams();
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

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId === "all" ? "" : companyId);
    setSelectedLocationId("");
  };

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId === "all" ? "" : locationId);
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId === "all" ? "all" : brandId);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Company:</span>
        <CompanyFilter
          value={selectedCompanyId}
          onValueChange={handleCompanyChange}
          placeholder="All Companies"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Location:</span>
        <LocationFilter
          companyId={selectedCompanyId}
          value={selectedLocationId}
          onValueChange={handleLocationChange}
          placeholder="All Locations"
          disabled={!selectedCompanyId || selectedCompanyId === "all"}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Brand:</span>
        <BrandFilter
          value={selectedBrandId}
          onValueChange={handleBrandChange}
          placeholder="All Brands"
          companyId={
            selectedCompanyId === "all" ? undefined : selectedCompanyId
          }
        />
      </div>
      <StatusFilter
        tableState={
          {
            table: null,
            setFilter: (key: string, value: any) =>
              setFilter(key as keyof ProductFilters, value),
          } as any
        }
        module="product"
        multi={false}
      />
    </div>
  );
}

const ProductList = () => {
  const { companyId, locationId, brandId } = useParams();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("all");
  const [searchParams] = useSearchParams();

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
      <DataTable<Product, ProductFilters>
        columns={columns}
        fetcher={createProductFetcher(
          selectedCompanyId === "all" ? undefined : selectedCompanyId,
          selectedLocationId === "all" ? undefined : selectedLocationId,
          selectedBrandId === "all" ? undefined : selectedBrandId,
        )}
        filterSchema={productFilterSchema}
        filterFields={filterFields}
        getRowId={(item) => item._id}
        resourceKey={`${PANEL_ROUTES.LISTING.LIST}-${selectedCompanyId}-${selectedLocationId}-${selectedBrandId}`}
        initialState={{
          filters: {
            status: "active",
            category: "general",
          },
          sortBy: "companyName",
          order: "asc",
          page: 1,
          limit: 10,
        }}
        actions={() => <ProductToolbar />}
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </PageContent>
  );
};

export default ProductList;
