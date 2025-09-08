import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { PageContent } from "@/core/components/ui/structure";
import { useParams, useNavigate } from "react-router";
import { columns } from "./data.tsx";
import { apiGetCompanyDetailsForOnboarding, apiGetCompanyUsers } from "@/modules/panel/services/http/company.service";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { Button } from "@/core/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";

// Create fetcher for server-side data
const fetcher = (companyId: string) => createSimpleFetcher(
  async (params: any) => {
    try {
      // First, try to get company users from the dedicated API
      const usersResponse = await apiGetCompanyUsers(companyId, params);
      
      console.log("Company users API response:", usersResponse);
      
      if (usersResponse?.data?.items && usersResponse.data.items.length > 0) {
        console.log("Using company users API data:", usersResponse.data.items);
        
        // Transform the API response to match the expected user list format
        const transformedItems = usersResponse.data.items.map((item: any) => ({
          _id: item._id,
          firstName: item.user?.firstName || '',
          lastName: item.user?.lastName || '',
          email: item.user?.email || '',
          phoneNumber: item.user?.phoneNumber || '',
          roleId: item.role?.label || item.roleId || '',
          active: item.active,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          // Keep original data for reference
          originalData: item
        }));
        
        console.log("Transformed user data:", transformedItems);
        
        return {
          ...usersResponse,
          data: {
            ...usersResponse.data,
            items: transformedItems
          }
        };
      } else {
        console.log("Company users API returned empty data, falling back to owner extraction");
      }
    } catch (error) {
      console.log("Company users API failed, falling back to owner extraction:", error);
    }

    // Fallback: Get company details to extract owner information
    try {
      const companyResponse = await apiGetCompanyDetailsForOnboarding(companyId);
      const company = companyResponse?.data?.company;
      
      console.log("Company API Response:", companyResponse);
      console.log("Company Object:", company);
      console.log("Company Owner:", company?.owner);
      
      if (!company?.owner) {
        return {
          data: {
            items: [],
            page: 1,
            limit: 10,
            total: 0
          }
        };
      }

      // Transform owner data to match user list format
      const fullName = company.owner.ownerUser || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      console.log("Owner data transformation:", {
        fullName,
        nameParts,
        firstName,
        lastName,
        owner: company.owner
      });
      
      const ownerUser = {
        _id: company.owner.ownerUserId,
        firstName: firstName,
        lastName: lastName,
        email: company.owner.ownerEmail,
        phoneNumber: company.owner.ownerPhone,
        roleId: 'Owner', // Default role for company owner
        active: true, // Assume owner is always active
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      };

      return {
        data: {
          items: [ownerUser],
          page: 1,
          limit: 10,
          total: 1
        }
      };
    } catch (error) {
      console.error("Failed to get company details:", error);
      return {
        data: {
          items: [],
          page: 1,
          limit: 10,
          total: 0
        }
      };
    }
  },
  {
    dataPath: "data.items",
    totalPath: "data.total",
    filterMapping: {
      query: "query",
    },
  }
);

const CompanyUsersList = () => {
  const { id: companyId } = useParams();
  const navigate = useNavigate();

  if (!companyId) {
    return (
      <PageContent
        header={{
          title: "Company Users",
          description: "Company ID is required to view users.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid company ID provided.</p>
        </div>
      </PageContent>
    );
  }

  // Fetch company details to show company name in header
  const { data: companyData } = useQuery({
    queryKey: ["company-details", companyId],
    queryFn: () => apiGetCompanyDetailsForOnboarding(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Handle both possible response structures
  const response = companyData as any;
  const companyName = response?.data?.company?.companyName || 
                      response?.company?.companyName || 
                      `Company ${companyId}`;

  return (
    <PageContent
      header={{
        title: `${companyName} - Users`,
        description: `Manage users for ${companyName}`,
        actions: (
          <Button 
            onClick={() => navigate(PANEL_ROUTES.COMPANY.USER_CREATE(companyId))}
            variant="contained"
            color="secondary"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add User
          </Button>
        ),
      }}
    >
      <DataTable
        columns={columns(companyId)}
        isServerSide
        fetcher={fetcher(companyId)}
        queryKeyPrefix={PANEL_ROUTES.COMPANY.USERS(companyId)}
      />
    </PageContent>
  );
};

export default CompanyUsersList;
