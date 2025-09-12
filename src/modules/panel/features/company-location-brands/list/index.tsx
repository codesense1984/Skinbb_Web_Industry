import { DataTable } from "@/core/components/data-table";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetCompanyLocationBrands } from "@/modules/panel/services/http/company.service";
import type { CompanyLocationBrand } from "@/modules/panel/types/brand.type";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { columns } from "./data";


const CompanyLocationBrandsList = () => {
  const { companyId, locationId } = useParams();
  const navigate = useNavigate();

  // Fetch brands for the specific company location
  const { data: brandsData, isLoading, error } = useQuery({
    queryKey: ["company-location-brands", companyId, locationId],
    queryFn: () => apiGetCompanyLocationBrands(companyId!, locationId!),
    enabled: !!companyId && !!locationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (!companyId || !locationId) {
    return (
      <PageContent
        header={{
          title: "Brands",
          description:
            "Company ID and Location ID are required to view brands.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">
            Invalid company or location ID provided.
          </p>
        </div>
      </PageContent>
    );
  }

  // Extract brands array from the API response
  // API response structure: { statusCode: 200, data: [...], message: "...", success: true }
  const rawBrands = Array.isArray(brandsData?.data) ? brandsData.data : [];
  
  // Transform brands to include location information and ensure data safety
  const brands = rawBrands.map((brand: CompanyLocationBrand) => ({
    ...brand,
    locationId: locationId!,
    locationType: "unknown",
    locationCity: "Location",
    locationState: "unknown",
   
    // Ensure productCategory is always an array
    productCategory: Array.isArray(brand.productCategory)
      ? brand.productCategory
      : [],
    // Ensure sellingOn is always an array
    sellingOn: Array.isArray(brand.sellingOn) ? brand.sellingOn : [],
    // Ensure numeric fields are numbers
    totalSKU: Number(brand.totalSKU) || 0,
    averageSellingPrice: Number(brand.averageSellingPrice) || 0,
    marketingBudget: Number(brand.marketingBudget) || 0,
  }));

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "Brands",
          description: "Loading brands...",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Loading brands...</p>
        </div>
      </PageContent>
    );
  }

  if (error) {
    return (
      <PageContent
        header={{
          title: "Brands",
          description: "Error loading brands",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-red-500 mb-4">Error loading brands. Please try again.</p>
          <p className="text-sm text-gray-500 mb-4">
            Error details: {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm text-gray-600">
              <strong>API Response:</strong>{" "}
              {JSON.stringify(brandsData, null, 2)}
            </p>
          </div>
          <p className="mb-4 text-sm text-gray-400">
            Location ID: {locationId}
          </p>
          <Button
            onClick={() =>
              navigate(PANEL_ROUTES.COMPANY_LOCATION.LIST(companyId))
            }
            variant="outlined"
          >
            Back to Locations
          </Button>
        </div>
      </PageContent>
    );
  }

  // Show empty state if no brands found
  if (brands.length === 0) {
    return (
      <PageContent
        header={{
          title: "Brands",
          description: "Manage brands for this location",
          actions: (
            <Button
              onClick={() =>
                navigate(
                  PANEL_ROUTES.COMPANY_LOCATION.BRAND_CREATE(
                    companyId,
                    locationId,
                  ),
                )
              }
              variant="contained"
              color="secondary"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          ),
        }}
      >
        <div className="py-8 text-center">
          <div className="mb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Brands Found</h3>
            <p className="text-gray-500 mb-4">
              This location doesn&apos;t have any brands yet. Create your first brand to get started.
            </p>
            <p className="mb-6 text-sm text-gray-400">
              Location ID: {locationId}
            </p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() =>
                  navigate(PANEL_ROUTES.COMPANY_LOCATION.LIST(companyId))
                }
                variant="outlined"
              >
                Back to Locations
              </Button>
              <Button
                onClick={() =>
                  navigate(
                    PANEL_ROUTES.COMPANY_LOCATION.BRAND_CREATE(
                      companyId,
                      locationId,
                    ),
                  )
                }
                variant="contained"
                color="secondary"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add First Brand
              </Button>
            </div>
          </div>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: "Brands",
        description: "Manage brands for this location",
        actions: (
          <Button
            onClick={() =>
              navigate(
                PANEL_ROUTES.COMPANY_LOCATION.BRAND_CREATE(
                  companyId,
                  locationId,
                ),
              )
            }
            variant="contained"
            color="secondary"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        ),
      }}
    >
      <div className="space-y-4">
        <DataTable
          columns={columns(companyId, locationId)}
          rows={brands}
          isServerSide={true}
          queryKeyPrefix={PANEL_ROUTES.COMPANY_LOCATION.BRANDS(
            companyId,
            locationId,
          )}
          actionProps={(tableState) => ({
            children: (
              <StatusFilter
                tableState={tableState}
                module="brand"
                multi={false} // Single selection mode
              />
            ),
          })}
        />
      </div>
    </PageContent>
  );
};

export default CompanyLocationBrandsList;
