import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { STATUS_MAP } from "@/core/config/status";
import { capitalize, cn } from "@/core/utils";
import {
  FilterDataItem,
  FilterProvider,
  type FilterOption,
} from "@/core/components/dynamic-filter";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetProducts } from "@/modules/panel/services/http/product.service";
import { XCircleIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { NavLink, useParams, useSearchParams } from "react-router";
import { apiGetBrands } from "../../services/http/brand.service";
import { apiGetCompaniesForFilter } from "../../services/http/company.service";
import type { Brand, Company } from "../../types";
import { BrandFilter } from "./components/BrandFilter";
import { CompanyFilter } from "./components/CompanyFilter";
import { LocationFilter } from "./components/LocationFilter";
import { columns } from "./data";
import { FilterBadges } from "@/core/components/dynamic-filter/filter-badges";

// Create fetcher for server-side data
const createProductFetcher = (
  companyId?: string,
  locationId?: string,
  brandId?: string,
  status?: string,
) => {
  return createSimpleFetcher(
    (params: Record<string, unknown>) => {
      // Add our custom filter parameters to the API call
      const filterParams = {
        ...params,
        ...(companyId && companyId !== "all" && { companyId }),
        ...(locationId && locationId !== "all" && { locationId }),
        ...(brandId && brandId !== "all" && { brand: brandId }),
        ...(status && status !== "all" && { status }),
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
  console.log("🚀 ~ ProductList ~ filterValue:", filterValue);

  const { companyId, locationId, brandId } = useParams();
  const [searchParams] = useSearchParams();

  const selectedCompanyId = filterValue.company?.[0]?.value;
  console.log("🚀 ~ ProductList ~ selectedCompanyId:", selectedCompanyId);
  const selectedLocationId = filterValue.location?.[0]?.value;
  const selectedBrandId = filterValue.brand?.[0]?.value;
  const selectedStatus = filterValue.status?.[0]?.value;
  // const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  // const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  // const [selectedBrandId, setSelectedBrandId] = useState<string>("all");

  // Handle company filter change
  // const handleCompanyChange = (companyId: string) => {
  //   setSelectedCompanyId(companyId === "all" ? "" : companyId);
  //   setSelectedLocationId(""); // Reset location when company changes
  // };

  // // Handle location filter change
  // const handleLocationChange = (locationId: string) => {
  //   setSelectedLocationId(locationId === "all" ? "" : locationId);
  // };

  // // Handle brand filter change
  // const handleBrandChange = (brandId: string) => {
  //   setSelectedBrandId(brandId === "all" ? "all" : brandId);
  // };

  // Auto-fill from URL parameters
  React.useEffect(() => {
    const urlCompanyId = companyId || searchParams.get("companyId");
    const urlLocationId = locationId || searchParams.get("locationId");
    const urlBrandId = brandId || searchParams.get("brandId");

    setFilterValue((prev) => ({
      ...prev,
      companyId: urlCompanyId
        ? [{ label: "Company", value: urlCompanyId }]
        : [],
      locationId: urlLocationId
        ? [{ label: "Location", value: urlLocationId }]
        : [],
      brandId: urlBrandId ? [{ label: "Brand", value: urlBrandId }] : [],
    }));

    // if (urlCompanyId) {
    //   setSelectedCompanyId(urlCompanyId);
    // }

    // if (urlLocationId) {
    //   setSelectedLocationId(urlLocationId);
    // }

    // if (urlBrandId) {
    //   setSelectedBrandId(urlBrandId);
    // }
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
        <div className="flex items-center gap-2">
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
                selectedCompanyId === "all" ? undefined : selectedCompanyId,
              ),
              transform: (item) => {
                return {
                  label: item.name,
                  value: item._id ?? "",
                };
              },
              queryKey: ["company-brand-filter"],
              pageSize: 10,
            }}
          />
        </div>
        <FilterBadges filters={filterValue} setFilterValue={setFilterValue} />
      </FilterProvider>
      {/* <FilterDemo /> */}
      {/* Product Content */}
      <>
        {/* <section
            className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4"
            aria-label="Product Statistics"
          >
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
          fetcher={createProductFetcher(
            selectedCompanyId === "all" ? undefined : selectedCompanyId,
            selectedLocationId === "all" ? undefined : selectedLocationId,
            selectedBrandId === "all" ? undefined : selectedBrandId,
            selectedStatus,
          )}
          queryKeyPrefix={`${PANEL_ROUTES.LISTING.LIST}-${selectedCompanyId === "all" ? "" : selectedCompanyId}-${selectedLocationId === "all" ? "" : selectedLocationId}-${selectedBrandId === "all" ? "" : selectedBrandId}-${selectedStatus ?? ""}`}
        />
      </>
    </PageContent>
  );
};

export default ProductList;
