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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useParams, useSearchParams } from "react-router";
import { z } from "zod";
import { ActiveFilters } from "./components/ActiveFilters";
import { BrandTableFilter } from "./components/BrandFilter";
import { CompanyTableFilter } from "./components/CompanyFilter";
import { LocationTableFilter } from "./components/LocationFilter";
import { StatusFilterButton } from "./components/StatusFilterButton";
import { columns } from "./data";
import { ProductCard } from "./ProductCard";
import {
  FilterBar,
  type FilterConfig,
  type AppliedFilters,
} from "@/core/components/filters";
import { brandOptionsFetcher } from "./fetchers/brand-options-fetcher";
import { companyOptionsFetcher } from "./fetchers/company-options-fetcher";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

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

// Component to wrap FilterBar with DataView context
function FilterBarContent({
  filters,
  defaultValues,
  onApply,
  showAction = false,
  setCompanyLabel,
  setLocationLabel,
  setBrandLabel,
}: {
  filters: FilterConfig[];
  defaultValues: AppliedFilters;
  onApply: (applied: AppliedFilters) => void;
  showAction?: boolean;
  setCompanyLabel: (label: string) => void;
  setLocationLabel: (label: string) => void;
  setBrandLabel: (label: string) => void;
}) {
  const { state, setFilter } = useDataViewContext<ProductFilters>();

  // Convert DataView filter state to AppliedFilters format for syncing
  // This ensures FilterBar stays in sync when filters are cleared externally
  const syncedDefaultValues = useMemo<AppliedFilters>(() => {
    const synced: AppliedFilters = {};

    // Sync company - if companyId exists in state, use it; otherwise set to null
    if (state.filters?.companyId) {
      const companyId = state.filters.companyId as string;
      const existingCompany = defaultValues.company;
      // If existing company matches the ID, preserve it (keeps the label)
      if (
        existingCompany &&
        (Array.isArray(existingCompany)
          ? existingCompany[0]?.value
          : existingCompany.value) === companyId
      ) {
        synced.company = existingCompany;
      } else {
        // Create placeholder if we don't have the label
        synced.company = { value: companyId, label: companyId };
      }
    } else {
      synced.company = null;
    }

    // Sync brand
    if (state.filters?.brandId) {
      const brandId = state.filters.brandId as string;
      const existingBrand = defaultValues.brand;
      if (
        existingBrand &&
        (Array.isArray(existingBrand)
          ? existingBrand[0]?.value
          : existingBrand.value) === brandId
      ) {
        synced.brand = existingBrand;
      } else {
        synced.brand = { value: brandId, label: brandId };
      }
    } else {
      synced.brand = null;
    }

    // Sync status
    if (state.filters?.status) {
      const statusValue = state.filters.status;
      const statusArray = Array.isArray(statusValue)
        ? statusValue
        : [statusValue];
      const existingStatus = defaultValues.status;

      // Try to match existing status values with labels
      if (existingStatus) {
        const existingArray = Array.isArray(existingStatus)
          ? existingStatus
          : [existingStatus];
        const matched = statusArray.map((s) => {
          const found = existingArray.find((e) => e.value === s);
          return found || { value: String(s), label: String(s) };
        });
        synced.status = matched.length === 1 ? matched[0] : matched;
      } else {
        synced.status = statusArray.map((s) => ({
          value: String(s),
          label: String(s),
        }));
      }
    } else {
      synced.status = null;
    }

    return synced;
  }, [state.filters, defaultValues]);

  const handleFilterApply = useCallback(
    (applied: AppliedFilters) => {
      // Extract values from applied filters
      const company = applied.company
        ? (Array.isArray(applied.company)
            ? applied.company[0]
            : applied.company
          ).value
        : undefined;
      // const location = applied.location
      //   ? (Array.isArray(applied.location)
      //       ? applied.location[0]
      //       : applied.location
      //     ).value
      //   : undefined;
      const brands = applied.brand
        ? (Array.isArray(applied.brand) ? applied.brand : [applied.brand]).map(
            (b) => b.value,
          )
        : undefined;
      const statuses = applied.status
        ? (Array.isArray(applied.status)
            ? applied.status
            : [applied.status]
          ).map((s) => s.value)
        : undefined;

      // Update DataView filters
      setFilter("companyId", company);
      // setFilter("locationId", location);
      setFilter("brandId", brands?.[0]); // DataView expects single brandId
      setFilter("status", statuses);

      // Update labels for display
      if (company && applied.company) {
        setCompanyLabel(
          Array.isArray(applied.company)
            ? applied.company[0].label
            : applied.company.label,
        );
      } else {
        setCompanyLabel("");
      }

      if (location && applied.location) {
        setLocationLabel(
          Array.isArray(applied.location)
            ? applied.location[0].label
            : applied.location.label,
        );
      } else {
        setLocationLabel("");
      }

      if (brands?.[0] && applied.brand) {
        setBrandLabel(
          Array.isArray(applied.brand)
            ? applied.brand.map((b) => b.label).join(", ")
            : applied.brand.label,
        );
      } else {
        setBrandLabel("");
      }

      // Call parent handler
      onApply(applied);
    },
    [setFilter, onApply, setCompanyLabel, setLocationLabel, setBrandLabel],
  );

  return (
    <div className="mb-4">
      <FilterBar
        filters={filters}
        defaultValues={syncedDefaultValues}
        onApply={handleFilterApply}
        showAction={showAction}
      />
    </div>
  );
}

// Filter configuration for FilterBar
const productListFilters: FilterConfig[] = [
  {
    key: "company",
    mode: "single",
    ui: "dropdown",
    data: {
      kind: "remote",
      fetcher: companyOptionsFetcher(),
      pageSize: 10,
      debounceMs: 300,
      minQueryLength: 0,
      queryKey: ["filter-companies"],
    },
    renderButton: ({ isSelected }) => (
      <div
        className={cn(
          "form-control flex w-full items-center justify-between gap-2",
          isSelected && "ring-primary ring-2",
        )}
      >
        Company
        <ChevronDownIcon className="h-4 w-4" />
      </div>
    ),
  },
  // {
  //   key: "location",
  //   label: "Location",
  //   mode: "single",
  //   ui: "dropdown",
  //   data: {
  //     kind: "remote",
  //     fetcher: locationOptionsFetcher(),
  //     pageSize: 10,
  //     debounceMs: 300,
  //     minQueryLength: 0,
  //     queryKey: ["filter-locations"],
  //   },
  //   dependsOn: ["company"],
  //   dependsOnBehavior: "disable+clear", // must select company first
  //   placeholder: "Search locations...",
  // },
  {
    key: "brand",
    // label: "Brand",
    mode: "single",
    ui: "dropdown",
    data: {
      kind: "remote",
      fetcher: brandOptionsFetcher(),
      pageSize: 10,
      debounceMs: 300,
      minQueryLength: 0,
      queryKey: ["filter-brands"],
    },
    dependsOn: ["company"],
    dependsOnBehavior: "disable+clear", // keep enabled; clear when parents change; shows all brands initially
    renderButton: ({ isSelected, disabled }) => (
      <div
        data-disabled={disabled}
        className={cn(
          "form-control flex w-full items-center justify-between gap-2",
          isSelected && "ring-primary ring-2",
        )}
      >
        Brand
        <ChevronDownIcon className="h-4 w-4" />
      </div>
    ),
  },
  {
    key: "status",
    mode: "single",
    ui: "dropdown",
    data: {
      kind: "static",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "draft", label: "Draft" },
        { value: "publish", label: "Publish" },
      ],
    },
    className: "w-fit",
    renderButton: ({ isSelected }) => (
      <div
        className={cn(
          "form-control flex w-full items-center justify-between gap-2",
          isSelected && "ring-primary ring-2",
        )}
      >
        Status
        <ChevronDownIcon className="h-4 w-4" />
      </div>
    ),
  },
];

const ProductList = () => {
  const { companyId, locationId, brandId } = useParams();
  const [searchParams] = useSearchParams();
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

  // FilterBar state - will be used inside DataViewProvider

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

  // Handle FilterBar apply (for URL params sync)
  const handleFilterApply = useCallback((applied: AppliedFilters) => {
    console.log("🚀 ~ ProductList ~ applied:", applied);
    // Extract values for URL params compatibility
    const company = applied.company
      ? (Array.isArray(applied.company) ? applied.company[0] : applied.company)
          .value
      : undefined;
    const location = applied.location
      ? (Array.isArray(applied.location)
          ? applied.location[0]
          : applied.location
        ).value
      : undefined;
    const brands = applied.brand
      ? (Array.isArray(applied.brand) ? applied.brand : [applied.brand]).map(
          (b) => b.value,
        )
      : undefined;

    // Update local state for URL params compatibility
    setSelectedCompanyId(company || "all");
    setSelectedLocationId(location || "all");
    setSelectedBrandId(brands?.[0] || "all");
  }, []);

  // Build default values from URL params
  const defaultFilterValues = useMemo<AppliedFilters>(() => {
    const defaults: AppliedFilters = {};
    if (selectedCompanyId !== "all" && companyLabel) {
      defaults.company = { value: selectedCompanyId, label: companyLabel };
    }
    if (selectedLocationId !== "all" && locationLabel) {
      defaults.location = { value: selectedLocationId, label: locationLabel };
    }
    if (selectedBrandId !== "all" && brandLabel) {
      defaults.brand = [{ value: selectedBrandId, label: brandLabel }];
    }
    return defaults;
  }, [
    selectedCompanyId,
    selectedLocationId,
    selectedBrandId,
    companyLabel,
    locationLabel,
    brandLabel,
  ]);

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
        <FilterBarContent
          filters={productListFilters}
          defaultValues={defaultFilterValues}
          onApply={handleFilterApply}
          showAction={false}
          setCompanyLabel={setCompanyLabel}
          setLocationLabel={setLocationLabel}
          setBrandLabel={setBrandLabel}
        />
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
