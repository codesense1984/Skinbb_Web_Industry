import { useParams, useNavigate } from 'react-router';
import { DataTable } from "@/core/components/data-table";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/solid";
import { apiGetCompanyLocationBrands } from "@/modules/panel/services/http/company.service";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./data";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";


const CompanyLocationBrandsList = () => {
  const { companyId, locationId } = useParams();
  const navigate = useNavigate();

  if (!companyId || !locationId) {
    return (
      <PageContent
        header={{
          title: "Brands",
          description: "Company ID and Location ID are required to view brands.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid company or location ID provided.</p>
        </div>
      </PageContent>
    );
  }

  // Fetch brands for the specific company location
  const { data: brandsData, isLoading, error } = useQuery({
    queryKey: ["company-location-brands", companyId, locationId],
    queryFn: () => apiGetCompanyLocationBrands(companyId!, locationId!),
    enabled: !!companyId && !!locationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Debug logging to see the actual API response structure
  console.log("Brands API Response:", brandsData);
  
  // Extract brands array from the API response
  // API response structure: { statusCode: 200, data: { status: "success", data: [...] }, message: "...", success: true }
  const rawBrands = brandsData?.data?.data || [];
  
  // Transform brands to include location information
  const brands = rawBrands.map((brand: any) => ({
    ...brand,
    locationId: locationId!,
    locationType: 'unknown',
    locationCity: 'Location',
    locationState: 'unknown',
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
            Error details: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>API Response:</strong> {JSON.stringify(brandsData, null, 2)}
            </p>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Location ID: {locationId}
          </p>
          <Button 
            onClick={() => navigate(PANEL_ROUTES.COMPANY_LOCATION.LIST(companyId))}
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
              onClick={() => navigate(PANEL_ROUTES.COMPANY_LOCATION.BRAND_CREATE(companyId, locationId))}
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
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Brands Found</h3>
            <p className="text-gray-500 mb-4">
              This location doesn't have any brands yet. Create your first brand to get started.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Location ID: {locationId}
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => navigate(PANEL_ROUTES.COMPANY_LOCATION.LIST(companyId))}
                variant="outlined"
              >
                Back to Locations
              </Button>
              <Button 
                onClick={() => navigate(PANEL_ROUTES.COMPANY_LOCATION.BRAND_CREATE(companyId, locationId))}
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
            onClick={() => navigate(PANEL_ROUTES.COMPANY_LOCATION.BRAND_CREATE(companyId, locationId))}
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
          isServerSide={false}
          queryKeyPrefix={PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId, locationId)}
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
