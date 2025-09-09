import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { PageContent } from "@/core/components/ui/structure";
import { useParams, useNavigate } from "react-router";
import { columns } from "./data.tsx";
import { apiGetCompanyDetailsForOnboarding, apiGetCompanyUsers } from "@/modules/panel/services/http/company.service";
import { apiGetSellerMembers } from "@/modules/panel/services/http/user.service";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { Button } from "@/core/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";

// Create fetcher for server-side data
const fetcher = (companyId: string) => createSimpleFetcher(
  async (params: any) => {
    try {
      // First, try to get company users from the dedicated API
      // Add createdAt parameter to fetch creation dates
      const apiParams = {
        ...params,
        createdAt: true // Request creation date from backend
      };
      const usersResponse = await apiGetCompanyUsers(companyId, apiParams);
      
      console.log("Company users API response:", usersResponse);
      console.log("API response structure:", JSON.stringify(usersResponse, null, 2));
      
      if (usersResponse?.data?.items && usersResponse.data.items.length > 0) {
        console.log("Using company users API data:", usersResponse.data.items);
        console.log("First item structure:", JSON.stringify(usersResponse.data.items[0], null, 2));
        
        // Transform the API response to match the expected user list format
        const transformedItems = usersResponse.data.items.map((item: any) => {
          console.log("Raw item data:", item);
          
          return {
            _id: item.userId || item.user?._id || item._id || '',
            firstName: item.user?.firstName || item.firstName || '',
            lastName: item.user?.lastName || item.lastName || '',
            email: item.user?.email || item.email || '',
            phoneNumber: item.user?.phoneNumber || item.phoneNumber || '',
            roleId: item.roleValue || item.role?.label || item.role?.name || item.roleId || '',
            active: item.active !== undefined ? item.active : (item.user?.active !== undefined ? item.user.active : true), // Default to true if not specified
            createdAt: item.createdAt || item.user?.createdAt || '', // Let backend provide the date
            updatedAt: item.updatedAt || item.user?.updatedAt || '',
            // Keep original data for reference
            originalData: item
          };
        });
        
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
      console.log("Company users API failed, trying seller members API:", error);
      
      // Try seller members API as second fallback
      try {
        const sellerMembersResponse = await apiGetSellerMembers(params);
        console.log("Seller members API response:", sellerMembersResponse);
        
        if (sellerMembersResponse?.data?.items && sellerMembersResponse.data.items.length > 0) {
          console.log("Using seller members API data:", sellerMembersResponse.data.items);
          
          // Transform seller members data
          const transformedItems = sellerMembersResponse.data.items.map((item: any) => ({
            _id: item._id,
            firstName: item.firstName || '',
            lastName: item.lastName || '',
            email: item.email || '',
            phoneNumber: item.phoneNumber || '',
            roleId: item.roleId || '',
            active: item.active !== undefined ? item.active : true, // Default to true if not specified
            createdAt: item.createdAt || '', // Let backend provide the date
            updatedAt: item.updatedAt || '',
            originalData: item
          }));
          
          return {
            ...sellerMembersResponse,
            data: {
              ...sellerMembersResponse.data,
              items: transformedItems
            }
          };
        }
      } catch (sellerError) {
        console.log("Seller members API also failed, falling back to owner extraction:", sellerError);
      }
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
        roleId: company.owner.ownerDesignation || 'Owner', // Use designation or default to Owner
        active: true, // Assume owner is always active
        createdAt: company.createdAt || new Date().toISOString(),
        updatedAt: company.updatedAt || new Date().toISOString()
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
        title: "Users",
        description: "Manage company users",
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
      <div className="space-y-4">

        <DataTable
        tableHeading={companyName}
          columns={columns(companyId)}
          isServerSide
          fetcher={fetcher(companyId)}
          queryKeyPrefix={PANEL_ROUTES.COMPANY.USERS(companyId)}
        />
      </div>
    </PageContent>
  );
};

export default CompanyUsersList;
