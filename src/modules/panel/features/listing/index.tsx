import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetProducts } from "@/modules/panel/services/http/product.service";
import { NavLink } from "react-router";
import { columns } from "./data";
import { CompanyFilter } from "./components/CompanyFilter";
import { LocationFilter } from "./components/LocationFilter";
import { BrandFilter } from "./components/BrandFilter";
import CatalogList from "./CatalogList";
import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { SegmentedControl } from "@/core/components/ui/segmented-control";
import { Package, FileText } from "lucide-react";

// Create fetcher for server-side data
const createProductFetcher = (companyId?: string, locationId?: string, brandId?: string) => {
  return createSimpleFetcher(
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
    }
  );
};

const ProductList = () => {
  const { companyId, locationId, brandId } = useParams();
  const [searchParams] = useSearchParams();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"products" | "catalogs">("products");

  // Handle company filter change
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId === "all" ? "" : companyId);
    setSelectedLocationId(""); // Reset location when company changes
  };

  // Handle location filter change
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId === "all" ? "" : locationId);
  };

  // Handle brand filter change
  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId === "all" ? "all" : brandId);
  };

  // Auto-fill from URL parameters
  React.useEffect(() => {
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
          <div className="flex gap-2">
            <Button color={"primary"} asChild>
              <NavLink to={PANEL_ROUTES.LISTING.CREATE}>Add Product</NavLink>
            </Button>
            <Button color={"secondary"} asChild>
              <NavLink to={PANEL_ROUTES.LISTING.CATALOG}>Add Catalog</NavLink>
            </Button>
          </div>
        ),
      }}
    >
      {/* View Mode Toggle */}
      <div className="mb-6">
        <SegmentedControl
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "products" | "catalogs")}
          options={[
            {
              value: "products",
              label: "Single Products",
              icon: <Package className="h-4 w-4" />,
            },
            {
              value: "catalogs",
              label: "Catalog List",
              icon: <FileText className="h-4 w-4" />,
            },
          ]}
        />
      </div>

      {/* Conditional Content */}
      {viewMode === "catalogs" ? (
        <CatalogList isAdminPanel={true} />
      ) : (
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
              selectedBrandId === "all" ? undefined : selectedBrandId
            )}
            queryKeyPrefix={`${PANEL_ROUTES.LISTING.LIST}-${selectedCompanyId === "all" ? "" : selectedCompanyId}-${selectedLocationId === "all" ? "" : selectedLocationId}-${selectedBrandId === "all" ? "" : selectedBrandId}`}
            actionProps={(tableState) => ({
              children: (
                <div className="flex items-center gap-4">
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
                      disabled={!selectedCompanyId}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Brand:</span>
                    <BrandFilter
                      value={selectedBrandId}
                      onValueChange={handleBrandChange}
                      placeholder="All Brands"
                      companyId={selectedCompanyId === "all" ? undefined : selectedCompanyId}
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
        </>
      )}
    </PageContent>
  );
};

export default ProductList;
