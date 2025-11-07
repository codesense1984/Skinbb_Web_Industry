import {
  DataView,
  DataViewProvider,
  createSimpleFetcher,
  useDataViewContext,
} from "@/core/components/data-view";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import type { Option } from "@/core/types";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetProducts } from "@/modules/panel/services/http/product.service";
import type { Product } from "@/modules/panel/types/product.type";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useParams, useSearchParams } from "react-router";
import { z } from "zod";
import { ActiveFilters } from "./components/ActiveFilters";
import { BrandTableFilter } from "./components/BrandFilter";
import { CompanyTableFilter } from "./components/CompanyFilter";
import { LocationTableFilter } from "./components/LocationFilter";
import { StatusFilterButton } from "./components/StatusFilterButton";
import { columns } from "./data";
import { ProductCard } from "./ProductCard";

// Filter schema
const productFilterSchema = z
  .object({
    search: z.string().optional(),
    status: z
      .union([
        z.enum(["active", "inactive", "draft", "publish"]),
        z.array(z.enum(["active", "inactive", "draft", "publish"])),
      ])
      .optional(),
    category: z.string().optional(),
    companyId: z.string().optional(),
    locationId: z.string().optional(),
    brandId: z.string().optional(),
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
    if (data.companyId && data.companyId !== "all") {
      sanitized.companyId = data.companyId;
    }
    if (data.locationId && data.locationId !== "all") {
      sanitized.locationId = data.locationId;
    }
    if (data.brandId && data.brandId !== "all") {
      sanitized.brandId = data.brandId;
    }
    return sanitized;
  });

type ProductFilters = z.infer<typeof productFilterSchema>;

// Create fetcher for server-side data
const createProductFetcher = () => {
  return createSimpleFetcher<Product, ProductFilters>(
    (params: Record<string, unknown>) => {
      // Extract companyId, locationId, brandId from params (they're spread from state.filters)
      const companyId = params.companyId as string | undefined;
      const locationId = params.locationId as string | undefined;
      const brandId = params.brandId as string | undefined;

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
  onCompanyChange: (option: Option) => void;
  onLocationChange: (option: Option) => void;
  onBrandChange: (option: Option) => void;
  hideCompanyFilter?: boolean;
  hideLocationFilter?: boolean;
  hideBrandFilter?: boolean;
  onCompanyLabelChange?: (label: string) => void;
  onLocationLabelChange?: (label: string) => void;
  onBrandLabelChange?: (label: string) => void;
}

function ProductToolbar({
  selectedCompanyId,
  selectedLocationId,
  selectedBrandId,
  onCompanyChange,
  onLocationChange,
  onBrandChange,
  hideCompanyFilter = false,
  hideLocationFilter = false,
  hideBrandFilter = false,
  onCompanyLabelChange,
  onLocationLabelChange,
  onBrandLabelChange,
}: ProductToolbarProps) {
  const { state, setFilter } = useDataViewContext<ProductFilters>();
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  // Get filter values from state
  const companyId = (state.filters?.companyId as string) || selectedCompanyId;
  const locationId =
    (state.filters?.locationId as string) || selectedLocationId;
  const brandId = (state.filters?.brandId as string) || selectedBrandId;

  const handleCompanyChange = (option: Option) => {
    const value = option.value === "all" ? "" : option.value;
    const newValue = value || undefined;
    setFilter("companyId", newValue);
    // Reset location when company changes
    if (newValue !== companyId) {
      setFilter("locationId", undefined);
      onLocationChange({ label: "All", value: "all" });
      onLocationLabelChange?.("");
    }
    // Sync with parent state for URL params
    onCompanyChange(option);
    onCompanyLabelChange?.(String(option.label));
  };

  const handleLocationChange = (option: Option) => {
    const value = option.value === "all" ? "" : option.value;
    const newValue = value || undefined;
    setFilter("locationId", newValue);
    // Sync with parent state for URL params
    onLocationChange(option);
    onLocationLabelChange?.(String(option.label));
  };

  const handleBrandChange = (option: Option) => {
    const value = option.value === "all" ? "" : option.value;
    const newValue = value || undefined;
    setFilter("brandId", newValue);
    // Sync with parent state for URL params
    onBrandChange(option);
    onBrandLabelChange?.(String(option.label));
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <StatusFilterButton<ProductFilters> module="product" multi={true} />

      {!hideCompanyFilter && (
        <CompanyTableFilter
          value={companyId}
          onValueChange={handleCompanyChange}
          placeholder="Company"
        />
      )}

      {!hideLocationFilter && (
        <LocationTableFilter
          companyId={companyId}
          value={locationId || "all"}
          onValueChange={handleLocationChange}
          placeholder="Location"
          disabled={!!companyId}
        />
      )}

      {!hideBrandFilter && (
        <BrandTableFilter
          value={brandId || "all"}
          onValueChange={handleBrandChange}
          placeholder="Brands"
          companyId={companyId === "all" ? undefined : companyId}
        />
      )}
    </div>
  );
}

// Component to display active filters
function ActiveFiltersDisplay({
  module,
  companyLabel,
  locationLabel,
  brandLabel,
  onCompanyLabelClear,
  onLocationLabelClear,
  onBrandLabelClear,
}: {
  module: "product";
  companyLabel?: string;
  locationLabel?: string;
  brandLabel?: string;
  onCompanyLabelClear?: () => void;
  onLocationLabelClear?: () => void;
  onBrandLabelClear?: () => void;
}) {
  const { state, setFilter } = useDataViewContext<ProductFilters>();

  const activeFilters = useMemo(() => {
    const filters: Array<{
      key: string;
      label: string;
      value: string | string[];
      displayValue?: string | string[];
      onRemove: () => void;
    }> = [];

    // Status filter
    if (state.filters?.status) {
      const statusValue = state.filters.status;
      const statusValues = Array.isArray(statusValue)
        ? statusValue
        : [statusValue];

      statusValues.forEach((status) => {
        filters.push({
          key: "status",
          label: "Status",
          value: status,
          onRemove: () => {
            if (Array.isArray(statusValue)) {
              const newStatus = statusValue.filter((s) => s !== status);
              if (newStatus.length > 0) {
                setFilter("status", newStatus);
              } else {
                setFilter("status", undefined);
              }
            } else {
              setFilter("status", undefined);
            }
          },
        });
      });
    }

    // Company filter
    if (state.filters?.companyId) {
      filters.push({
        key: "companyId",
        label: "Company",
        value: state.filters.companyId as string,
        displayValue: companyLabel || state.filters.companyId,
        onRemove: () => {
          setFilter("companyId", undefined);
          // Also clear location when company is removed
          setFilter("locationId", undefined);
          onCompanyLabelClear?.();
          onLocationLabelClear?.();
        },
      });
    }

    // Location filter
    if (state.filters?.locationId) {
      filters.push({
        key: "locationId",
        label: "Location",
        value: state.filters.locationId as string,
        displayValue: locationLabel || state.filters.locationId,
        onRemove: () => {
          setFilter("locationId", undefined);
          onLocationLabelClear?.();
        },
      });
    }

    // Brand filter
    if (state.filters?.brandId) {
      filters.push({
        key: "brandId",
        label: "Brand",
        value: state.filters.brandId as string,
        displayValue: brandLabel || state.filters.brandId,
        onRemove: () => {
          setFilter("brandId", undefined);
          onBrandLabelClear?.();
        },
      });
    }

    return filters;
  }, [
    state.filters,
    setFilter,
    companyLabel,
    locationLabel,
    brandLabel,
    onCompanyLabelClear,
    onLocationLabelClear,
    onBrandLabelClear,
  ]);

  return <ActiveFilters filters={activeFilters} module={module} />;
}

const ProductList = () => {
  const { companyId, locationId, brandId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("all");

  // Store labels for display in active filters
  const [companyLabel, setCompanyLabel] = useState<string>("");
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [brandLabel, setBrandLabel] = useState<string>("");

  // Track which filters came from URL params on mount
  const [hideCompanyFilter, setHideCompanyFilter] = useState(false);
  const [hideLocationFilter, setHideLocationFilter] = useState(false);
  const [hideBrandFilter, setHideBrandFilter] = useState(false);
  const hasInitialized = useRef(false);

  // Auto-fill from URL parameters and track which came from URL
  useEffect(() => {
    if (hasInitialized.current) return; // Only run on mount

    const urlCompanyId = companyId || searchParams.get("companyId");
    const urlLocationId = locationId || searchParams.get("locationId");
    const urlBrandId = brandId || searchParams.get("brandId");

    if (urlCompanyId) {
      setSelectedCompanyId(urlCompanyId);
      setHideCompanyFilter(true);
    }

    if (urlLocationId) {
      setSelectedLocationId(urlLocationId);
      setHideLocationFilter(true);
    }

    if (urlBrandId) {
      setSelectedBrandId(urlBrandId);
      setHideBrandFilter(true);
    }

    hasInitialized.current = true;
  }, [companyId, locationId, brandId, searchParams]);

  // Handlers for filter changes
  const handleCompanyChange = (option: Option) => {
    const newCompanyId = option.value === "all" ? "" : option.value;
    setSelectedCompanyId(newCompanyId);
    setSelectedLocationId(""); // Reset location when company changes
    setLocationLabel(""); // Clear location label when company changes
  };

  const handleLocationChange = (option: Option) => {
    const newLocationId = option.value === "all" ? "" : option.value;
    setSelectedLocationId(newLocationId);
  };

  const handleBrandChange = (option: Option) => {
    const newBrandId = option.value === "all" ? "" : option.value;
    setSelectedBrandId(newBrandId);
  };

  // Memoize the fetcher
  const productFetcher = useMemo(() => createProductFetcher(), []);

  // Memoize external filters - these are now handled via DataView context filters
  // but we keep this for backward compatibility with URL params
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
          filters: {
            ...(selectedCompanyId !== "all" && {
              companyId: selectedCompanyId,
            }),
            ...(selectedLocationId !== "all" && {
              locationId: selectedLocationId,
            }),
            ...(selectedBrandId !== "all" && { brandId: selectedBrandId }),
          },
          sortBy: undefined,
          order: undefined,
          columnVisibility: {},
        }}
        resourceKey="listing"
        syncUrl={false}
      >
        <div className="space-y-4">
          <ActiveFiltersDisplay
            module="product"
            companyLabel={companyLabel}
            locationLabel={locationLabel}
            brandLabel={brandLabel}
            onCompanyLabelClear={() => setCompanyLabel("")}
            onLocationLabelClear={() => setLocationLabel("")}
            onBrandLabelClear={() => setBrandLabel("")}
          />
          <DataView<Product, ProductFilters>
            columns={columns}
            renderCard={(product) => <ProductCard product={product} />}
            fetcher={productFetcher}
            filterSchema={productFilterSchema}
            filterFields={filterFields}
            getRowId={(item) => item._id}
            resourceKey="listing"
            externalFilters={externalFilters}
            actions={() => (
              <ProductToolbar
                selectedCompanyId={selectedCompanyId}
                selectedLocationId={selectedLocationId}
                selectedBrandId={selectedBrandId}
                onCompanyChange={handleCompanyChange}
                onLocationChange={handleLocationChange}
                onBrandChange={handleBrandChange}
                hideCompanyFilter={hideCompanyFilter}
                hideLocationFilter={hideLocationFilter}
                hideBrandFilter={hideBrandFilter}
                onCompanyLabelChange={setCompanyLabel}
                onLocationLabelChange={setLocationLabel}
                onBrandLabelChange={setBrandLabel}
              />
            )}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      </DataViewProvider>
    </PageContent>
  );
};

export default ProductList;
